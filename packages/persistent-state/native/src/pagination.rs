use emerald_wallet_state::access::pagination::{Cursor, PageQuery, PageResult};

#[derive(Serialize, Clone)]
pub struct PageResultJson<T: Sized> {
  pub items: Vec<T>,
  pub cursor: Option<String>,
}

#[derive(Deserialize, Clone)]
pub struct PageQueryJson {
  pub limit: Option<usize>,
  pub cursor: Option<String>,
}

impl From<PageQueryJson> for PageQuery {
  fn from(json: PageQueryJson) -> Self {
    PageQuery {
      limit: if let Some(v) = json.limit { v } else {PageQuery::default().limit},
      cursor: json.cursor.map(|offset| Cursor { offset } )
    }
  }
}

impl <T, R> From<PageResult<T>> for PageResultJson<R> where T: Into<R> {
  fn from(result: PageResult<T>) -> Self {
    PageResultJson {
      items: result.values.into_iter().map(|item| item.into()).collect(),
      cursor: result.cursor.map(|cursor| cursor.offset),
    }
  }
}
