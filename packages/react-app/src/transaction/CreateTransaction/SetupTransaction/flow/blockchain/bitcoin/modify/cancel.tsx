import { workflow } from '@emeraldwallet/core';
import { BitcoinModifyFlow } from './modify';

export class BitcoinCancelFlow extends BitcoinModifyFlow<workflow.CreateBitcoinCancelTx> {}
