#[derive(Serialize, Clone, Debug)]
pub struct PageResultJson<T: Sized> {
  pub items: Vec<T>,
  pub cursor: Option<usize>,
}
