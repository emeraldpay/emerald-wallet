import { BigAmount } from '@emeraldpay/bigamount';
import { BitcoinEntry, EntryId, Uuid, WalletEntry, isBitcoinEntry } from '@emeraldpay/emerald-vault-core';
import {
  BlockchainCode,
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
  TokenBalanceBelong,
  accounts,
  settings,
  tokens,
  txStash,
} from '@emeraldwallet/store';
import * as React from 'react';
import { connect } from 'react-redux';
import { Asset } from '../../../common/SelectAsset';
import { Flow } from './flow';

interface OwnProps {
  entryId?: EntryId;
  initialAllowance?: Allowance;
  initialAsset?: string;
  walletId: Uuid;
  onCancel(): void;
}

interface StateProps {
  asset: string;
  assets: Asset[];
  createTx: workflow.AnyCreateTx;
  entry: WalletEntry;
  entries: WalletEntry[];
  fee: FeeState;
  ownerAddress?: string;
  tokenRegistry: TokenRegistry;
  getBalance(entry: WalletEntry, asset: string, ownerAddress?: string): BigAmount;
  getFiatBalance(asset: string): CurrencyAmount | undefined;
}

interface DispatchProps {
  getChangeAddress(entry: BitcoinEntry): Promise<string>;
  getFee(blockchain: BlockchainCode): void;
  setAsset(asset: string): void;
  setChangeAddress(changeAddress: string): void;
  setEntry(entry: WalletEntry, ownerAddress?: string): void;
  setStage(stage: CreateTxStage): void;
  setTransaction(tx: workflow.AnyPlainTx): void;
}

const SetupTransaction: React.FC<OwnProps & StateProps & DispatchProps> = ({
  asset,
  assets,
  createTx,
  entry,
  entries,
  fee,
  ownerAddress,
  tokenRegistry,
  getBalance,
  getChangeAddress,
  getFee,
  getFiatBalance,
  onCancel,
  setAsset,
  setChangeAddress,
  setEntry,
  setStage,
  setTransaction,
}) => {
  const mounted = React.useRef(true);

  const { flow } = new Flow(
    { asset, assets, createTx, entry, entries, fee, ownerAddress, tokenRegistry },
    { getBalance, getFiatBalance },
    { onCancel, setAsset, setEntry, setTransaction, setStage },
  );

  React.useEffect(() => {
    getFee(createTx.blockchain);
  }, [createTx.blockchain, getFee]);

  React.useEffect(() => {
    if (isBitcoinEntry(entry)) {
      getChangeAddress(entry).then((changeAddress) => {
        if (mounted.current) {
          setChangeAddress(changeAddress);
        }
      });
    }
  }, [entry, getChangeAddress, setChangeAddress]);

  React.useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  return flow.render();
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { entryId, initialAllowance, initialAsset, walletId }) => {
    const entries = accounts.selectors.findWallet(state, walletId)?.entries.filter((entry) => !entry.receiveDisabled);

    if (entries == null || entries.length === 0) {
      throw new Error('Something went wrong while getting entries from wallet.');
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

    const tokenRegistry = new TokenRegistry(state.application.tokens);

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

    const tokenAssets = tokenRegistry.byBlockchain(blockchain).reduce<Asset[]>((carry, { address, symbol }) => {
      const balance = getBalance(entry, address, ownerAddress);

      if (balance.isPositive()) {
        return [...carry, { address, balance, symbol }];
      }

      return carry;
    }, []);

    const { coinTicker } = Blockchains[blockchain].params;

    const assets = [{ balance: getBalance(entry, coinTicker), symbol: coinTicker }, ...tokenAssets];

    let asset = txStash.selectors.getAsset(state) ?? initialAllowance?.token.address ?? initialAsset ?? coinTicker;

    if (assets.find(({ address, symbol }) => address === asset || symbol === asset) == null) {
      const [{ address, symbol }] = assets;

      asset = address ?? symbol;
    }

    const changeAddress = txStash.selectors.getChangeAddress(state);
    const fee = txStash.selectors.getFee(state, blockchain);
    const tx = txStash.selectors.getTransaction(state);

    const { createTx } = new workflow.CreateTxConverter(
      { asset, changeAddress, entry, ownerAddress, feeRange: fee.range, transaction: tx },
      {
        getBalance,
        getUtxo(entry) {
          return accounts.selectors.getUtxo(state, entry.id);
        },
      },
      tokenRegistry,
    );

    return {
      asset,
      assets,
      createTx,
      entry,
      entries,
      fee,
      ownerAddress,
      tokenRegistry,
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
  (dispatch: any) => ({
    async getChangeAddress(entry) {
      const [{ address: changeAddress }] = await Promise.all(
        entry.xpub
          .filter(({ role }) => role === 'change')
          .map(({ role, xpub }) => dispatch(accounts.actions.getXPubPositionalAddress(entry.id, xpub, role))),
      );

      return changeAddress;
    },
    getFee(blockchain) {
      dispatch(txStash.actions.getFee(blockchain));
    },
    setAsset(asset) {
      dispatch(txStash.actions.setAsset(asset));
    },
    setChangeAddress(changeAddress) {
      dispatch(txStash.actions.setChangeAddress(changeAddress));
    },
    setEntry(entry, ownerAddress) {
      dispatch(txStash.actions.setEntry(entry, ownerAddress));
    },
    setStage(stage) {
      dispatch(txStash.actions.setStage(stage));
    },
    setTransaction(tx) {
      dispatch(txStash.actions.setTransaction(tx));
    },
  }),
)(SetupTransaction);
