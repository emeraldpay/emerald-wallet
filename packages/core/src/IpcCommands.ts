export enum IpcCommands {
  // Common
  EMERALD_READY = 'emerald-ready',
  HANDLE_URL = 'handle-url',
  STORE_DISPATCH = 'store-dispatch',
  UPDATE_MAIN_MENU = 'update-main-menu',

  // Settings
  GET_APP_SETTINGS = 'get-settings',
  GET_VERSION = 'get-version',
  SET_OPTIONS = 'set-options',
  SET_TERMS = 'set-terms',
  SET_TOKENS = 'set-tokens',

  // Backend API
  DESCRIBE_ADDRESS = 'describe-address',
  ESTIMATE_FEE = 'estimate-fee',
  ESTIMATE_TX = 'estimate-tx',
  GET_BTC_TX = 'get-btc-tx',
  GET_ETH_RECEIPT = 'get-eth-receipt',
  GET_ETH_TX = 'get-eth-tx',
  GET_NONCE = 'get-nonce',
  SIGN_TX = 'sign-tx',
  XPUB_LAST_INDEX = 'xpub-last-index',
  /** @deprecated */
  BROADCAST_TX = 'broadcast-tx',

  // Allowance service
  ALLOWANCE_SET_TOKENS = 'allowance-set-tokens',
  ALLOWANCE_SUBSCRIBE_ADDRESS = 'allowance-subscribe-address',

  // Balance service
  BALANCE_SET_TOKENS = 'balance-set-tokens',
  BALANCE_SUBSCRIBE = 'balance-subscribe',

  // Prices service
  PRICES_SET_TO = 'prices-set-to',

  // Transactions service
  TXS_SET_TOKENS = 'txs-set-tokens',
  TXS_SUBSCRIBE = 'txs-subscribe',

  // Tokens service
  TOKENS_SET_TOKENS = 'tokens-set-tokens',
  TOKENS_SUBSCRIBE_ADDRESS = 'tokens-subscribe-address',

  // Account
  ACCOUNT_IMPORT_ETHEREUM_JSON = 'import-json',
  ACCOUNT_IMPORT_PRIVATE_KEY = 'import-private-key',
  ACCOUNT_EXPORT_RAW_PRIVATE = 'export-raw-private',
  ACCOUNT_EXPORT_JSON_FILE = 'export-json-file',

  // Address Book
  ADDRESS_BOOK_ADD = 'address-book-add',
  ADDRESS_BOOK_GET = 'address-book-get',
  ADDRESS_BOOK_REMOVE = 'address-book-remove',
  ADDRESS_BOOK_QUERY = 'address-book-query',
  ADDRESS_BOOK_UPDATE = 'address-book-update',

  // Allowances
  ALLOWANCES_ADD = 'allowances-add',
  ALLOWANCES_LIST = 'allowances-list',

  // Balances
  BALANCES_LIST = 'balances-list',
  BALANCES_SET = 'balances-set',

  // Cache
  CACHE_EVICT = 'cache-evict',
  CACHE_GET = 'cache-get',
  CACHE_PUT = 'cache-put',

  // Transaction history
  LOAD_TX_HISTORY = 'load-tx-history',
  SUBMIT_TX_HISTORY = 'submit-tx-history',

  // Transaction meta
  GET_TX_META = 'get-tx-meta',
  SET_TX_META = 'set-tx-meta',

  // xPub position
  XPUB_POSITION_GET_NEXT = 'xpub-position-get-next',
  XPUB_POSITION_SET = 'xpub-position-set',
  XPUB_POSITION_NEXT_SET = 'xpub-position-next-set',

  // Vault
  VAULT_ADD_ENTRY = 'vault-add-entry',
  VAULT_ADD_WALLET = 'vault-add-wallet',
  VAULT_CHANGE_GLOBAL_KEY = 'vault-change-global-key',
  VAULT_CREATE_GLOBAL_KEY = 'vault-create-global-key',
  VAULT_EXPORT_JSON_PK = 'vault-export-json-pk',
  VAULT_EXPORT_RAW_PK = 'vault-export-raw-pk',
  VAULT_EXTRACT_SIGNER = 'vault-extract-signer',
  VAULT_GENERATE_MNEMONIC = 'vault-generate-mnemonic',
  VAULT_GET_CONNECTED_HWDETAILS = 'vault-get-connected-hwdetails',
  VAULT_GET_ICON = 'vault-get-icon',
  VAULT_GET_ODD_PASSWORD_ITEMS = 'vault-get-odd-password-items',
  VAULT_GET_WALLET = 'vault-get-wallet',
  VAULT_IMPORT_SEED = 'vault-import-seed',
  VAULT_IS_GLOBAL_KEY_SET = 'vault-is-global-key-set',
  VAULT_IS_SEED_AVAILABLE = 'vault-is-seed-available',
  VAULT_LIST_ADDRESS_BOOK = 'vault-list-address-book',
  VAULT_LIST_ENTRY_ADDRESSES = 'vault-list-entry-addresses',
  VAULT_LIST_ICONS = 'vault-list-icons',
  VAULT_LIST_SEEDS = 'vault-list-seeds',
  VAULT_LIST_SEED_ADDRESSES = 'vault-list-seed-addresses',
  VAULT_LIST_WALLETS = 'vault-list-wallets',
  VAULT_REMOVE_ENTRY = 'vault-remove-entry',
  VAULT_REMOVE_FROM_ADDRESS_BOOK = 'vault-remove-from-address-book',
  VAULT_REMOVE_WALLET = 'vault-remove-wallet',
  VAULT_SET_ENTRY_LABEL = 'vault-set-entry-label',
  VAULT_SET_ENTRY_RECEIVE_DISABLED = 'vault-set-entry-receive-disabled',
  VAULT_SET_ICON = 'vault-set-icon',
  VAULT_SET_STATE = 'vault-set-state',
  VAULT_SET_WALLET_LABEL = 'vault-set-wallet-label',
  VAULT_SIGN_MESSAGE = 'vault-sign-message',
  VAULT_SIGN_TX = 'vault-sign-tx',
  VAULT_SNAPSHOT_CREATE = 'vault-snapshot-create',
  VAULT_SNAPSHOT_RESTORE = 'vault-snapshot-restore',
  VAULT_TRY_UPGRADE_ODD_ITEMS = 'vault-try-upgrade-odd-items',
  VAULT_UPDATE_SEED = 'vault-update-seed',
  VAULT_VERIFY_GLOBAL_KEY = 'vault-verify-global-key',
  VAULT_WATCH = 'vault-watch',

  // ENS
  LOOKUP_ADDRESS = 'lookup-address',
  RESOLVE_NAME = 'resolve-name',

  // FS
  FS_READ_FILE = 'fs-read-file',
}
