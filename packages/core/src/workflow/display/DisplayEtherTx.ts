import {CreateEthereumTx} from '..';
import {IDisplayTx} from './IDisplayTx';
import {Unit, FormatterBuilder} from '@emeraldpay/bigamount';

const fmt = new FormatterBuilder()
  .useTopUnit()
  .number(5, true)
  .build()

export class DisplayEtherTx implements IDisplayTx {
  public tx: CreateEthereumTx;

  constructor(tx: CreateEthereumTx) {
    this.tx = tx;
  }

  public getMainUnit(): Unit {
    return this.tx.amount.units.top
  }

  public amount (): string {
    if (!this.tx.amount) {
      return '-';
    }
    return fmt.format(this.tx.amount);
  }

  public amountUnit (): string {
    const unit = this.getMainUnit();
    return unit.name;
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
