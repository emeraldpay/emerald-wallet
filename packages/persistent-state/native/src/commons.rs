use chrono::{DateTime, TimeZone, Utc};

pub fn if_not_empty(s: String) -> Option<String> {
  if s.len() > 0 {
    Some(s)
  } else {
    None
  }
}

pub fn if_time(ts: u64) -> Option<DateTime<Utc>> {
  if ts > 0 {
    Some(Utc.timestamp_millis(ts as i64))
  } else {
    None
  }
}
