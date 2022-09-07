use chrono::{DateTime, Utc};
use uuid::Uuid;
use neon::object::Object;
use neon::types::{JsString, JsValue};
use neon::prelude::{FunctionContext, Handle};
use emerald_wallet_state::access::addressbook::{AddressBook, Filter};
use emerald_wallet_state::access::pagination::{PageQuery, PageResult};
use emerald_wallet_state::proto::addressbook::{BookItem, Address, Address_AddressType};
use crate::commons::{if_not_empty, if_time};
use crate::errors::StateManagerError;
use crate::instance::Instance;
use crate::pagination::{PageQueryJson, PageResultJson};

#[derive(Serialize, Deserialize, Clone)]
pub struct AddressBookJson {
  id: Option<String>,
  address: AddressItemJson,
  label: Option<String>,
  description: Option<String>,
  blockchain: u32,
  #[serde(rename = "createdTimestamp")]
  #[serde(skip_serializing_if = "Option::is_none")]
  create_ts: Option<DateTime<Utc>>,
  #[serde(rename = "updatedTimestamp")]
  #[serde(skip_serializing_if = "Option::is_none")]
  update_ts: Option<DateTime<Utc>>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct AddressBookUpdateJson {
  label: Option<String>,
  description: Option<String>,
}

#[derive(Serialize, Deserialize, Clone)]
struct AddressItemJson {
  #[serde(rename = "type")]
  address_type: AddressType,
  address: String,
}

#[derive(Serialize, Deserialize, Clone)]
enum AddressType {
  #[serde(rename = "plain")]
  Plain,
  #[serde(rename = "xpub")]
  XPub
}

#[derive(Deserialize)]
struct FilterJson {
  blockchain: Option<u32>,
}

impl TryFrom<AddressItemJson> for Address {
  type Error = StateManagerError;

  fn try_from(value: AddressItemJson) -> Result<Self, Self::Error> {
    let mut result = Address::new();
    result.field_type = match value.address_type {
      AddressType::Plain => Address_AddressType::PLAIN,
      AddressType::XPub => Address_AddressType::XPUB,
    };
    result.address = value.address;
    Ok(result)
  }
}

impl TryFrom<Address> for AddressItemJson {
  type Error = StateManagerError;

  fn try_from(value: Address) -> Result<Self, Self::Error> {
    Ok(AddressItemJson {
      address_type: match value.field_type {
        Address_AddressType::PLAIN => AddressType::Plain,
        Address_AddressType::XPUB => AddressType::XPub,
      },
      address: value.address.clone()
    })
  }
}

impl TryFrom<AddressBookJson> for BookItem {
  type Error = StateManagerError;

  fn try_from(value: AddressBookJson) -> Result<Self, Self::Error> {
    let mut result = BookItem::new();
    if let Some(id) = value.id {
      let id = Uuid::parse_str(id.as_str())
        .map_err(|_| StateManagerError::InvalidValue("id".to_string()))?;
      result.id = id.to_string();
    }
    result.set_address(Address::try_from(value.address)?);
    if let Some(label) = value.label {
      result.label = label;
    }
    if let Some(description) = value.description {
      result.description = description;
    }
    result.blockchain = value.blockchain;
    if let Some(created_at) = value.create_ts {
      result.create_timestamp = created_at.timestamp_millis() as u64;
    }
    if let Some(updated_at) = value.update_ts{
      result.update_timestamp = updated_at.timestamp_millis() as u64;
    }

    Ok(result)
  }
}

impl TryFrom<BookItem> for AddressBookJson {
  type Error = StateManagerError;

  fn try_from(value: BookItem) -> Result<Self, Self::Error> {
    Ok(AddressBookJson {
      blockchain: value.blockchain,
      id: Some(value.id.clone()),
      address: AddressItemJson::try_from(value.get_address().clone())?,
      label: if_not_empty(value.label.clone()),
      description: if_not_empty(value.description.clone()),
      create_ts: if_time(value.create_timestamp),
      update_ts: if_time(value.update_timestamp),
    })
  }
}

impl TryFrom<FilterJson> for Filter {
  type Error = StateManagerError;

  fn try_from(value: FilterJson) -> Result<Self, Self::Error> {
    Ok(Filter {
      blockchain: value.blockchain,
      ..Filter::default()
    })
  }
}

impl TryFrom<PageResult<BookItem>> for PageResultJson<AddressBookJson> {
  type Error = StateManagerError;

  fn try_from(value: PageResult<BookItem>) -> Result<Self, Self::Error> {
    let mut items = Vec::new();
    for tx in value.values {
      items.push(AddressBookJson::try_from(tx)?)
    }
    Ok(PageResultJson {
      items,
      cursor: value.cursor.map(|c| c.offset),
    })
  }
}

// ------
// NAPI functions
// ------

fn add_internal(tx: BookItem) -> Result<String, StateManagerError> {
  let storage = Instance::get_storage()?;
  storage.get_addressbook()
    .add(vec![tx])
    .map_err(StateManagerError::from)
    .map(|x| x.first().unwrap().to_string())
}

#[neon_frame_fn(channel=1)]
pub fn add<H>(cx: &mut FunctionContext, handler: H) -> Result<(), StateManagerError>
  where
    H: FnOnce(Result<String, StateManagerError>) + Send + 'static {
  let item = cx
    .argument::<JsString>(0)
    .map_err(|_| StateManagerError::MissingArgument(0, "entry".to_string()))?
    .value(cx);
  let item = serde_json::from_str::<AddressBookJson>(item.as_str())
    .map_err(|_| StateManagerError::InvalidArgument(0, "entry".to_string()))?;
  let item = BookItem::try_from(item)
    .map_err(|_| StateManagerError::InvalidArgument(0, "entry".to_string()))?;

  std::thread::spawn(move || {
    let result = add_internal(item);
    handler(result);
  });

  Ok(())
}

fn query_internal(filter: Filter, page: PageQuery) -> Result<PageResultJson<AddressBookJson>, StateManagerError> {
  let storage = Instance::get_storage()?;
  storage.get_addressbook()
    .query(filter, page)
    .map_err(|e| StateManagerError::from(e))
    .and_then(|r| PageResultJson::try_from(r))
}

#[neon_frame_fn(channel=2)]
pub fn query<H>(cx: &mut FunctionContext, handler: H) -> Result<(), StateManagerError>
  where
    H: FnOnce(Result<PageResultJson<AddressBookJson>, StateManagerError>) + Send + 'static {

  let filter: Handle<JsValue> = cx.argument(0)
    .map_err(|_| StateManagerError::MissingArgument(0, "filter".to_string()))?;
  let filter = if filter.is_a::<JsString, _>(cx) {
    let json = filter.downcast_or_throw::<JsString, _>(cx)
      .map_err(|_| StateManagerError::InvalidArgument(0, "filter".to_string()))?
      .value(cx);
    Filter::try_from(
      serde_json::from_str::<FilterJson>(json.as_str())
        .map_err(|_| StateManagerError::InvalidArgument(0, "filter".to_string()))?
    ).map_err(|_| StateManagerError::InvalidArgument(0, "filter".to_string()))?
  } else {
    Filter::default()
  };

  let page: Handle<JsValue> = cx.argument(1)
    .map_err(|_| StateManagerError::MissingArgument(1, "page".to_string()))?;
  let page = if page.is_a::<JsString, _>(cx) {
    let json = page.downcast_or_throw::<JsString, _>(cx)
      .map_err(|_| StateManagerError::InvalidArgument(1, "page".to_string()))?
      .value(cx);
    PageQuery::from(
      serde_json::from_str::<PageQueryJson>(json.as_str())
        .map_err(|_| StateManagerError::InvalidArgument(1, "page".to_string()))?
    )
  } else {
    PageQuery::default()
  };

  std::thread::spawn(move || {
    let result = query_internal(filter, page);
    handler(result);
  });

  Ok(())
}

fn remove_internal(id: Uuid) -> Result<bool, StateManagerError> {
  let storage = Instance::get_storage()?;
  storage.get_addressbook()
    .remove(id)
    .map_err(StateManagerError::from)
    .map(|_| true)
}

#[neon_frame_fn(channel=1)]
pub fn remove<H>(cx: &mut FunctionContext, handler: H) -> Result<(), StateManagerError>
  where
    H: FnOnce(Result<bool, StateManagerError>) + Send + 'static {

  let id = cx
    .argument::<JsString>(0)
    .map_err(|_| StateManagerError::MissingArgument(0, "id".to_string()))?
    .value(cx);
  let id = Uuid::parse_str(id.as_str())
    .map_err(|_| StateManagerError::InvalidArgument(0, "id".to_string()))?;

  std::thread::spawn(move || {
    let result = remove_internal(id);
    handler(result);
  });

  Ok(())
}

fn update_internal(id: Uuid, update: AddressBookUpdateJson) -> Result<bool, StateManagerError> {
  let storage = Instance::get_storage()?.get_addressbook();
  let current = storage.get(id)?;
  if let Some(mut item) = current {
    if let Some(value) = update.label {
      item.set_label(value);
    }
    if let Some(value) = update.description {
      item.set_description(value);
    }
    storage.update(id, item)
      .map_err(StateManagerError::from)
      .map(|_| true)
  } else {
    Ok(false)
  }
}

#[neon_frame_fn(channel=2)]
pub fn update<H>(cx: &mut FunctionContext, handler: H) -> Result<(), StateManagerError>
  where
    H: FnOnce(Result<bool, StateManagerError>) + Send + 'static {

  let id = cx
    .argument::<JsString>(0)
    .map_err(|_| StateManagerError::MissingArgument(0, "id".to_string()))?
    .value(cx);
  let id = Uuid::parse_str(id.as_str())
    .map_err(|_| StateManagerError::InvalidArgument(0, "id".to_string()))?;

  let update = cx
    .argument::<JsString>(1)
    .map_err(|_| StateManagerError::MissingArgument(1, "update".to_string()))?
    .value(cx);
  let update = serde_json::from_str::<AddressBookUpdateJson>(update.as_str())
    .map_err(|_| StateManagerError::InvalidArgument(1, "update".to_string()))?;

  std::thread::spawn(move || {
    let result = update_internal(id, update);
    handler(result);
  });

  Ok(())
}

fn get_internal(id: Uuid) -> Result<Option<AddressBookJson>, StateManagerError> {
  let storage = Instance::get_storage()?;
  let result = storage.get_addressbook()
    .get(id)
    .map_err(|e| StateManagerError::from(e))?;
  if let Some(item) = result {
    let json = AddressBookJson::try_from(item)?;
    Ok(Some(json))
  } else {
    Ok(None)
  }
}

#[neon_frame_fn(channel=1)]
pub fn get<H>(cx: &mut FunctionContext, handler: H) -> Result<(), StateManagerError>
  where
    H: FnOnce(Result<Option<AddressBookJson>, StateManagerError>) + Send + 'static {

  let id = cx
    .argument::<JsString>(0)
    .map_err(|_| StateManagerError::MissingArgument(0, "id".to_string()))?
    .value(cx);
  let id = Uuid::parse_str(id.as_str())
    .map_err(|_| StateManagerError::InvalidArgument(0, "id".to_string()))?;

  std::thread::spawn(move || {
    let result = get_internal(id);
    handler(result);
  });

  Ok(())
}
