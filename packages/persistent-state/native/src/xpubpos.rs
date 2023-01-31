use emerald_wallet_state::access::xpubpos::XPubPosition;
use crate::errors::StateManagerError;
use crate::instance::Instance;
use neon::types::{JsString, JsNumber};
use neon::prelude::{FunctionContext};

// ------
// NAPI functions
// ------

fn set_current_internal(xpub: String, pos: u32) -> Result<bool, StateManagerError> {
  let storage = Instance::get_storage()?;
  storage.get_xpub_pos()
    .set_at_least(xpub, pos)
    .map_err(StateManagerError::from)
    .map(|_| true)
}

#[neon_frame_fn(channel=2)]
pub fn set_current<H>(cx: &mut FunctionContext, handler: H) -> Result<(), StateManagerError>
  where
    H: FnOnce(Result<bool, StateManagerError>) + Send + 'static {
  let xpub = cx
    .argument::<JsString>(0)
    .map_err(|_| StateManagerError::MissingArgument(0, "xpub".to_string()))?
    .value(cx);
  let pos = cx
    .argument::<JsNumber>(1)
    .map_err(|_| StateManagerError::MissingArgument(1, "pos".to_string()))?
    .value(cx) as u32;

  std::thread::spawn(move || {
    let result = set_current_internal(xpub, pos);
    handler(result);
  });

  Ok(())
}

fn get_next_internal(xpub: String) -> Result<u32, StateManagerError> {
  let storage = Instance::get_storage()?;
  storage.get_xpub_pos()
    .get_next(xpub)
    .map_err(StateManagerError::from)
}

#[neon_frame_fn(channel=1)]
pub fn get_next<H>(cx: &mut FunctionContext, handler: H) -> Result<(), StateManagerError>
  where
    H: FnOnce(Result<u32, StateManagerError>) + Send + 'static {
  let xpub = cx
    .argument::<JsString>(0)
    .map_err(|_| StateManagerError::MissingArgument(0, "xpub".to_string()))?
    .value(cx);

  std::thread::spawn(move || {
    let result = get_next_internal(xpub);
    handler(result);
  });

  Ok(())
}
