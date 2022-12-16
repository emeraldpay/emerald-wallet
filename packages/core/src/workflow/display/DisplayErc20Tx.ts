import { FormatterBuilder, Unit } from '@emeraldpay/bigamount';
import { Wei } from '@emeraldpay/bigamount-crypto';
import { DisplayTx } from './DisplayTx';
import { CreateERC20Tx } from '..';

const formatter = new FormatterBuilder().useTopUnit().number(6, true).build();

export class DisplayErc20Tx implements DisplayTx {
  public tx: CreateERC20Tx;

  constructor(tx: CreateERC20Tx) {
    this.tx = tx;
  }

  public amount(): string {
    return formatter.format(this.tx.amount);
  }

  public amountUnit(): string {
    return this.tx.tokenSymbol;
  }

  public fee(): string {
    return this.tx.gas.toString(10);
  }

  public feeUnit(): string {
    return 'Gas';
  }

  public feeCost(): string {
    return formatter.format(this.tx.getFees());
  }

  public feeCostUnit(): string {
    const { code } = this.topUnit();

    return code;
  }

  public topUnit(): Unit {
    const { tx } = this;

    const gasPrice = tx.maxGasPrice ?? tx.gasPrice ?? Wei.ZERO;

    return gasPrice.units.top;
  }
}
