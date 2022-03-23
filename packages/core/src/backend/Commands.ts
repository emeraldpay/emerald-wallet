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
  LOAD_TX_HISTORY = 'load-tx-history',

  // @deprecated
  BROADCAST_TX = 'broadcast-tx',
  ESTIMATE_TX = 'estimate-tx',
  ESTIMATE_FEE = 'estimate-fee',
  GET_NONCE = 'get-nonce',
  SIGN_TX = 'sign-tx',
  // @deprecated
  GET_BALANCE = 'get-balance',

  ACCOUNT_IMPORT_ETHEREUM_JSON = 'import-json',
  ACCOUNT_IMPORT_PRIVATE_KEY = 'import-private-key',
  ACCOUNT_EXPORT_RAW_PRIVATE = 'export-raw-private',
  ACCOUNT_EXPORT_JSON_FILE = 'export-json-file',

  // Wallets
  VAULT_GET_WALLETS = 'get-vault-wallets',
  VAULT_CREATE_WALLET = 'create-wallet',
  VAULT_GET_WALLET = 'get-vault-wallet',
  VAULT_UPDATE_WALLET = 'vault-update-wallet',
  VAULT_CREATE_HD_ACCOUNT = 'create-hd-account',
  VAULT_GET_SEEDS = 'get-vault-seeds',
  VAULT_SEED_ADDRESSES = 'vault-get-seed-addresses',
}
