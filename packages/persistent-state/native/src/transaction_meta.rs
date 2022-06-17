use chrono::{DateTime, TimeZone, Utc};
use neon::prelude::*;
use protobuf::ProtobufEnum;
use emerald_wallet_state::proto::transactions::{BlockchainId, TransactionMeta};
use emerald_wallet_state::access::transactions::Transactions;
use crate::commons::{blockchain_from_code, blockchain_to_code};
use crate::errors::StateManagerError;
use crate::instance::Instance;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct TransactionMetaJson {
  blockchain: String,
  #[serde(rename = "txId")]
  tx_id: String,
  #[serde(rename = "timestamp")]
  timestamp: DateTime<Utc>,
  label: Option<String>,
}

impl TryFrom<TransactionMetaJson> for TransactionMeta {
  type Error = StateManagerError;

  fn try_from(value: TransactionMetaJson) -> Result<Self, Self::Error> {
    let mut result = TransactionMeta::new();
    result.timestamp = value.timestamp.timestamp_millis() as u64;
    result.blockchain = BlockchainId::from_i32(blockchain_from_code(value.blockchain)? as i32)
      .ok_or(StateManagerError::InvalidJsonField("blockchain".to_string(), "Unknown".to_string()))?;
    result.tx_id = value.tx_id;
    result.label = value.label.unwrap_or("".to_string());
    Ok(result)
  }
}

impl TryFrom<TransactionMeta> for TransactionMetaJson {
  type Error = StateManagerError;

  fn try_from(value: TransactionMeta) -> Result<Self, Self::Error> {
    Ok(TransactionMetaJson {
      blockchain: blockchain_to_code(value.blockchain.value() as u32)?,
      tx_id: value.tx_id,
      timestamp: Utc.timestamp_millis(value.timestamp as i64),
      label: if value.label.len() > 0 { Some(value.label) } else { None }
    })
  }
}

// ------
// NAPI functions
// ------

fn set_internal(meta: TransactionMetaJson) -> Result<TransactionMeta, StateManagerError> {
  let storage = Instance::get_storage()?;
  storage.get_transactions()
    .set_tx_meta(TransactionMeta::try_from(meta)?)
    .map_err(StateManagerError::from)
}

#[neon_frame_fn(channel=1)]
pub fn set<H>(cx: &mut FunctionContext, handler: H) -> Result<(), StateManagerError>
  where
    H: FnOnce(Result<TransactionMetaJson, StateManagerError>) + Send + 'static {
  let value = cx
    .argument::<JsString>(0)
    .map_err(|_| StateManagerError::MissingArgument(0, "tx".to_string()))?
    .value(cx);
  let value = serde_json::from_str::<TransactionMetaJson>(value.as_str())
    .map_err(|_| StateManagerError::InvalidArgument(0, "tx".to_string()))?;

  std::thread::spawn(move || {
    let result = set_internal(value)
      .and_then(|v| TransactionMetaJson::try_from(v));
    handler(result);
  });

  Ok(())
}

fn get_internal(blockchain: u32, tx_id: String) -> Result<Option<TransactionMetaJson>, StateManagerError> {
  let storage = Instance::get_storage()?;
  let result = storage.get_transactions()
    .get_tx_meta(blockchain, tx_id.as_str())
    .map_err(StateManagerError::from)?;

  match result {
    Some(v) => TransactionMetaJson::try_from(v)
      .map(|a| Some(a)),
    None => Ok(None)
  }
}

#[neon_frame_fn(channel=2)]
pub fn get<H>(cx: &mut FunctionContext, handler: H) -> Result<(), StateManagerError>
  where
    H: FnOnce(Result<Option<TransactionMetaJson>, StateManagerError>) + Send + 'static {

  let blockchain = cx
    .argument::<JsNumber>(0)
    .map_err(|_| StateManagerError::MissingArgument(0, "blockchain".to_string()))?
    .value(cx) as u32;
  let tx_id = cx
    .argument::<JsString>(1)
    .map_err(|_| StateManagerError::MissingArgument(1, "txId".to_string()))?
    .value(cx);

  std::thread::spawn(move || {
    let result = get_internal(blockchain, tx_id);
    handler(result);
  });

  Ok(())
}
