use crate::errors::StateManagerError;

#[derive(Serialize)]
pub struct StatusErrorJson {
  pub code: u32,
  pub message: String,
}

#[derive(Serialize)]
pub struct StatusJson<T> {
  pub succeeded: bool,
  pub result: Option<T>,
  pub error: Option<StatusErrorJson>,
}

pub enum StatusResult<T> {
  Ok(T),
  Error(u32, String),
}

impl<T> StatusResult<T>
  where
    T: Clone + serde::Serialize,
{
  pub fn as_json(&self) -> String {
    let obj = match self {
      StatusResult::Ok(ref t) => StatusJson {
        succeeded: true,
        result: Some(t.clone()),
        error: None,
      },
      StatusResult::Error(code, message) => StatusJson {
        succeeded: false,
        result: None,
        error: Some(StatusErrorJson {
          code: *code,
          message: message.clone(),
        }),
      },
    };
    let result = serde_json::to_string(&obj)
      .map_err(|err|
        serde_json::to_string(
          &StatusJson::<String> {
            succeeded: false,
            result: None,
            error: Some(StatusErrorJson { code: 0, message: format!("Failed to convert JSON: {:}", err) }),
          }
        ).unwrap()
      );
    match result {
      Ok(v) => v,
      Err(v) => v
    }
  }
}

impl<T, E> From<Result<T, E>> for StatusResult<T> where StateManagerError: From<E> {
  fn from(r: Result<T, E>) -> Self {
    let t = r.map_err(|e| StateManagerError::from(e));
    match t {
      Ok(t) => StatusResult::Ok(t),
      Err(e) => StatusResult::Error(1, format!("{:?}", e)),
    }
  }
}
