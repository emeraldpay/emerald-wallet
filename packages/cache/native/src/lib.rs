#[macro_use]
extern crate serde_derive;
#[macro_use]
extern crate lazy_static;
#[macro_use]
extern crate neon_frame_macro;

mod transaction_history;
mod instance;
mod errors;

use neon::prelude::*;

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
  cx.export_function("open", instance::open)?;
  cx.export_function("close", instance::close)?;

  cx.export_function("txhistory_query", transaction_history::query)?;
  cx.export_function("txhistory_submit", transaction_history::submit)?;
  cx.export_function("txhistory_remove", transaction_history::remove)?;

  Ok(())
}
