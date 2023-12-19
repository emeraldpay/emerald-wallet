import { workflow } from '@emeraldwallet/core';
import { BitcoinModifyFlow } from './modify';

export class BitcoinSpeedUpFlow extends BitcoinModifyFlow<workflow.CreateBitcoinSpeedUpTx> {}
