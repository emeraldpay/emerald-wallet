import { WalletEntry, isBitcoinEntry } from '@emeraldpay/emerald-vault-core';
import { TokenRegistry, workflow } from '@emeraldwallet/core';
import { StoredTransaction } from '../../txhistory/types';
import { TxAction } from '../types';
import {
  prepareBitcoinTransaction,
  prepareEthereumTransaction,
  restoreBitcoinTransaction,
  restoreEthereumTransaction,
} from './blockchain';
import { Handler, Provider } from './types';

interface Origin {
  action: TxAction;
  entry: WalletEntry;
  storedTx?: StoredTransaction;
}

export function getHandler({ action, entry, storedTx }: Origin, provider: Provider): Handler | undefined {
  if (isBitcoinEntry(entry)) {
    switch (action) {
      case TxAction.CANCEL:
        return restoreBitcoinTransaction(
          {
            entry,
            storedTx,
            metaType: workflow.TxMetaType.BITCOIN_CANCEL,
          },
          provider,
        );
      case TxAction.SPEEDUP:
        return restoreBitcoinTransaction(
          {
            entry,
            storedTx,
            metaType: workflow.TxMetaType.BITCOIN_SPEEDUP,
          },
          provider,
        );
      case TxAction.TRANSFER:
        return prepareBitcoinTransaction(
          {
            entry,
            storedTx,
            metaType: workflow.TxMetaType.BITCOIN_TRANSFER,
          },
          provider,
        );
    }
  } else {
    const tokenRegistry = new TokenRegistry(provider.getState().application.tokens);

    const isErc20 =
      storedTx?.changes.some(({ asset, blockchain }) => tokenRegistry.hasAddress(blockchain, asset)) ?? false;

    switch (action) {
      case TxAction.CANCEL:
        return restoreEthereumTransaction(
          {
            entry,
            storedTx,
            metaType: isErc20 ? workflow.TxMetaType.ERC20_CANCEL : workflow.TxMetaType.ETHEREUM_CANCEL,
          },
          provider,
        );
      case TxAction.SPEEDUP:
        return restoreEthereumTransaction(
          {
            entry,
            storedTx,
            metaType: isErc20 ? workflow.TxMetaType.ERC20_SPEEDUP : workflow.TxMetaType.ETHEREUM_SPEEDUP,
          },
          provider,
        );
      case TxAction.TRANSFER:
        return prepareEthereumTransaction(
          {
            entry,
            storedTx,
            metaType: isErc20 ? workflow.TxMetaType.ERC20_TRANSFER : workflow.TxMetaType.ETHEREUM_TRANSFER,
          },
          provider,
        );
    }
  }

  return undefined;
}
