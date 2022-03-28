use std::str::FromStr;
use neon::prelude::*;
use emerald_wallet_state::access::transactions::{Filter, PageQuery, PageResult, Transactions, WalletRef};
use emerald_wallet_state::proto::transactions::{BlockchainId, Change, Change_ChangeType, State, Status, Transaction};
use crate::access::StatusResult;
use crate::errors::StateManagerError;
use crate::instance::Instance;
use chrono::{DateTime, TimeZone, Utc};
use protobuf::ProtobufEnum;
use regex::Regex;
use uuid::Uuid;

#[derive(Deserialize)]
struct FilterJson {
  wallet: Option<String>,
  after: Option<DateTime<Utc>>,
  before: Option<DateTime<Utc>>,
}

#[derive(Serialize, Deserialize, Clone)]
struct ChangeJson {
  wallet: String,
  #[serde(skip_serializing_if = "Option::is_none")]
  address: Option<String>,
  #[serde(skip_serializing_if = "Option::is_none")]
  hd_path: Option<String>,
  asset: String,
  amount: String,
  #[serde(rename = "type")]
  change_type: usize,
}

#[derive(Serialize, Deserialize, Clone)]
struct TransactionJson {
  blockchain: u32,
  #[serde(rename = "txId")]
  tx_id: String,
  #[serde(rename = "sinceTimestamp")]
  since_timestamp: DateTime<Utc>,
  #[serde(rename = "confirmTimestamp")]
  #[serde(skip_serializing_if = "Option::is_none")]
  confirm_timestamp: Option<DateTime<Utc>>,
  state: usize,
  status: usize,
  changes: Vec<ChangeJson>,
}

#[derive(Serialize, Clone)]
struct PageResultJson {
  transactions: Vec<TransactionJson>,
  cursor: Option<usize>,
}

fn read_wallet_ref(v: String) -> Option<WalletRef> {
  let re = Regex::new(r"^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})(-([0-9]+))?$").unwrap();
  if re.is_match(v.as_str()) {
    let caps = re.captures(v.as_str()).unwrap();
    let wallet_id = Uuid::from_str(caps.get(1).unwrap().as_str()).expect("Invalid uuid");
    let entry_id = caps.get(3).map(|i| u32::from_str(i.as_str()).expect("Invalid entry id"));
    let r = match entry_id {
      None => WalletRef::WholeWallet(wallet_id),
      Some(i) => WalletRef::SelectedEntry(wallet_id, i)
    };
    Some(r)
  } else {
    println!("Invalid wallet ref: {}", v);
    None
  }
}

impl TryFrom<FilterJson> for Filter {
  type Error = StateManagerError;

  fn try_from(value: FilterJson) -> Result<Self, Self::Error> {
    let wallet: Option<WalletRef> = match value.wallet {
      None => None,
      Some(v) => read_wallet_ref(v),
    };
    Ok(Filter {
      after: value.after,
      before: value.before,
      wallet,
      ..Filter::default()
    })
  }
}

impl TryFrom<Transaction> for TransactionJson {
  type Error = StateManagerError;

  fn try_from(value: Transaction) -> Result<Self, Self::Error> {
    Ok(TransactionJson {
      blockchain: value.blockchain.value() as u32,
      tx_id: value.tx_id,
      since_timestamp: Utc.timestamp_millis(value.since_timestamp as i64),
      confirm_timestamp: if value.confirm_timestamp > 0 {
        Some(Utc.timestamp_millis(value.confirm_timestamp as i64))
      } else { None },
      state: value.state.value() as usize,
      status: value.status.value() as usize,
      changes: value.changes.iter().map(|x| ChangeJson::from(x)).collect(),
    })
  }
}

impl TryFrom<TransactionJson> for Transaction {
  type Error = StateManagerError;

  fn try_from(value: TransactionJson) -> Result<Self, Self::Error> {
    let mut proto = Transaction::new();
    proto.blockchain = BlockchainId::from_i32(value.blockchain as i32)
      .ok_or(StateManagerError::InvalidJson("blockchain".to_string()))?;
    proto.tx_id = value.tx_id;
    proto.since_timestamp = value.since_timestamp.timestamp_millis() as u64;
    if value.confirm_timestamp.is_some() {
      proto.confirm_timestamp = value.confirm_timestamp.unwrap().timestamp_millis() as u64;
    }
    proto.state = State::from_i32(value.state as i32)
      .ok_or(StateManagerError::InvalidJson("state".to_string()))?;
    proto.status = Status::from_i32(value.status as i32)
      .ok_or(StateManagerError::InvalidJson("status".to_string()))?;
    for change_json in value.changes {
      if let Ok(change) = Change::try_from(change_json) {
        proto.changes.push(change);
      }
    }
    Ok(proto)
  }
}

impl TryFrom<ChangeJson> for Change {
  type Error = StateManagerError;

  fn try_from(value: ChangeJson) -> Result<Self, Self::Error> {
    let mut change = Change::new();
    if let Some(wallet_ref) = read_wallet_ref(value.wallet) {
      match wallet_ref {
        WalletRef::WholeWallet(_) => {
          return Err(StateManagerError::InvalidJson("wallet".to_string()))
        },
        WalletRef::SelectedEntry(wallet_id, entry_id) => {
          change.wallet_id = wallet_id.to_string();
          change.entry_id = entry_id;
        }
      }
    }
    change.amount = value.amount;
    change.asset = value.asset;
    change.change_type = Change_ChangeType::from_i32(value.change_type as i32)
      .ok_or(StateManagerError::InvalidJson("change_type".to_string()))?;
    Ok(change)
  }
}

fn if_not_empty(s: String) -> Option<String> {
  if s.len() > 0 {
    Some(s)
  } else {
    None
  }
}

impl From<&Change> for ChangeJson {
  fn from(value: &Change) -> Self {
    ChangeJson {
      wallet: format!("{}-{}", value.wallet_id, value.entry_id),
      address: if_not_empty(value.address.clone()),
      hd_path: if_not_empty(value.hd_path.clone()),
      asset: value.asset.clone(),
      amount: value.amount.clone(),
      change_type: value.change_type.value() as usize,
    }
  }
}

impl TryFrom<PageResult> for PageResultJson {
  type Error = StateManagerError;

  fn try_from(value: PageResult) -> Result<Self, Self::Error> {
    let mut transactions = Vec::new();
    for tx in value.transactions {
      transactions.push(TransactionJson::try_from(tx)?)
    }
    Ok(PageResultJson {
      transactions,
      cursor: None,
    })
  }
}

// ------
// NAPI functions
// ------

pub fn query(mut cx: FunctionContext) -> JsResult<JsUndefined> {
  let filter: Handle<JsValue> = cx.argument(0)?;
  let filter = if filter.is_a::<JsString, _>(&mut cx) {
    let json = filter.downcast_or_throw::<JsString, _>(&mut cx)?.value(&mut cx);
    Filter::try_from(serde_json::from_str::<FilterJson>(json.as_str()).expect("Invalid Filter JSON"))
      .expect("Invalid filter structure")
  } else {
    Filter::default()
  };

  let callback = cx.argument::<JsFunction>(1)?.root(&mut cx);
  let channel = cx.channel();
  std::thread::spawn(move || {
    let storage = Instance::get_storage()
      .expect("Storage is not ready");
    let result = storage.get_transactions()
      .query(filter, PageQuery::default())
      .map_err(|e| StateManagerError::from(e))
      .and_then(|r| PageResultJson::try_from(r));

    let status = StatusResult::from(result).as_json();

    channel.send(move |mut cx| {
      let callback = callback.into_inner(&mut cx);
      let this = cx.undefined();
      let args: Vec<Handle<JsValue>> = vec![cx.string(status).upcast()];
      callback.call(&mut cx, this, args)?;
      Ok(())
    });
  });

  Ok(cx.undefined())
}

pub fn submit(mut cx: FunctionContext) -> JsResult<JsUndefined> {
  let tx = cx
    .argument::<JsString>(0)
    .expect("TX is not provided")
    .value(&mut cx);
  let tx = serde_json::from_str::<TransactionJson>(tx.as_str())
    .expect("Invalid TX Json");
  let tx = Transaction::try_from(tx)
    .expect("Invalid TX Structure");

  let callback = cx.argument::<JsFunction>(1)?.root(&mut cx);
  let channel = cx.channel();
  std::thread::spawn(move || {
    let storage = Instance::get_storage()
      .expect("Storage is not ready");
    let result = storage.get_transactions()
      .submit(vec![tx], Utc::now());

    let status = StatusResult::from(result).as_json();

    channel.send(move |mut cx| {
      let callback = callback.into_inner(&mut cx);
      let this = cx.undefined();
      let args: Vec<Handle<JsValue>> = vec![cx.string(status).upcast()];
      callback.call(&mut cx, this, args)?;
      Ok(())
    });
  });

  Ok(cx.undefined())
}

pub fn remove(mut cx: FunctionContext) -> JsResult<JsUndefined> {
  let blockchain = cx
    .argument::<JsNumber>(0)
    .expect("Blockchain is not provided")
    .value(&mut cx) as u32;
  let tx_id = cx
    .argument::<JsString>(1)
    .expect("Tx ID is not provided")
    .value(&mut cx);

  let callback = cx.argument::<JsFunction>(2)?.root(&mut cx);
  let channel = cx.channel();
  std::thread::spawn(move || {
    let storage = Instance::get_storage()
      .expect("Storage is not ready");
    let result = storage.get_transactions()
      .forget(blockchain, tx_id)
      .map(|_| true);

    let status = StatusResult::from(result).as_json();

    channel.send(move |mut cx| {
      let callback = callback.into_inner(&mut cx);
      let this = cx.undefined();
      let args: Vec<Handle<JsValue>> = vec![cx.string(status).upcast()];
      callback.call(&mut cx, this, args)?;
      Ok(())
    });
  });

  Ok(cx.undefined())
}
