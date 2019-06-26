import {DisplayTx} from "./DisplayTx";
import {CreateEthereumTx} from "..";
import {Unit, Units} from "@emeraldplatform/eth";

export class DisplayEtherTx implements DisplayTx {
  tx: CreateEthereumTx;

  constructor(tx: CreateEthereumTx) {
    this.tx = tx;
  }

  getMainUnit(): Unit {
    if (this.tx.amount == undefined) {
      return Units.ETHER;
    }
    if (this.tx.amount.toHex() == '0x0') {
      return Units.ETHER;
    }
    return this.tx.amount.getUnit();
  }

  amount(): string {
    const unit = this.getMainUnit();
    if (!this.tx.amount) {
      return '-';
    }
    return this.tx.amount.toString(unit, 6, false, false)
  }

  amountUnit(): string {
    const unit = this.getMainUnit();
    return unit.name;
  }

  fee(): string {
    return this.tx.gas.toString(10);
  }

  feeCost(): string {
    const unit = this.getMainUnit();
    return this.tx.getFees().toString(unit, 6, false, false);
  }

  feeCostUnit(): string {
    const unit = this.getMainUnit();
    return unit.name;
  }

  feeUnit(): string {
    return "Gas";
  }
}