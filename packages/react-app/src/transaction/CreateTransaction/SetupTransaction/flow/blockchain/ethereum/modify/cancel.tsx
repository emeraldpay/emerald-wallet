import { workflow } from '@emeraldwallet/core';
import { EthereumModifyFlow } from './modify';

type EthereumCancelCreateTx = workflow.CreateEtherCancelTx | workflow.CreateErc20CancelTx;

export class EthereumCancelFlow extends EthereumModifyFlow<EthereumCancelCreateTx> {}
