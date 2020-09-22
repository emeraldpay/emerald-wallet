import {CreateERC20Tx} from '..';
import {IDisplayTx} from './IDisplayTx';
import {Unit, FormatterBuilder} from '@emeraldpay/bigamount';

const fmt = new FormatterBuilder()
  .useTopUnit()
  .number(6)
  .append(" ")
  .unitCode()
  .build()

export class DisplayErc20Tx implements IDisplayTx {
  public tx: CreateERC20Tx;

  constructor(tx: CreateERC20Tx) {
    this.tx = tx;
  }

  public getMainUnit(): Unit {
    return this.tx.gasPrice.units.top
  }

  public amount (): string {
    return fmt.format(this.tx.amount);
  }

  public amountUnit (): string {
    return this.tx.tokenSymbol;
  }

  public fee (): string {
    return this.tx.gas.toString(10);
  }

  public feeCost (): string {
    return fmt.format(this.tx.getFees());
  }

  public feeCostUnit (): string {
    const unit = this.getMainUnit();
    return unit.name;
  }

  public feeUnit (): string {
    return 'Gas';
  }
}
