use emerald_wallet_state::errors::{InvalidValueError, StateError};

#[derive(Debug, Clone)]
pub enum StateManagerError {
  Uninitialized,
  Misconfigured,
  InvalidJson(String),
  InvalidJsonField(String, String),
  IO,
  MissingArgument(usize, String),
  InvalidArgument(usize, String),
  InvalidValue(String),
  InvalidValueDetailed(String, String),
  Other(String),
}

impl From<StateError> for StateManagerError {
  fn from(err: StateError) -> Self {
    match err {
      StateError::IOError => StateManagerError::IO,
      StateError::InvalidId => StateManagerError::InvalidValue("ID".to_string()),
      StateError::InvalidValue(e) => match e {
        InvalidValueError::Name(name) => StateManagerError::InvalidValue(name),
        InvalidValueError::NameMessage(name, msg) => StateManagerError::InvalidValueDetailed(name, msg),
        InvalidValueError::Other(msg) => StateManagerError::Other(format!("Invalid value: {}", msg))
      },
      StateError::CorruptedValue => StateManagerError::Other("Corrupted State Store".to_string())
    }
  }
}

impl From<StateManagerError> for (usize, String) {
  fn from(err: StateManagerError) -> Self {
    match err {
      StateManagerError::Uninitialized => (100, "State Manager is not initialized".to_string()),
      StateManagerError::Misconfigured => (101, "State Manager is not configured".to_string()),
      StateManagerError::IO => (101, "IO Error".to_string()),
      StateManagerError::InvalidJson(msg) => (200, format!("Invalid JSON: {}", msg)),
      StateManagerError::InvalidJsonField(name, msg) => (200, format!("Invalid JSON value for `.{}`: {}", name, msg)),
      StateManagerError::MissingArgument(pos, name) => (201, format!("Missing argument `{}` at {}", name, pos)),
      StateManagerError::InvalidArgument(pos, name) => (202, format!("Invalid argument `{}` at {}", name, pos)),
      StateManagerError::InvalidValue(name) => (203, format!("Invalid value for `{}`", name)),
      StateManagerError::InvalidValueDetailed(name, msg) => (203, format!("Invalid value for `{}`: {}", name, msg)),
      StateManagerError::Other(msg) => (204, msg),
    }
  }
}
