import { BigAmount } from '@emeraldpay/bigamount';
import { EntryId, EntryIdOp, Uuid, WalletEntry } from '@emeraldpay/emerald-vault-core';
import {
  Blockchains,
  CurrencyAmount,
  TokenRegistry,
  amountFactory,
  blockchainIdToCode,
  workflow,
} from '@emeraldwallet/core';
import {
  Allowance,
  CreateTxStage,
  FeeState,
  IState,
  StoredTransaction,
  TokenBalanceBelong,
  TxAction,
  accounts,
  settings,
  tokens,
  txStash,
  txhistory,
} from '@emeraldwallet/store';
import { Box, CircularProgress, Grid, Typography } from '@mui/material';
import * as React from 'react';
import { connect } from 'react-redux';
import { Asset } from '../../common/SelectAsset';
import { Flow } from './flow';

interface OwnProps {
  action?: TxAction;
  entryId?: EntryId;
  initialAllowance?: Allowance;
  initialAsset?: string;
  storedTx?: StoredTransaction;
  walletId?: Uuid;
  onCancel(): void;
}

interface StateProps {
  asset: string;
  assets: Asset[];
  createTx: workflow.AnyCreateTx;
  entries: WalletEntry[];
  entry: WalletEntry;
  fee: FeeState;
  isPreparing: boolean;
  ownerAddress?: string;
  tokenRegistry: TokenRegistry;
  transactionFee?: workflow.FeeRange;
  updatedStoredTx?: StoredTransaction;
  getBalance(entry: WalletEntry, asset: string, ownerAddress?: string): BigAmount;
  getFiatBalance(asset: string): CurrencyAmount | undefined;
}

interface TxOrigin {
  action: TxAction;
  entries: WalletEntry[];
  entry: WalletEntry;
}

interface DispatchProps {
  prepareTransaction(origin: TxOrigin): void;
  setAsset(asset: string): void;
  setEntry(entry: WalletEntry, ownerAddress?: string): void;
  setStage(stage: CreateTxStage): void;
  setTransaction(tx: workflow.AnyPlainTx): void;
}

const SetupTransaction: React.FC<OwnProps & StateProps & DispatchProps> = ({
  asset,
  assets,
  createTx,
  entries,
  entry,
  fee,
  isPreparing,
  ownerAddress,
  tokenRegistry,
  transactionFee,
  initialAllowance: allowance,
  updatedStoredTx: storedTx,
  action = TxAction.TRANSFER,
  getBalance,
  getFiatBalance,
  onCancel,
  prepareTransaction,
  setAsset,
  setEntry,
  setStage,
  setTransaction,
}) => {
  const entryId = React.useRef<EntryId>();
  const mounted = React.useRef(true);

  React.useEffect(() => {
    if (entry.id !== entryId.current) {
      entryId.current = entry.id;

      prepareTransaction({ action, entries, entry });
    }
  }, [action, entries, entry, storedTx, prepareTransaction]);

  React.useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  if (isPreparing) {
    return (
      <Grid container alignItems="center" justifyContent="center">
        <Grid item>
          <Box pr={2}>
            <CircularProgress />
          </Box>
        </Grid>
        <Grid item>
          <Typography variant="h5">Loading...</Typography>
          <Typography>Please wait while transaction being prepared.</Typography>
        </Grid>
      </Grid>
    );
  }

  const { flow } = new Flow(
    { allowance, asset, assets, createTx, entry, entries, fee, ownerAddress, storedTx, tokenRegistry, transactionFee },
    { getBalance, getFiatBalance },
    { onCancel, setAsset, setEntry, setTransaction, setStage },
  );

  return flow.render();
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { action, entryId, initialAllowance, initialAsset, storedTx, walletId }) => {
    if (walletId == null) {
      if (entryId == null) {
        throw new Error('Wallet id or entry id should be provided');
      }

      walletId = EntryIdOp.of(entryId).extractWalletId();
    }

    const tokenRegistry = new TokenRegistry(state.application.tokens);

    const entries =
      accounts.selectors.findWallet(state, walletId)?.entries.filter(({ blockchain, id, receiveDisabled }) => {
        let valid = !receiveDisabled;

        if (action === TxAction.APPROVE || action === TxAction.CONVERT) {
          const blockchainCode = blockchainIdToCode(blockchain);

          switch (action) {
            case TxAction.APPROVE:
              valid &&= tokenRegistry.hasAnyToken(blockchainCode);

              break;
            case TxAction.CONVERT:
              valid &&= tokenRegistry.hasWrappedToken(blockchainCode);

              break;
          }

          valid &&= accounts.selectors.getBalance(state, id, amountFactory(blockchainCode)(0)).isPositive();
        }

        return valid;
      }) ?? [];

    if (entries.length === 0) {
      throw new Error('Something went wrong while getting entries from wallet');
    }

    const { entry: originEntry, ownerAddress = initialAllowance?.ownerAddress } = txStash.selectors.getEntry(state);

    let entry: WalletEntry;

    if (originEntry == null) {
      [entry] = entries;

      if (entryId != null) {
        entry = entries.find(({ id }) => id === entryId) ?? entry;
      }
    } else {
      entry = originEntry;
    }

    const blockchain = blockchainIdToCode(entry.blockchain);

    const getBalance = (entry: WalletEntry, asset: string, ownerAddress?: string): BigAmount => {
      if (tokenRegistry.hasAddress(blockchain, asset)) {
        const token = tokenRegistry.byAddress(blockchain, asset);
        const tokenZeroAmount = token.getAmount(0);

        if (entry.address == null) {
          return tokenZeroAmount;
        }

        return (
          tokens.selectors.selectBalance(state, blockchain, entry.address.value, token.address, {
            belonging: ownerAddress == null ? TokenBalanceBelong.OWN : TokenBalanceBelong.ALLOWED,
            belongsTo: ownerAddress,
          }) ?? tokenZeroAmount
        );
      }

      return accounts.selectors.getBalance(state, entry.id, amountFactory(blockchain)(0));
    };

    const tokenAssets = tokenRegistry
      .byBlockchain(blockchain)
      .reduce<Asset[]>(
        (carry, { address, symbol }) => [
          ...carry,
          {
            address,
            symbol,
            balance: getBalance(entry, address, ownerAddress),
          },
        ],
        [],
      )
      .filter(({ balance }) => balance.isPositive());

    const { coinTicker } = Blockchains[blockchain].params;

    let assets: Asset[];

    if (action !== TxAction.APPROVE && ownerAddress == null) {
      assets = [{ balance: getBalance(entry, coinTicker), symbol: coinTicker }, ...tokenAssets];
    } else {
      assets = tokenAssets;
    }

    let asset = txStash.selectors.getAsset(state) ?? initialAllowance?.token.address ?? initialAsset ?? coinTicker;

    if (assets.length > 0 && !assets.some(({ address, symbol }) => address === asset || symbol === asset)) {
      const [{ address, symbol }] = assets;

      asset = address ?? symbol;
    }

    const changeAddress = txStash.selectors.getChangeAddress(state);
    const fee = txStash.selectors.getFee(state, blockchain);
    const tx = txStash.selectors.getTransaction(state);

    const { createTx } = new workflow.TxBuilder(
      { asset, changeAddress, entry, ownerAddress, feeRange: fee.range, transaction: tx },
      {
        getBalance,
        getUtxo(entry) {
          return accounts.selectors.getUtxo(state, entry.id);
        },
      },
      tokenRegistry,
    );

    const isPreparing = txStash.selectors.isPreparing(state);
    const transactionFee = txStash.selectors.getTransactionFee(state, blockchain);

    return {
      assets,
      createTx,
      entries,
      entry,
      fee,
      isPreparing,
      ownerAddress,
      tokenRegistry,
      transactionFee,
      asset: createTx.getAsset(),
      updatedStoredTx:
        storedTx == null ? undefined : txhistory.selectors.transactionById(state, storedTx.txId) ?? storedTx,
      getBalance,
      getFiatBalance(asset) {
        const balance = getBalance(entry, asset);

        const rate = settings.selectors.fiatRate(state, balance);

        if (rate == null) {
          return undefined;
        }

        return CurrencyAmount.create(
          balance.getNumberByUnit(balance.units.top).multipliedBy(rate).toNumber(),
          settings.selectors.fiatCurrency(state),
        );
      },
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, { initialAllowance, storedTx }) => ({
    prepareTransaction({ action, entries, entry }) {
      dispatch(txStash.actions.prepareTransaction({ action, entries, entry, initialAllowance, storedTx }));
      dispatch(txStash.actions.estimateGasLimit());
    },
    setAsset(asset) {
      dispatch(txStash.actions.setAsset(asset));
      dispatch(txStash.actions.estimateGasLimit());
    },
    setEntry(entry, ownerAddress) {
      dispatch(txStash.actions.setEntry(entry, ownerAddress));
    },
    setStage(stage) {
      dispatch(txStash.actions.setStage(stage));
    },
    setTransaction(tx) {
      dispatch(txStash.actions.setTransaction(tx));
      dispatch(txStash.actions.estimateGasLimit());
    },
  }),
)(SetupTransaction);
