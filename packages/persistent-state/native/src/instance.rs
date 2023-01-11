use std::path::PathBuf;
use std::sync::{Arc, RwLock};
use emerald_wallet_state::storage::sled_access::SledStorage;
use crate::errors::StateManagerError;
use neon::prelude::*;
use crate::commons::args_get_str;

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
  fn init(path: Option<PathBuf>) -> Result<(), StateManagerError> {
    let current = CURRENT.read().unwrap().clone();
    if current.is_ready() {
      return Err(StateManagerError::Misconfigured)
    }
    let path = if let Some(value) = path { value } else { emerald_wallet_state::storage::default_path() };
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

#[neon_frame_fn]
pub fn open(cx: &mut FunctionContext) -> Result<bool, StateManagerError> {
  let path = args_get_str(cx, 0)
    .map(|dir| PathBuf::from(dir));

    Instance::init(path)
    .map(|_| true)
}

#[neon_frame_fn]
pub fn close(_cx: &mut FunctionContext) ->  Result<bool, StateManagerError> {
  Instance::close()
    .map(|_| true)
}
