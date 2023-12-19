import { BitcoinEntry, EthereumEntry, WalletEntry, isBitcoinEntry } from '@emeraldpay/emerald-vault-core';
import { EthereumRawTransaction, decodeData, isEthereumRawTransaction, workflow } from '@emeraldwallet/core';
import { TxAction } from '../types';
import {
  prepareBitcoinTx,
  prepareErc20ApproveTx,
  prepareErc20ConvertTx,
  prepareEthereumRecoveryTx,
  prepareEthereumTx,
  restoreBitcoinCancelTx,
  restoreBitcoinSpeedUpTx,
  restoreEthereumTx,
} from './blockchain';
import { Data, Handler, StoreProvider } from './types';

function ethereumTxTypeSelector<T>(rawTx: EthereumRawTransaction, whenEther: T, whenContract: T): T {
  const { name: method } = decodeData(rawTx.input);

  return method == null ? whenEther : whenContract;
}

export function getHandler(data: Data<WalletEntry>, storeProvider: StoreProvider): Handler | undefined {
  const { action, entry } = data;

  if (isBitcoinEntry(entry)) {
    const bitcoinData: Data<BitcoinEntry> = { ...data, entry };

    switch (action) {
      case TxAction.CANCEL:
        return restoreBitcoinCancelTx(bitcoinData, storeProvider);
      case TxAction.SPEEDUP:
        return restoreBitcoinSpeedUpTx(bitcoinData, storeProvider);
      case TxAction.TRANSFER:
        return prepareBitcoinTx(bitcoinData, storeProvider);
    }
  } else {
    const ethereumData: Data<EthereumEntry> = { ...data, entry };

    switch (action) {
      case TxAction.APPROVE:
        return prepareErc20ApproveTx(ethereumData, storeProvider);
      case TxAction.CANCEL:
        return restoreEthereumTx(ethereumData, storeProvider, {
          getTxMetaType(rawTx) {
            if (isEthereumRawTransaction(rawTx)) {
              return ethereumTxTypeSelector(rawTx, workflow.TxMetaType.ETHER_CANCEL, workflow.TxMetaType.ERC20_CANCEL);
            }

            throw new Error('Incorrect raw transaction provided');
          },
        });
      case TxAction.CONVERT:
        return prepareErc20ConvertTx(ethereumData, storeProvider);
      case TxAction.RECOVERY:
        return prepareEthereumRecoveryTx(ethereumData, storeProvider);
      case TxAction.SPEEDUP:
        return restoreEthereumTx(ethereumData, storeProvider, {
          getTxMetaType(rawTx) {
            if (isEthereumRawTransaction(rawTx)) {
              return ethereumTxTypeSelector(
                rawTx,
                workflow.TxMetaType.ETHER_SPEEDUP,
                workflow.TxMetaType.ERC20_SPEEDUP,
              );
            }

            throw new Error('Incorrect raw transaction provided');
          },
        });
      case TxAction.TRANSFER:
        return prepareEthereumTx(ethereumData, storeProvider);
    }
  }

  return undefined;
}
