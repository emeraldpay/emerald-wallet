#[macro_use]
extern crate serde_derive;
#[macro_use]
extern crate lazy_static;
#[macro_use]
extern crate neon_frame_macro;

mod transaction_history;
mod instance;
mod errors;
mod addressbook;
mod pagination;
mod commons;
mod xpubpos;

use neon::prelude::*;

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
  cx.export_function("open", instance::open)?;
  cx.export_function("close", instance::close)?;

  cx.export_function("txhistory_query", transaction_history::query)?;
  cx.export_function("txhistory_submit", transaction_history::submit)?;
  cx.export_function("txhistory_remove", transaction_history::remove)?;
  cx.export_function("txhistory_get_cursor", transaction_history::get_cursor)?;
  cx.export_function("txhistory_set_cursor", transaction_history::set_cursor)?;

  cx.export_function("addressbook_query", addressbook::query)?;
  cx.export_function("addressbook_add", addressbook::add)?;
  cx.export_function("addressbook_get", addressbook::get)?;
  cx.export_function("addressbook_remove", addressbook::remove)?;
  cx.export_function("addressbook_update", addressbook::update)?;

  cx.export_function("xpubpos_set", xpubpos::set)?;
  cx.export_function("xpubpos_get", xpubpos::get)?;

  Ok(())
}
