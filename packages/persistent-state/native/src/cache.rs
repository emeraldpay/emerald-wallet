// ------
// NAPI functions
// ------

use neon::prelude::{FunctionContext, JsString};
use emerald_wallet_state::access::cache::Cache;
use crate::commons::args_get_number;
use crate::errors::StateManagerError;
use crate::instance::Instance;

fn get_internal(id: String) -> Result<Option<String>, StateManagerError> {
  let storage = Instance::get_storage()?;
  storage.get_cache()
    .get(id)
    .map_err(StateManagerError::from)
}

#[neon_frame_fn(channel = 1)]
pub fn get<H>(cx: &mut FunctionContext, handler: H) -> Result<(), StateManagerError>
  where
    H: FnOnce(Result<Option<String>, StateManagerError>) + Send + 'static {
  let id = cx
    .argument::<JsString>(0)
    .map_err(|_| StateManagerError::MissingArgument(0, "id".to_string()))?
    .value(cx);

  std::thread::spawn(move || {
    let result = get_internal(id);
    handler(result);
  });

  Ok(())
}

fn put_internal(id: String, value: String, ttl: Option<u64>) -> Result<bool, StateManagerError> {
  let storage = Instance::get_storage()?;
  storage.get_cache()
    .put(id, value, ttl)
    .map_err(StateManagerError::from)
    .map(|_| true)
}

#[neon_frame_fn(channel = 3)]
pub fn put<H>(cx: &mut FunctionContext, handler: H) -> Result<(), StateManagerError>
  where
    H: FnOnce(Result<bool, StateManagerError>) + Send + 'static {
  let id = cx
    .argument::<JsString>(0)
    .map_err(|_| StateManagerError::MissingArgument(0, "id".to_string()))?
    .value(cx);
  let value = cx
    .argument::<JsString>(1)
    .map_err(|_| StateManagerError::MissingArgument(1, "value".to_string()))?
    .value(cx);
  let ttl = args_get_number(cx, 2)
    .map(|f| f.floor() as u64);

  std::thread::spawn(move || {
    let result = put_internal(id, value, ttl);
    handler(result);
  });

  Ok(())
}

fn evict_internal(id: String) -> Result<bool, StateManagerError> {
  let storage = Instance::get_storage()?;
  storage.get_cache()
    .evict(id)
    .map_err(StateManagerError::from)
    .map(|_| true)
}

#[neon_frame_fn(channel = 1)]
pub fn evict<H>(cx: &mut FunctionContext, handler: H) -> Result<(), StateManagerError>
  where
    H: FnOnce(Result<bool, StateManagerError>) + Send + 'static {
  let id = cx
    .argument::<JsString>(0)
    .map_err(|_| StateManagerError::MissingArgument(0, "id".to_string()))?
    .value(cx);

  std::thread::spawn(move || {
    let result = evict_internal(id);
    handler(result);
  });

  Ok(())
}
