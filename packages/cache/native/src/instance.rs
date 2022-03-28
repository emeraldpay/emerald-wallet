use std::path::PathBuf;
use std::sync::{Arc, RwLock};
use emerald_wallet_state::storage::sled_access::SledStorage;
use crate::errors::StateManagerError;
use neon::prelude::*;
use crate::access::StatusResult;

enum StorageRef {
  UNINITIALIZED,
  INITIALIZED(Arc<SledStorage>),
}

impl StorageRef {
  fn is_ready(&self) -> bool {
    match self {
      StorageRef::INITIALIZED(_) => true,
      _ => false
    }
  }

  fn expect(&self) -> Arc<SledStorage> {
    match self {
      StorageRef::INITIALIZED(r) => r.clone(),
      _ => panic!("Not ready")
    }
  }
}

pub(crate) struct Instance {}

lazy_static! {
    static ref CURRENT: RwLock<Arc<StorageRef>> = RwLock::new(Arc::new(StorageRef::UNINITIALIZED));
}

impl Instance {
  fn init(path: PathBuf) -> Result<(), StateManagerError> {
    let current = CURRENT.read().unwrap().clone();
    if current.is_ready() {
      return Err(StateManagerError::Misconfigured)
    }
    let storage = SledStorage::open(path)?;
    let mut w = CURRENT.write().unwrap();
    *w = Arc::new(StorageRef::INITIALIZED(Arc::new(storage)));
    Ok(())
  }

  fn close() -> Result<(), StateManagerError> {
    let mut w = CURRENT.write().unwrap();
    *w = Arc::new(StorageRef::UNINITIALIZED);
    Ok(())
  }


  pub(crate) fn get_storage() -> Result<Arc<SledStorage>, StateManagerError> {
    let current = CURRENT.read().unwrap().clone();
    if !current.is_ready() {
      return Err(StateManagerError::Misconfigured)
    }
    let storage = current.clone().expect();
    Ok(storage)
  }
}


// ------
// NAPI functions
// ------

pub fn open(mut cx: FunctionContext) -> JsResult<JsString> {
  let path = cx
    .argument::<JsString>(0)
    .expect("Path is not provided")
    .value(&mut cx);

  let result = Instance::init(PathBuf::from(path));
  let status = StatusResult::from(result).as_json();
  Ok(cx.string(status))
}

pub fn close(mut cx: FunctionContext) -> JsResult<JsString> {
  let result = Instance::close();
  let status = StatusResult::from(result).as_json();
  Ok(cx.string(status))
}
