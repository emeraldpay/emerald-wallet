import { Unit, Units } from '@emeraldplatform/eth';
import { CreateERC20Tx } from '..';
import { IDisplayTx } from './IDisplayTx';

export class DisplayErc20Tx implements IDisplayTx {
  public tx: CreateERC20Tx;

  constructor (tx: CreateERC20Tx) {
    this.tx = tx;
  }

  public getMainUnit (): Unit {
    return Units.ETHER;
    // if (this.tx.amount === undefined) {
    //   return Units.ETHER;
    // }
    // if (this.tx.amount.toHex() === '0x0') {
    //   return Units.ETHER;
    // }
    // return this.tx.amount.getUnit();
  }

  public amount (): string {
    return this.tx.amount.amount;
    // const unit = this.getMainUnit();
    // if (!this.tx.amount) {
    //   return '-';
    // }
    // return this.tx.amount.toString(unit, 6, false, false);
  }

  public amountUnit (): string {
    const unit = this.getMainUnit();
    return unit.name;
  }

  public fee (): string {
    return this.tx.gas.toString(10);
  }

  public feeCost (): string {
    const unit = this.getMainUnit();
    return this.tx.getFees().toString(unit, 6, false, false);
  }

  public feeCostUnit (): string {
    const unit = this.getMainUnit();
    return unit.name;
  }

  public feeUnit (): string {
    return 'Gas';
  }
}
