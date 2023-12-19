import { BigAmount } from '@emeraldpay/bigamount';
import { Satoshi, Wei } from '@emeraldpay/bigamount-crypto';
import {
  BitcoinEntry,
  CurrentAddress,
  EthereumEntry,
  IEmeraldVault,
  WalletEntry,
} from '@emeraldpay/emerald-vault-core';
import {
  BackendApi,
  BlockchainCode,
  PersistentState,
  Token,
  TokenData,
  TokenRegistry,
  WalletApi,
  amountFactory,
  blockchainIdToCode,
  isBitcoin,
  workflow,
} from '@emeraldwallet/core';
import { Action } from 'redux';
import { setBalanceAction, setWalletsAction } from '../accounts/actions';
import { getUtxo } from '../accounts/selectors';
import { ActionTypes as ApplicationactionTypes } from '../application/types';
import { createStore } from '../create-store';
import { StoredTransaction } from '../txhistory/types';
import { prepareTransaction, reset } from './actions';
import { getChangeAddress, getFee, getTransaction } from './selectors';
import { TxAction } from './types';

describe('tx stash action', () => {
  const btcEntry: BitcoinEntry = {
    id: '7d395b44-0bac-49b9-98de-47e88dbc5a28-0',
    address: {
      type: 'xpub',
      value: 'vpub_common',
    },
    key: {
      type: 'hd-path',
      hdPath: "m/84'",
      seedId: 'c782ff2b-ba6e-43e2-9e2d-92d05cc37b03',
    },
    xpub: [
      {
        role: 'receive',
        xpub: 'vpub_receive',
      },
      {
        role: 'change',
        xpub: 'vpub_change',
      },
    ],
    blockchain: 1,
    createdAt: new Date(),
    addresses: [],
  };
  const ethEntry: EthereumEntry = {
    id: '50391c5d-a517-4b7a-9c42-1411e0603d30-0',
    address: {
      type: 'single',
      value: '0x0000000000000000000000000000000000000001',
    },
    key: {
      type: 'hd-path',
      hdPath: "m/44'",
      seedId: 'c782ff2b-ba6e-43e2-9e2d-92d05cc37b03',
    },
    blockchain: 100,
    createdAt: new Date(),
  };

  const tokenData: TokenData = {
    name: 'Wrapped Ether',
    blockchain: 100,
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    symbol: 'WETH',
    decimals: 18,
    type: 'ERC20',
  };

  const tokenInstance = new Token(tokenData);
  const tokenRegistry = new TokenRegistry([tokenData]);

  const bitcoinStoredTx = new StoredTransaction(
    tokenRegistry,
    {
      blockchain: 1,
      changes: [
        {
          address: 'tb1_receiver',
          amount: '10101',
          asset: 'BTC',
          direction: PersistentState.Direction.EARN,
          type: PersistentState.ChangeType.TRANSFER,
        },
        {
          address: 'tb1_receive_0',
          amount: '10101',
          asset: 'BTC',
          direction: PersistentState.Direction.SPEND,
          type: PersistentState.ChangeType.TRANSFER,
          wallet: '7d395b44-0bac-49b9-98de-47e88dbc5a28-0',
        },
        {
          address: 'tb1_receive_0',
          amount: '401',
          asset: 'BTC',
          direction: PersistentState.Direction.SPEND,
          type: PersistentState.ChangeType.FEE,
          wallet: '7d395b44-0bac-49b9-98de-47e88dbc5a28-0',
        },
        {
          address: 'tb1_change_0',
          amount: '3077',
          asset: 'BTC',
          direction: PersistentState.Direction.EARN,
          type: PersistentState.ChangeType.TRANSFER,
          wallet: '7d395b44-0bac-49b9-98de-47e88dbc5a28-0',
        },
      ],
      state: PersistentState.State.SUBMITTED,
      sinceTimestamp: new Date(),
      status: PersistentState.Status.UNKNOWN,
      txId: 'bitcoin_tx',
    },
    null,
  );
  const etherStoredTx = new StoredTransaction(
    tokenRegistry,
    {
      blockchain: 1,
      changes: [
        {
          address: '0x0000000000000000000000000000000000000002',
          amount: '1000000000000000',
          asset: 'ETH',
          direction: PersistentState.Direction.EARN,
          type: PersistentState.ChangeType.TRANSFER,
        },
        {
          address: '0x0000000000000000000000000000000000000001',
          amount: '1000000000000000',
          asset: 'ETH',
          direction: PersistentState.Direction.SPEND,
          type: PersistentState.ChangeType.TRANSFER,
          wallet: '50391c5d-a517-4b7a-9c42-1411e0603d30-0',
        },
        {
          address: '0x0000000000000000000000000000000000000001',
          amount: '42000000000000',
          asset: 'ETH',
          direction: PersistentState.Direction.SPEND,
          type: PersistentState.ChangeType.FEE,
          wallet: '50391c5d-a517-4b7a-9c42-1411e0603d30-0',
        },
      ],
      state: PersistentState.State.SUBMITTED,
      sinceTimestamp: new Date(),
      status: PersistentState.Status.UNKNOWN,
      txId: '0x0000000000000000000000000000000000000000000000000000000000000001',
    },
    null,
  );
  const erc20StoredTx = new StoredTransaction(
    tokenRegistry,
    {
      blockchain: 1,
      changes: [
        {
          address: '0x0000000000000000000000000000000000000002',
          amount: '1000000000000',
          asset: tokenData.address,
          direction: PersistentState.Direction.EARN,
          type: PersistentState.ChangeType.TRANSFER,
        },
        {
          address: '0x0000000000000000000000000000000000000001',
          amount: '1000000000000',
          asset: tokenData.address,
          direction: PersistentState.Direction.SPEND,
          type: PersistentState.ChangeType.TRANSFER,
          wallet: '50391c5d-a517-4b7a-9c42-1411e0603d30-0',
        },
        {
          address: '0x0000000000000000000000000000000000000001',
          amount: '120000000000000',
          asset: 'ETH',
          direction: PersistentState.Direction.SPEND,
          type: PersistentState.ChangeType.FEE,
          wallet: '50391c5d-a517-4b7a-9c42-1411e0603d30-0',
        },
      ],
      state: PersistentState.State.SUBMITTED,
      sinceTimestamp: new Date(),
      status: PersistentState.Status.UNKNOWN,
      txId: '0x0000000000000000000000000000000000000000000000000000000000000002',
    },
    null,
  );

  const persistentStateBalances: Partial<PersistentState.Balances> = {
    async list(address) {
      switch (address) {
        case 'vpub_receive':
          return [
            {
              blockchain: 1,
              address: 'tb1_receive_0',
              amount: '13579',
              asset: 'BTC',
              utxo: [
                {
                  amount: '13579',
                  txid: 'btc_tx_input_1',
                  vout: 0,
                },
              ],
            },
            {
              blockchain: 1,
              address: 'tb1_receive_1',
              amount: '2468',
              asset: 'BTC',
              utxo: [
                {
                  amount: '2468',
                  txid: 'btc_tx_input_2',
                  vout: 1,
                },
              ],
            },
            {
              blockchain: 1,
              address: 'tb1_change_0',
              amount: '3077',
              asset: 'BTC',
              utxo: [
                {
                  amount: '3077',
                  txid: 'btc_tx_input_3',
                  vout: 2,
                },
              ],
            },
          ];
      }

      return [];
    },
  };

  const cache = new Map<string, string>();

  const persistentStateCache: Partial<PersistentState.Cache> = {
    async get(id) {
      return cache.get(id) ?? null;
    },
    async put(id, value) {
      cache.set(id, value);
    },
  };

  const persistentStateXPubPos: Partial<PersistentState.XPubPosition> = {
    async getNext(xpub) {
      if (xpub === btcEntry.xpub.find(({ role }) => role === 'receive')?.xpub) {
        return 1;
      }

      return 0;
    },
  };

  const persistentStateVault: Partial<IEmeraldVault> = {
    async listEntryAddresses(id, role, start, limit) {
      if (id === btcEntry.id) {
        const addresses: CurrentAddress[] = [];

        if (role === 'receive') {
          for (let i = start; i <= limit; i += 1) {
            addresses.push({ address: `tb1_receive_${i}`, hdPath: `m/84'/1'/1'/0/${i}`, role: 'receive' });
          }
        }

        if (role === 'change') {
          for (let i = start; i <= limit; i += 1) {
            addresses.push({ address: `tb1_change_${i}`, hdPath: `m/84'/1'/1'/1/${i}`, role: 'change' });
          }
        }

        return addresses;
      }

      return [];
    },
  };

  const walletApi: Partial<WalletApi> = {
    balances: persistentStateBalances as PersistentState.Balances,
    cache: persistentStateCache as PersistentState.Cache,
    xPubPos: persistentStateXPubPos as PersistentState.XPubPosition,
    vault: persistentStateVault as IEmeraldVault,
  };

  const backendMock: Partial<BackendApi> = {
    async estimateFee(blockchain, blocks, mode) {
      if (isBitcoin(blockchain)) {
        switch (mode) {
          case 'avgLast':
            return 1024;
          case 'avgTail5':
            return 2048;
          case 'avgMiddle':
            return 3096;
        }
      } else {
        switch (mode) {
          case 'avgLast':
            return {
              max: 1_000_000_000,
              priority: 1_000_000,
            };
          case 'avgTail5':
            return {
              max: 2_000_000_000,
              priority: 2_000_000,
            };
          case 'avgMiddle':
            return {
              max: 3_000_000_000,
              priority: 3_000_000,
            };
        }
      }

      return 0;
    },
    async getBtcTx() {
      return {
        vin: [
          {
            sequence: 1000000001,
            txid: 'btc_tx_input_1',
            vout: 0,
          },
        ],
        vout: [
          {
            scriptPubKey: {
              address: 'tb1_receiver',
            },
            value: 0.00010101,
          },
          {
            scriptPubKey: {
              address: 'tb1_change_0',
            },
            value: 0.00003077,
          },
        ],
      };
    },
    async getEthTx(_blockchain, hash) {
      if (hash === '0x0000000000000000000000000000000000000000000000000000000000000002') {
        return {
          from: '0x0000000000000000000000000000000000000001',
          gas: '0xea60',
          input:
            '0xa9059cbb00000000000000000000000000000000000000000000000000000000000' +
            '00002000000000000000000000000000000000000000000000000000000e8d4a51000',
          nonce: '0x0',
          hash: '0x0000000000000000000000000000000000000000000000000000000000000002',
          maxFeePerGas: '0x77359400',
          maxPriorityFeePerGas: '0x1e8480',
          to: tokenData.address,
          type: '0x2',
          value: '0x0',
          r: '0x0',
          s: '0x1000000000000000000000000000000000000000',
          v: '0x2000000000000000000000000000000000000000',
        };
      }

      return {
        from: '0x0000000000000000000000000000000000000001',
        gas: '0x5208',
        input: '0x',
        nonce: '0x0',
        hash: '0x0000000000000000000000000000000000000000000000000000000000000001',
        maxFeePerGas: '0x77359400',
        maxPriorityFeePerGas: '0x1e8480',
        to: '0x0000000000000000000000000000000000000002',
        type: '0x2',
        value: '0x38d7ea4c68000',
        r: '0x0',
        s: '0x1000000000000000000000000000000000000000',
        v: '0x2000000000000000000000000000000000000000',
      };
    },
  };

  const store = createStore(walletApi as WalletApi, backendMock as BackendApi);

  store.dispatch({ type: ApplicationactionTypes.TOKENS, payload: [tokenData] });

  store.dispatch(
    setWalletsAction([
      {
        id: '7d395b44-0bac-49b9-98de-47e88dbc5a28',
        entries: [btcEntry],
        createdAt: new Date(),
      },
    ]),
  );

  store.dispatch(
    setBalanceAction({
      address: 'tb1_receive_0',
      balance: '13579/SAT',
      entryId: btcEntry.id,
      utxo: [
        {
          address: 'tb1_receive_0',
          sequence: 1000000001,
          txid: 'btc_tx_input_1',
          value: '13579/SAT',
          vout: 0,
        },
      ],
    }),
  );
  store.dispatch(
    setBalanceAction({
      address: 'tb1_receive_1',
      balance: '2468/SAT',
      entryId: btcEntry.id,
      utxo: [
        {
          address: 'tb1_receive_1',
          sequence: 2000000001,
          txid: 'btc_tx_input_2',
          value: '2468/SAT',
          vout: 1,
        },
      ],
    }),
  );
  store.dispatch(
    setBalanceAction({
      address: 'tb1_change_0',
      balance: '3077/SAT',
      entryId: btcEntry.id,
      utxo: [
        {
          address: 'tb1_change_0',
          sequence: 3000000001,
          txid: 'btc_tx_input_3',
          value: '3077/SAT',
          vout: 2,
        },
      ],
    }),
  );

  const whenFeeLoaded = (blockchain: BlockchainCode): Promise<void> =>
    new Promise((resolve) => {
      const checkFeeLoading = (): void => {
        if (store.getState().txStash.fee?.[blockchain] == null) {
          setTimeout(checkFeeLoading, 50);
        } else {
          resolve();
        }
      };

      checkFeeLoading();
    });

  const whenPrepared = (): Promise<void> =>
    new Promise((resolve) => {
      const checkPreparing = (): void => {
        if (store.getState().txStash.preparing) {
          setTimeout(checkPreparing, 50);
        } else {
          resolve();
        }
      };

      checkPreparing();
    });

  const getBalance = (entry: WalletEntry, asset: string, ownerAddress?: string): BigAmount => {
    const blockchain = blockchainIdToCode(entry.blockchain);

    if (tokenRegistry.hasAddress(blockchain, asset)) {
      const token = tokenRegistry.byAddress(blockchain, asset);

      if (ownerAddress == null) {
        return token.getAmount(3_000_000_000_000_000);
      }

      return token.getAmount(2_000_000_000_000_000);
    }

    return amountFactory(blockchain)(1_000_000_000_000_000_000);
  };

  it('should prepare Bitcoin initial transfer tx', async () => {
    store.dispatch(
      prepareTransaction({ action: TxAction.TRANSFER, entries: [btcEntry], entry: btcEntry }) as unknown as Action,
    );

    await whenFeeLoaded(BlockchainCode.BTC);
    await whenPrepared();

    const state = store.getState();

    const changeAddress = getChangeAddress(state);
    const fee = getFee(state, BlockchainCode.BTC);
    const tx = getTransaction(state);

    const { createTx } = new workflow.TxBuilder(
      {
        changeAddress,
        asset: 'BTC',
        entry: btcEntry,
        feeRange: fee.range,
        transaction: tx,
      },
      {
        getBalance,
        getUtxo(entry) {
          return getUtxo(state, entry.id);
        },
      },
      tokenRegistry,
    );

    const isCorrectCreateTx = workflow.isBitcoinCreateTx(createTx);

    expect(isCorrectCreateTx).toBeTruthy();

    if (isCorrectCreateTx) {
      createTx.amount = new Satoshi(10101);
      createTx.to = 'tb1_receiver';

      expect(createTx.build()).toEqual({
        fee: 401,
        inputs: [
          {
            address: 'tb1_receive_0',
            txid: 'btc_tx_input_1',
            vout: 0,
            amount: 13579,
            entryId: '7d395b44-0bac-49b9-98de-47e88dbc5a28-0',
            sequence: 1000000002,
          },
        ],
        outputs: [
          {
            address: 'tb1_receiver',
            amount: 10101,
          },
          {
            address: 'tb1_change_0',
            amount: 3077,
            entryId: '7d395b44-0bac-49b9-98de-47e88dbc5a28-0',
          },
        ],
      });
    }

    store.dispatch(reset());
  });

  it('should prepare Bitcoin cancel tx', async () => {
    store.dispatch(
      prepareTransaction({
        action: TxAction.CANCEL,
        entries: [btcEntry],
        entry: btcEntry,
        storedTx: bitcoinStoredTx,
      }) as unknown as Action,
    );

    await whenFeeLoaded(BlockchainCode.BTC);
    await whenPrepared();

    const state = store.getState();

    const changeAddress = getChangeAddress(state);
    const fee = getFee(state, BlockchainCode.BTC);
    const tx = getTransaction(state);

    const { createTx } = new workflow.TxBuilder(
      {
        changeAddress,
        asset: 'BTC',
        entry: btcEntry,
        feeRange: fee.range,
        transaction: tx,
      },
      {
        getBalance,
        getUtxo(entry) {
          return getUtxo(state, entry.id);
        },
      },
      tokenRegistry,
    );

    const isCorrectCreateTx = workflow.isBitcoinCancelCreateTx(createTx);

    expect(isCorrectCreateTx).toBeTruthy();

    if (isCorrectCreateTx) {
      expect(createTx.build()).toEqual({
        fee: 441,
        inputs: [
          {
            address: 'tb1_receive_0',
            txid: 'btc_tx_input_1',
            vout: 0,
            amount: 13579,
            entryId: '7d395b44-0bac-49b9-98de-47e88dbc5a28-0',
            sequence: 1000000002,
          },
        ],
        outputs: [
          {
            address: 'tb1_change_0',
            amount: 13138,
            entryId: '7d395b44-0bac-49b9-98de-47e88dbc5a28-0',
          },
        ],
      });
    }

    store.dispatch(reset());
  });

  it('should prepare Bitcoin speed up tx', async () => {
    store.dispatch(
      prepareTransaction({
        action: TxAction.SPEEDUP,
        entries: [btcEntry],
        entry: btcEntry,
        storedTx: bitcoinStoredTx,
      }) as unknown as Action,
    );

    await whenFeeLoaded(BlockchainCode.BTC);
    await whenPrepared();

    const state = store.getState();

    const changeAddress = getChangeAddress(state);
    const fee = getFee(state, BlockchainCode.BTC);
    const tx = getTransaction(state);

    const { createTx } = new workflow.TxBuilder(
      {
        changeAddress,
        asset: 'BTC',
        entry: btcEntry,
        feeRange: fee.range,
        transaction: tx,
      },
      {
        getBalance,
        getUtxo(entry) {
          return getUtxo(state, entry.id);
        },
      },
      tokenRegistry,
    );

    const isCorrectCreateTx = workflow.isBitcoinSpeedUpCreateTx(createTx);

    expect(isCorrectCreateTx).toBeTruthy();

    if (isCorrectCreateTx) {
      expect(createTx.build()).toEqual({
        fee: 441,
        inputs: [
          {
            address: 'tb1_receive_0',
            txid: 'btc_tx_input_1',
            vout: 0,
            amount: 13579,
            entryId: '7d395b44-0bac-49b9-98de-47e88dbc5a28-0',
            sequence: 1000000002,
          },
        ],
        outputs: [
          {
            address: 'tb1_receiver',
            amount: 10101,
          },
          {
            address: 'tb1_change_0',
            amount: 3037,
            entryId: '7d395b44-0bac-49b9-98de-47e88dbc5a28-0',
          },
        ],
      });
    }

    store.dispatch(reset());
  });

  it('should prepare Ethereum initial transfer tx', async () => {
    store.dispatch(
      prepareTransaction({ action: TxAction.TRANSFER, entries: [ethEntry], entry: ethEntry }) as unknown as Action,
    );

    await whenFeeLoaded(BlockchainCode.ETH);
    await whenPrepared();

    const state = store.getState();

    const changeAddress = getChangeAddress(state);
    const fee = getFee(state, BlockchainCode.ETH);
    const tx = getTransaction(state);

    const { createTx } = new workflow.TxBuilder(
      {
        changeAddress,
        asset: 'ETH',
        entry: ethEntry,
        feeRange: fee.range,
        transaction: tx,
      },
      {
        getBalance,
        getUtxo(entry) {
          return getUtxo(state, entry.id);
        },
      },
      tokenRegistry,
    );

    const isCorrectCreateTx = workflow.isEtherCreateTx(createTx);

    expect(isCorrectCreateTx).toBeTruthy();

    if (isCorrectCreateTx) {
      createTx.amount = new Wei(1_000_000_000_000_000);
      createTx.to = '0x0000000000000000000000000000000000000002';

      expect(createTx.build()).toEqual({
        blockchain: BlockchainCode.ETH,
        from: '0x0000000000000000000000000000000000000001',
        gas: 21000,
        gasPrice: new Wei(2_000_000_000),
        maxGasPrice: new Wei(2_000_000_000),
        priorityGasPrice: new Wei(2_000_000),
        to: '0x0000000000000000000000000000000000000002',
        type: 2,
        value: new Wei(1_000_000_000_000_000),
      });
    }

    store.dispatch(reset());
  });

  it('should prepare Ethereum cancel tx', async () => {
    store.dispatch(
      prepareTransaction({
        action: TxAction.CANCEL,
        entries: [ethEntry],
        entry: ethEntry,
        storedTx: etherStoredTx,
      }) as unknown as Action,
    );

    await whenFeeLoaded(BlockchainCode.ETH);
    await whenPrepared();

    const state = store.getState();

    const changeAddress = getChangeAddress(state);
    const fee = getFee(state, BlockchainCode.ETH);
    const tx = getTransaction(state);

    const { createTx } = new workflow.TxBuilder(
      {
        changeAddress,
        asset: 'ETH',
        entry: ethEntry,
        feeRange: fee.range,
        transaction: tx,
      },
      {
        getBalance,
        getUtxo(entry) {
          return getUtxo(state, entry.id);
        },
      },
      tokenRegistry,
    );

    const isCorrectCreateTx = workflow.isEtherCancelCreateTx(createTx);

    expect(isCorrectCreateTx).toBeTruthy();

    if (isCorrectCreateTx) {
      expect(createTx.build()).toEqual({
        blockchain: BlockchainCode.ETH,
        from: '0x0000000000000000000000000000000000000001',
        gas: 21000,
        gasPrice: new Wei(0),
        maxGasPrice: new Wei(2_200_000_000),
        nonce: 0,
        priorityGasPrice: new Wei(2_200_000),
        to: '0x0000000000000000000000000000000000000002',
        type: 2,
        value: new Wei(0),
      });
    }

    store.dispatch(reset());
  });

  it('should prepare Ethereum speed up tx', async () => {
    store.dispatch(
      prepareTransaction({
        action: TxAction.SPEEDUP,
        entries: [ethEntry],
        entry: ethEntry,
        storedTx: etherStoredTx,
      }) as unknown as Action,
    );

    await whenFeeLoaded(BlockchainCode.ETH);
    await whenPrepared();

    const state = store.getState();

    const changeAddress = getChangeAddress(state);
    const fee = getFee(state, BlockchainCode.ETH);
    const tx = getTransaction(state);

    const { createTx } = new workflow.TxBuilder(
      {
        changeAddress,
        asset: 'ETH',
        entry: ethEntry,
        feeRange: fee.range,
        transaction: tx,
      },
      {
        getBalance,
        getUtxo(entry) {
          return getUtxo(state, entry.id);
        },
      },
      tokenRegistry,
    );

    const isCorrectCreateTx = workflow.isEtherSpeedUpCreateTx(createTx);

    expect(isCorrectCreateTx).toBeTruthy();

    if (isCorrectCreateTx) {
      expect(createTx.build()).toEqual({
        blockchain: BlockchainCode.ETH,
        from: '0x0000000000000000000000000000000000000001',
        gas: 21000,
        gasPrice: new Wei(0),
        maxGasPrice: new Wei(2_200_000_000),
        nonce: 0,
        priorityGasPrice: new Wei(2_200_000),
        to: '0x0000000000000000000000000000000000000002',
        type: 2,
        value: new Wei(1_000_000_000_000_000),
      });
    }

    store.dispatch(reset());
  });

  it('should prepare ERC20 initial transfer tx', async () => {
    store.dispatch(
      prepareTransaction({ action: TxAction.TRANSFER, entries: [ethEntry], entry: ethEntry }) as unknown as Action,
    );

    await whenFeeLoaded(BlockchainCode.ETH);
    await whenPrepared();

    const state = store.getState();

    const changeAddress = getChangeAddress(state);
    const fee = getFee(state, BlockchainCode.ETH);
    const tx = getTransaction(state);

    const { createTx } = new workflow.TxBuilder(
      {
        changeAddress,
        asset: tokenData.address,
        entry: ethEntry,
        feeRange: fee.range,
        transaction: tx,
      },
      {
        getBalance,
        getUtxo(entry) {
          return getUtxo(state, entry.id);
        },
      },
      tokenRegistry,
    );

    const isCorrectCreateTx = workflow.isErc20CreateTx(createTx);

    expect(isCorrectCreateTx).toBeTruthy();

    if (isCorrectCreateTx) {
      createTx.amount = tokenInstance.getAmount(1_000_000_000_000);
      createTx.to = '0x0000000000000000000000000000000000000002';

      expect(createTx.build()).toEqual({
        blockchain: BlockchainCode.ETH,
        data:
          '0xa9059cbb00000000000000000000000000000000000000000000000000000000000' +
          '00002000000000000000000000000000000000000000000000000000000e8d4a51000',
        from: '0x0000000000000000000000000000000000000001',
        gas: 60000,
        gasPrice: new Wei(2_000_000_000),
        maxGasPrice: new Wei(2_000_000_000),
        priorityGasPrice: new Wei(2_000_000),
        to: tokenData.address.toLowerCase(),
        type: 2,
        value: new Wei(0),
      });
    }

    store.dispatch(reset());
  });

  it('should prepare ERC20 cancel tx', async () => {
    store.dispatch(
      prepareTransaction({
        action: TxAction.CANCEL,
        entries: [ethEntry],
        entry: ethEntry,
        storedTx: erc20StoredTx,
      }) as unknown as Action,
    );

    await whenFeeLoaded(BlockchainCode.ETH);
    await whenPrepared();

    const state = store.getState();

    const changeAddress = getChangeAddress(state);
    const fee = getFee(state, BlockchainCode.ETH);
    const tx = getTransaction(state);

    const { createTx } = new workflow.TxBuilder(
      {
        changeAddress,
        asset: tokenData.address,
        entry: ethEntry,
        feeRange: fee.range,
        transaction: tx,
      },
      {
        getBalance,
        getUtxo(entry) {
          return getUtxo(state, entry.id);
        },
      },
      tokenRegistry,
    );

    const isCorrectCreateTx = workflow.isErc20CancelCreateTx(createTx);

    expect(isCorrectCreateTx).toBeTruthy();

    if (isCorrectCreateTx) {
      expect(createTx.build()).toEqual({
        blockchain: BlockchainCode.ETH,
        from: '0x0000000000000000000000000000000000000001',
        gas: 60000,
        gasPrice: new Wei(0),
        maxGasPrice: new Wei(2_200_000_000),
        nonce: 0,
        priorityGasPrice: new Wei(2_200_000),
        to: tokenData.address.toLowerCase(),
        type: 2,
        value: new Wei(0),
      });
    }

    store.dispatch(reset());
  });

  it('should prepare ERC20 speed up tx', async () => {
    store.dispatch(
      prepareTransaction({
        action: TxAction.SPEEDUP,
        entries: [ethEntry],
        entry: ethEntry,
        storedTx: erc20StoredTx,
      }) as unknown as Action,
    );

    await whenFeeLoaded(BlockchainCode.ETH);
    await whenPrepared();

    const state = store.getState();

    const changeAddress = getChangeAddress(state);
    const fee = getFee(state, BlockchainCode.ETH);
    const tx = getTransaction(state);

    const { createTx } = new workflow.TxBuilder(
      {
        changeAddress,
        asset: tokenData.address,
        entry: ethEntry,
        feeRange: fee.range,
        transaction: tx,
      },
      {
        getBalance,
        getUtxo(entry) {
          return getUtxo(state, entry.id);
        },
      },
      tokenRegistry,
    );

    const isCorrectCreateTx = workflow.isErc20SpeedUpCreateTx(createTx);

    expect(isCorrectCreateTx).toBeTruthy();

    if (isCorrectCreateTx) {
      expect(createTx.build()).toEqual({
        blockchain: BlockchainCode.ETH,
        data:
          '0xa9059cbb00000000000000000000000000000000000000000000000000000000000' +
          '00002000000000000000000000000000000000000000000000000000000e8d4a51000',
        from: '0x0000000000000000000000000000000000000001',
        gas: 60000,
        gasPrice: new Wei(0),
        maxGasPrice: new Wei(2_200_000_000),
        nonce: 0,
        priorityGasPrice: new Wei(2_200_000),
        to: tokenData.address.toLowerCase(),
        type: 2,
        value: new Wei(0),
      });
    }

    store.dispatch(reset());
  });
});
