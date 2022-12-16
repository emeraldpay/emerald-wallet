import { FormatterBuilder, Unit } from '@emeraldpay/bigamount';
import { DisplayTx } from './DisplayTx';
import { CreateEthereumTx } from '..';

const formatter = new FormatterBuilder().useTopUnit().number(5, true).build();

export class DisplayEtherTx implements DisplayTx {
  private readonly tx: CreateEthereumTx;

  constructor(tx: CreateEthereumTx) {
    this.tx = tx;
  }

  amount(): string {
    return formatter.format(this.tx.amount);
  }

  amountUnit(): string {
    const { name } = this.topUnit();

    return name;
  }

  fee(): string {
    return this.tx.gas.toString(10);
  }

  feeUnit(): string {
    return 'Gas';
  }

  feeCost(): string {
    return formatter.format(this.tx.getFees());
  }

  feeCostUnit(): string {
    const { name } = this.topUnit();

    return name;
  }

  topUnit(): Unit {
    return this.tx.amount.units.top;
  }
}
