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
import { Erc20ApproveFlow } from './blockchain/ethereum/approve';
import { BlockchainFlow, Data, DataProvider, Handler } from './types';

export class Flow {
  private readonly _flow: BlockchainFlow;

  constructor(data: Data<workflow.AnyCreateTx, WalletEntry>, dataProvider: DataProvider, handler: Handler) {
    const { entry, createTx } = data;

    if (isBitcoinEntry(entry)) {
      if (workflow.isBitcoinCancelCreateTx(createTx)) {
        this._flow = new BitcoinCancelFlow({ ...data, entry, createTx }, dataProvider, handler);
      } else if (workflow.isBitcoinSpeedUpCreateTx(createTx)) {
        this._flow = new BitcoinSpeedUpFlow({ ...data, entry, createTx }, dataProvider, handler);
      } else if (workflow.isAnyBitcoinCreateTx(createTx)) {
        this._flow = new BitcoinTransferFlow({ ...data, entry, createTx }, dataProvider, handler);
      } else {
        throw new Error('Unsupported Bitcoin transaction action');
      }
    } else if (isEthereumEntry(entry)) {
      if (workflow.isEtherCancelCreateTx(createTx)) {
        this._flow = new EthereumCancelFlow({ ...data, entry, createTx }, dataProvider, handler);
      } else if (workflow.isEtherSpeedUpCreateTx(createTx)) {
        this._flow = new EthereumSpeedUpFlow({ ...data, entry, createTx }, dataProvider, handler);
      } else if (workflow.isEtherCreateTx(createTx)) {
        this._flow = new EthereumTransferFlow({ ...data, entry, createTx }, dataProvider, handler);
      } else if (workflow.isErc20ApproveCreateTx(createTx)) {
        this._flow = new Erc20ApproveFlow({ ...data, entry, createTx }, dataProvider, handler);
      } else if (workflow.isErc20CancelCreateTx(createTx)) {
        this._flow = new EthereumCancelFlow({ ...data, entry, createTx }, dataProvider, handler);
      } else if (workflow.isErc20SpeedUpCreateTx(createTx)) {
        this._flow = new EthereumSpeedUpFlow({ ...data, entry, createTx }, dataProvider, handler);
      } else if (workflow.isErc20CreateTx(createTx)) {
        this._flow = new EthereumTransferFlow({ ...data, entry, createTx }, dataProvider, handler);
      } else {
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
