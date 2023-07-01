import { FormatterBuilder, Unit } from '@emeraldpay/bigamount';
import { Wei } from '@emeraldpay/bigamount-crypto';
import { CreateERC20Tx } from '..';
import { TokenRegistry } from '../../blockchains';
import { DisplayTx } from './DisplayTx';

const formatter = new FormatterBuilder().useTopUnit().number(6, true).build();

export class DisplayErc20Tx implements DisplayTx {
  tokenRegistry: TokenRegistry;
  transaction: CreateERC20Tx;

  constructor(transaction: CreateERC20Tx, tokenRegistry: TokenRegistry) {
    this.tokenRegistry = tokenRegistry;
    this.transaction = transaction;
  }

  amount(): string {
    return formatter.format(this.transaction.amount);
  }

  amountUnit(): string {
    return this.tokenRegistry.byAddress(this.transaction.blockchain, this.transaction.asset).symbol;
  }

  fee(): string {
    return this.transaction.gas.toString(10);
  }

  feeUnit(): string {
    return 'Gas';
  }

  feeCost(): string {
    return formatter.format(this.transaction.getFees());
  }

  feeCostUnit(): string {
    const { code } = this.topUnit();

    return code;
  }

  topUnit(): Unit {
    const { transaction } = this;

    const gasPrice = transaction.maxGasPrice ?? transaction.gasPrice ?? Wei.ZERO;

    return gasPrice.units.top;
  }
}
