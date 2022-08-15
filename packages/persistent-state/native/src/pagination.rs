use emerald_wallet_state::access::pagination::{Cursor, PageQuery};

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
