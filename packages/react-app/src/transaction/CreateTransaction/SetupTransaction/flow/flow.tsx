import { WalletEntry, isBitcoinEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import { workflow } from '@emeraldwallet/core';
import {
  BitcoinCancelFlow,
  BitcoinSpeedUpFlow,
  BitcoinTransferFlow,
  EthereumCancelFlow,
  EthereumSpeedUpFlow,
  EthereumTransferFlow,
} from './blockchain';
import { BlockchainFlow, Data, DataProvider, Handler } from './types';

export class Flow {
  private readonly _flow: BlockchainFlow;

  constructor(data: Data<workflow.AnyCreateTx, WalletEntry>, dataProvider: DataProvider, handler: Handler) {
    const { entry, createTx } = data;

    if (isBitcoinEntry(entry)) {
      switch (createTx.meta.type) {
        case workflow.TxMetaType.BITCOIN_CANCEL:
          if (!workflow.isBitcoinCancelCreateTx(createTx)) {
            throw new Error('Unsupported Bitcoin transaction provided');
          }

          this._flow = new BitcoinCancelFlow({ ...data, entry, createTx }, dataProvider, handler);

          break;
        case workflow.TxMetaType.BITCOIN_SPEEDUP:
          if (!workflow.isBitcoinSpeedUpCreateTx(createTx)) {
            throw new Error('Unsupported Bitcoin transaction provided');
          }

          this._flow = new BitcoinSpeedUpFlow({ ...data, entry, createTx }, dataProvider, handler);

          break;
        case workflow.TxMetaType.BITCOIN_TRANSFER:
          if (!workflow.isAnyBitcoinCreateTx(createTx)) {
            throw new Error('Unsupported Bitcoin transaction provided');
          }

          this._flow = new BitcoinTransferFlow({ ...data, entry, createTx }, dataProvider, handler);

          break;
        default:
          throw new Error('Unsupported Bitcoin transaction action');
      }
    } else if (isEthereumEntry(entry)) {
      switch (createTx.meta.type) {
        case workflow.TxMetaType.ETHEREUM_CANCEL:
          if (!workflow.isEthereumCancelCreateTx(createTx)) {
            throw new Error('Unsupported Ethereum transaction provided');
          }

          this._flow = new EthereumCancelFlow({ ...data, entry, createTx }, dataProvider, handler);

          break;
        case workflow.TxMetaType.ETHEREUM_SPEEDUP:
          if (!workflow.isEthereumSpeedUpCreateTx(createTx)) {
            throw new Error('Unsupported Ethereum transaction provided');
          }

          this._flow = new EthereumSpeedUpFlow({ ...data, entry, createTx }, dataProvider, handler);

          break;
        case workflow.TxMetaType.ETHEREUM_TRANSFER:
          if (!workflow.isEthereumCreateTx(createTx)) {
            throw new Error('Unsupported Ethereum transaction provided');
          }

          this._flow = new EthereumTransferFlow({ ...data, entry, createTx }, dataProvider, handler);

          break;
        case workflow.TxMetaType.ERC20_CANCEL:
          if (!workflow.isErc20CancelCreateTx(createTx)) {
            throw new Error('Unsupported Ethereum transaction provided');
          }

          this._flow = new EthereumCancelFlow({ ...data, entry, createTx }, dataProvider, handler);

          break;
        case workflow.TxMetaType.ERC20_SPEEDUP:
          if (!workflow.isErc20SpeedUpCreateTx(createTx)) {
            throw new Error('Unsupported Ethereum transaction provided');
          }

          this._flow = new EthereumSpeedUpFlow({ ...data, entry, createTx }, dataProvider, handler);

          break;
        case workflow.TxMetaType.ERC20_TRANSFER:
          if (!workflow.isErc20CreateTx(createTx)) {
            throw new Error('Unsupported Ethereum transaction provided');
          }

          this._flow = new EthereumTransferFlow({ ...data, entry, createTx }, dataProvider, handler);

          break;
        default:
          throw new Error('Unsupported Ethereum transaction action');
      }
    } else {
      throw new Error('Unsupported entry provided');
    }
  }

  get flow(): BlockchainFlow {
    return this._flow;
  }
}
