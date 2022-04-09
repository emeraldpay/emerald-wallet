use std::str::FromStr;
use neon::prelude::*;
use emerald_wallet_state::access::transactions::{Filter, PageQuery, PageResult, Transactions, WalletRef};
use emerald_wallet_state::proto::transactions::{BlockchainId, Change, Change_ChangeType, State, Status, Transaction};
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
pub struct PageResultJson {
  transactions: Vec<TransactionJson>,
  cursor: Option<usize>,
}

fn read_wallet_ref(v: String) -> Result<WalletRef, StateManagerError> {
  let re = Regex::new(r"^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})(-([0-9]+))?$").unwrap();
  if re.is_match(v.as_str()) {
    let caps = re.captures(v.as_str()).unwrap();
    let wallet_id = Uuid::from_str(caps.get(1).unwrap().as_str())
      .map_err(|_| StateManagerError::InvalidValue("uuid".to_string()))?;
    let entry_id = caps.get(3)
      .map(|i| u32::from_str(i.as_str()))
      // the following check would never produce false because we already checked it with Regex. so it's just in case we have an invalid regex
      .filter(|v| v.is_ok())
      .map(|v| v.unwrap());

    let r = match entry_id {
      None => WalletRef::WholeWallet(wallet_id),
      Some(i) => WalletRef::SelectedEntry(wallet_id, i)
    };
    Ok(r)
  } else {
    Err(StateManagerError::InvalidValue("walletRef".to_string()))
  }
}

impl TryFrom<FilterJson> for Filter {
  type Error = StateManagerError;

  fn try_from(value: FilterJson) -> Result<Self, Self::Error> {
    let wallet: Option<WalletRef> = match value.wallet {
      None => None,
      Some(v) => Some(read_wallet_ref(v)?),
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
    if let Ok(wallet_ref) = read_wallet_ref(value.wallet) {
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

fn query_internal(filter: Filter) -> Result<PageResultJson, StateManagerError> {
  let storage = Instance::get_storage()?;
  storage.get_transactions()
    .query(filter, PageQuery::default())
    .map_err(|e| StateManagerError::from(e))
    .and_then(|r| PageResultJson::try_from(r))
}

#[neon_frame_fn(channel=1)]
pub fn query<H>(cx: &mut FunctionContext, handler: H) -> Result<(), StateManagerError>
  where
    H: FnOnce(Result<PageResultJson, StateManagerError>) + Send + 'static {

  let filter: Handle<JsValue> = cx.argument(0)
    .map_err(|_| StateManagerError::MissingArgument(0, "filter".to_string()))?;
  let filter = if filter.is_a::<JsString, _>(cx) {
    let json = filter.downcast_or_throw::<JsString, _>(cx)
      .map_err(|_| StateManagerError::InvalidArgument(0, "filter".to_string()))?
      .value(cx);
    Filter::try_from(
      serde_json::from_str::<FilterJson>(json.as_str())
        .map_err(|_| StateManagerError::InvalidArgument(0, "filter".to_string()))?
    ).map_err(|_| StateManagerError::InvalidArgument(0, "filter".to_string()))?
  } else {
    Filter::default()
  };

  std::thread::spawn(move || {
    let result = query_internal(filter);
    handler(result);
  });

  Ok(())
}

fn submit_internal(tx: Transaction) -> Result<bool, StateManagerError> {
  let storage = Instance::get_storage()?;
  storage.get_transactions()
    .submit(vec![tx], Utc::now())
    .map_err(StateManagerError::from)
    .map(|_| true)
}

#[neon_frame_fn(channel=1)]
pub fn submit<H>(cx: &mut FunctionContext, handler: H) -> Result<(), StateManagerError>
  where
    H: FnOnce(Result<bool, StateManagerError>) + Send + 'static {
  let tx = cx
    .argument::<JsString>(0)
    .map_err(|_| StateManagerError::MissingArgument(0, "tx".to_string()))?
    .value(cx);
  let tx = serde_json::from_str::<TransactionJson>(tx.as_str())
    .map_err(|_| StateManagerError::InvalidArgument(0, "tx".to_string()))?;
  let tx = Transaction::try_from(tx)
    .map_err(|_| StateManagerError::InvalidArgument(0, "tx".to_string()))?;

  std::thread::spawn(move || {
    let result = submit_internal(tx);
    handler(result);
  });

  Ok(())
}

fn remove_internal(blockchain: u32, tx_id: String) -> Result<bool, StateManagerError> {
  let storage = Instance::get_storage()?;
  storage.get_transactions()
    .forget(blockchain, tx_id)
    .map_err(StateManagerError::from)
    .map(|_| true)
}

#[neon_frame_fn(channel=2)]
pub fn remove<H>(cx: &mut FunctionContext, handler: H) -> Result<(), StateManagerError>
  where
    H: FnOnce(Result<bool, StateManagerError>) + Send + 'static {

  let blockchain = cx
    .argument::<JsNumber>(0)
    .map_err(|_| StateManagerError::MissingArgument(0, "blockchain".to_string()))?
    .value(cx) as u32;
  let tx_id = cx
    .argument::<JsString>(1)
    .map_err(|_| StateManagerError::MissingArgument(1, "txId".to_string()))?
    .value(cx);

  std::thread::spawn(move || {
    let result = remove_internal(blockchain, tx_id);
    handler(result);
  });

  Ok(())
}
