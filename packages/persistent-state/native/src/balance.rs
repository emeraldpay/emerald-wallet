use std::str::FromStr;
use chrono::{DateTime, Utc};
use emerald_vault::blockchain::bitcoin::XPub;
use neon::prelude::{FunctionContext, JsString};
use num_bigint::BigUint;
use emerald_wallet_state::access::balance::{Balance, Balances, Utxo};
use emerald_wallet_state::access::xpubpos::XPubPosition;
use crate::errors::StateManagerError;
use crate::instance::Instance;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct BalanceJson {
  amount: String,
  // optional because it's not set when a new value added
  #[serde(rename = "timestamp")]
  ts: Option<DateTime<Utc>>,
  address: String,
  blockchain: u32,
  asset: String,
  #[serde(default)]
  utxo: Vec<UtxoJson>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct UtxoJson {
  txid: String,
  vout: u32,
  amount: String,
}

impl From<&Balance> for BalanceJson {
  fn from(value: &Balance) -> Self {
    BalanceJson {
      amount: value.amount.to_string(),
      ts: Some(value.ts),
      address: value.address.clone(),
      blockchain: value.blockchain,
      asset: value.asset.clone(),
      utxo: value.utxo.iter().map(|u| u.into()).collect()
    }
  }
}

impl From<&Utxo> for UtxoJson {
  fn from(value: &Utxo) -> Self {
    UtxoJson {
      amount: value.amount.to_string(),
      txid: value.txid.clone(),
      vout: value.vout,
    }
  }
}

impl TryFrom<BalanceJson> for Balance {
  type Error = StateManagerError;

  fn try_from(value: BalanceJson) -> Result<Self, Self::Error> {
    let mut utxo: Vec<Utxo> = Vec::new();

    for u in value.utxo {
      utxo.push(u.try_into()?);
    }

    Ok(Balance {
      utxo,
      address: value.address,
      amount: BigUint::from_str(value.amount.as_str())
        .map_err(|_| StateManagerError::InvalidJsonField("amount".to_string(), "not a str-encoded number".to_string()))?,
      asset: value.asset,
      blockchain: value.blockchain,
      ts: value.ts.or(Some(Utc::now())).unwrap()
    })
  }
}

impl TryFrom<&UtxoJson> for Utxo {
  type Error = StateManagerError;

  fn try_from(value: &UtxoJson) -> Result<Self, Self::Error> {
    Ok(Utxo {
      amount: u64::from_str(value.amount.as_str())
        .map_err(|_| StateManagerError::InvalidJsonField("amount".to_string(), "not a numeric string".to_string()))?,
      txid: value.txid.clone(),
      vout: value.vout,
    })
  }
}

// ------
// NAPI functions
// ------

fn set_internal(balance: BalanceJson) -> Result<bool, StateManagerError> {
  let storage = Instance::get_storage()?;
  storage.get_balance()
    .set(balance.try_into()?)
    .map_err(StateManagerError::from)
    .map(|_| true)
}

#[neon_frame_fn(channel = 1)]
pub fn set<H>(cx: &mut FunctionContext, handler: H) -> Result<(), StateManagerError>
  where
    H: FnOnce(Result<bool, StateManagerError>) + Send + 'static {
  let json = cx
    .argument::<JsString>(0)
    .map_err(|_| StateManagerError::MissingArgument(0, "json".to_string()))?
    .value(cx);
  let json = serde_json::from_str::<BalanceJson>(json.as_str())
    .map_err(|_| StateManagerError::MissingArgument(0, "json".to_string()))?;

  std::thread::spawn(move || {
    let result = set_internal(json);
    handler(result);
  });

  Ok(())
}

fn list_internal(address: String) -> Result<Vec<BalanceJson>, StateManagerError> {
  let storage = Instance::get_storage()?;
  let balances_access = storage.get_balance();

  // check if it's an xpub
  if let Ok(xpub) = XPub::from_str(address.as_str()) {
    // for xpub we check all addresses we know the user has
    let mut results: Vec<BalanceJson> = vec![];
    let pos = storage.get_xpub_pos()
      .get(address)
      // if it's a new/unknown xpub then just check first 20 addresses
      .unwrap_or(Some(20))
      .or(Some(20))
      .unwrap();
    // go address by address and try to find a balance for it
    for i in 0..=pos {
      if let Ok(address) = xpub.get_address::<bitcoin::Address>(i) {
        let balances = balances_access
          .list(address.to_string())
          .map_err(StateManagerError::from)?;
        for balance in balances {
          results.push(BalanceJson::from(&balance));
        }
      }
    }
    Ok(results)
  } else {
    // here we have just one address, so just get the balance if it exists
    balances_access
      .list(address)
      .map_err(StateManagerError::from)
      .map(|values| values.iter().map(BalanceJson::from).collect())
  }
}

#[neon_frame_fn(channel = 1)]
pub fn list<H>(cx: &mut FunctionContext, handler: H) -> Result<(), StateManagerError>
  where
    H: FnOnce(Result<Vec<BalanceJson>, StateManagerError>) + Send + 'static {
  let address = cx
    .argument::<JsString>(0)
    .map_err(|_| StateManagerError::MissingArgument(0, "address".to_string()))?
    .value(cx);

  std::thread::spawn(move || {
    let result = list_internal(address);
    handler(result);
  });

  Ok(())
}
