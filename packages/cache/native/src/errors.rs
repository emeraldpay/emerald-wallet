use emerald_wallet_state::errors::StateError;

#[derive(Debug, Clone)]
pub enum StateManagerError {
  Uninitialized,
  Misconfigured,
  InvalidJson(String),
  IO,
}

impl From<StateError> for StateManagerError {
  fn from(err: StateError) -> Self {
    match err {
      StateError::IOError => StateManagerError::IO
    }
  }
}
