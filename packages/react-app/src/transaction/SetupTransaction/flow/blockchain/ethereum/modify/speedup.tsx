import { workflow } from '@emeraldwallet/core';
import { EthereumModifyFlow } from './modify';

type EthereumSpeedUpCreateTx = workflow.CreateEtherSpeedUpTx | workflow.CreateErc20SpeedUpTx;

export class EthereumSpeedUpFlow extends EthereumModifyFlow<EthereumSpeedUpCreateTx> {}
