export enum Commands {
  GET_VERSION = 'get-version',
  GET_APP_SETTINGS = 'get-settings',
  SET_TERMS = 'terms',

  // Address Book
  GET_ADDR_BOOK_ITEMS = 'get-addr-book-items',
  ADD_ADDR_BOOK_ITEM = 'add-addr-book-item',
  DELETE_ADDR_BOOK_ITEM = 'delete-addr-book-item',

  // Transaction history
  PERSIST_TX_HISTORY = 'persist-tx-history',
  LOAD_TX_HISTORY = 'load-tx-history'
}
