use neon::prelude::{FunctionContext, JsString};
use uuid::Uuid;
use emerald_wallet_state::access::allowance::Allowances;
use emerald_wallet_state::proto::balance::Allowance;
use crate::commons::{args_get_number, args_get_str, blockchain_from_code, blockchain_to_code};
use crate::errors::StateManagerError;
use crate::instance::Instance;
use crate::pagination::PageResultJson;

#[derive(Serialize, Deserialize, Clone)]
pub struct AllowanceJson {
  blockchain: String,
  token: String,
  amount: String,
  owner: String,
  spender: String,
}

impl TryFrom<AllowanceJson> for Allowance {
  type Error = StateManagerError;

  fn try_from(value: AllowanceJson) -> Result<Self, Self::Error> {
    let mut result = Allowance::new();
    result.blockchain = blockchain_from_code(value.blockchain)?;
    result.token = value.token;
    result.amount = value.amount;
    result.owner = value.owner;
    result.spender = value.spender;
    Ok(result)
  }
}

impl From<Allowance> for AllowanceJson {
  fn from(value: Allowance) -> Self {
    AllowanceJson {
      blockchain: blockchain_to_code(value.blockchain).unwrap_or("unknown".to_string()),
      token: value.token,
      amount: value.amount,
      owner: value.owner,
      spender: value.spender,
    }
  }
}


// ------
// NAPI functions
// ------

fn add_internal(wallet: Uuid, allowance: Allowance, ttl: Option<u64>) -> Result<bool, StateManagerError> {
  let mut allowance = allowance;
  allowance.wallet_id = wallet.to_string();
  let storage = Instance::get_storage()?;
  storage.get_allowance()
    .add(allowance, ttl)
    .map_err(StateManagerError::from)
    .map(|_| true)
}

#[neon_frame_fn(channel=3)]
pub fn add<H>(cx: &mut FunctionContext, handler: H) -> Result<(), StateManagerError>
  where
    H: FnOnce(Result<bool, StateManagerError>) + Send + 'static {

  let wallet_id = args_get_str(cx, 0)
    .ok_or(StateManagerError::MissingArgument(0, "wallet_id".to_string()))?;
  let wallet_id = Uuid::parse_str(wallet_id.as_str())
    .map_err(|_| StateManagerError::InvalidArgument(0, "wallet_id".to_string()))?;

  let allowance = cx
    .argument::<JsString>(1)
    .map_err(|_| StateManagerError::MissingArgument(1, "allowance".to_string()))?
    .value(cx);
  let allowance = serde_json::from_str::<AllowanceJson>(allowance.as_str())
    .map_err(|_| StateManagerError::InvalidArgument(1, "allowance".to_string()))?;
  let allowance = Allowance::try_from(allowance)?;

  let ttl = args_get_number(cx, 2)
    .map(|v| v as u64);

  std::thread::spawn(move || {
    let result = add_internal(wallet_id, allowance, ttl);
    handler(result);
  });

  Ok(())
}

fn list_internal(wallet_id: Option<Uuid>) -> Result<PageResultJson<AllowanceJson>, StateManagerError> {
  let storage = Instance::get_storage()?;
  storage.get_allowance()
    .list(wallet_id)
    .map_err(StateManagerError::from)
    .map(|page| page.into())
}

#[neon_frame_fn(channel=1)]
pub fn list<H>(cx: &mut FunctionContext, handler: H) -> Result<(), StateManagerError>
  where
    H: FnOnce(Result<PageResultJson<AllowanceJson>, StateManagerError>) + Send + 'static {

  let wallet_id = match args_get_str(cx, 0) {
    None => None,
    Some(wallet_id) => Some(
      Uuid::parse_str(wallet_id.as_str())
        .map_err(|_| StateManagerError::InvalidArgument(0, "wallet_id".to_string()))?
    )
  };
  std::thread::spawn(move || {
    let result = list_internal(wallet_id);
    handler(result);
  });

  Ok(())
}
