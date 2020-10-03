import {BitcoinEntry} from "@emeraldpay/emerald-vault-core";
import {amountDecoder, amountFactory, BalanceUtxo, BlockchainCode, blockchainIdToCode} from "../../blockchains";
import {BigAmount, CreateAmount, Units} from "@emeraldpay/bigamount";
import {ValidationResult} from "./types";
import {Satoshi} from "@emeraldpay/bigamount-crypto";
import BigNumber from "bignumber.js";
import {UnsignedBitcoinTx} from "@emeraldpay/emerald-vault-core/lib/types";

export interface BitcoinTxDetails<A extends BigAmount> {
  from: BalanceUtxo[];
  to: {
    address?: string,
    amount?: A
  };
  change?: A,
  weightPrice: A;
  size: number;
}

export interface Output {
  address: string,
  amount: number,
}

export interface TxMetric {
  /**
   * https://en.bitcoin.it/wiki/Weight_units
   *
   * @param inputs
   * @param outputs
   */
  weightOf(inputs: BalanceUtxo[], outputs: Output[]): number;
}

class AverageTxMetric implements TxMetric {

  weightOf(inputs: BalanceUtxo[], outputs: Output[]): number {
    //TODO incorrect for many scenarios, based on numbers from https://en.bitcoin.it/wiki/Weight_units "Detailed Example" taken as is
    return 22 +
      (128 + 16 + 4 + 92) * inputs.length +
      16 + 4 +
      (32 + 4 + 100 + 1 + 1 + 72 + 1 + 33 + 16) * outputs.length;
  }

}

export class CreateBitcoinTx<A extends BigAmount> {
  private tx: BitcoinTxDetails<A>
  private readonly utxo: BalanceUtxo[];
  private readonly amountDecoder: (n: string) => A;
  private readonly zero: A;
  private readonly blockchain: BlockchainCode;
  private readonly amountFactory: CreateAmount<A>;
  public metric: TxMetric = new AverageTxMetric();
  private readonly changeAddress: string;
  private readonly amountUnits: Units

  constructor(source: BitcoinEntry, utxo: BalanceUtxo[]) {
    this.utxo = utxo;
    this.blockchain = blockchainIdToCode(source.blockchain);
    this.changeAddress =
      source.addresses.find((a) => a.role == "change")?.address ||
      source.addresses.find((a) => a.role == "receive")?.address ||
      "NO_CHANGE";

    this.amountDecoder = amountDecoder(this.blockchain);
    this.amountFactory = amountFactory(this.blockchain) as CreateAmount<A>;
    this.zero = this.amountFactory(0);
    this.amountUnits = this.zero.units;
    this.tx = {
      weightPrice: this.amountFactory(100),
      from: [],
      to: {},
      size: 0
    };
  }

  totalUtxo(current: BalanceUtxo[]): A {
    return current
      .map((it) => this.amountDecoder(it.value))
      .reduce((t1, t2) => t1.plus(t2), this.zero);
  }

  get transaction(): BitcoinTxDetails<A> {
    return {...this.tx}
  }

  set address(address: string) {
    this.tx.to.address = address;
    this.rebalance();
  }

  set feePrice(price: number) {
    this.tx.weightPrice = this.amountFactory(price);
    this.rebalance();
  }

  set requiredAmountBitcoin(amount: number | string) {
    this.requiredAmount = this.amountFactory(
      new BigNumber(amount).multipliedBy(this.amountUnits.top.multiplier)
    );
  }

  set requiredAmount(value: A) {
    this.tx.to.amount = value;
    this.rebalance();
  }

  get requiredAmount(): A {
    return this.tx.to.amount || this.zero;
  }

  rebalance(): boolean {
    if (typeof this.tx.to.amount == "undefined" || this.tx.to.amount.isZero()) {
      this.tx.from = [];
      return false;
    }
    const requiredAmount = this.tx.to.amount;
    const from: BalanceUtxo[] = [];
    let totalFrom = this.zero;
    for (let i = 0; i < this.utxo.length && totalFrom.isLessThan(requiredAmount); i++) {
      from.push(this.utxo[i]);
      totalFrom = this.totalUtxo(from);
    }
    const totalSend = this.totalUtxo(from);

    const weight = this.metric.weightOf(
      from,
      [{address: this.tx.to.address || "?", amount: 0}]
    );
    const bareFees = this.tx.weightPrice.multiply(weight);

    let change: A;
    if (requiredAmount.plus(bareFees).isLessOrEqualTo(totalSend)) {
      // sending more that receive + fees ==> keep change
      const weightWithChange = this.metric.weightOf(
        from,
        [
          {address: this.tx.to.address || "?", amount: 0},
          {address: this.changeAddress, amount: 0}
        ]
      );
      const changeFees = this.tx.weightPrice.multiply(weightWithChange);
      change = totalSend.minus(requiredAmount).minus(changeFees);
      if (change.isNegative()) {
        // when doesn't have enough to pay fees to send change, i.e. too small change
        change = this.zero;
      }
    } else {
      change = this.zero;
    }

    this.tx.from = from;
    this.tx.change = change;

    return totalSend.isGreaterOrEqualTo(requiredAmount);
  }

  get totalToSpend(): A {
    return this.totalUtxo(this.tx.from || []);
  }

  get change(): A {
    return this.tx.change || this.zero;
  }

  get outputs(): Output[] {
    let result: Output[] = [];
    if (this.tx.to.address && this.tx.to.amount) {
      result.push({
        amount: this.tx.to.amount.getNumberByUnit(this.amountUnits.top).toNumber(),
        address: this.tx.to.address
      });
    }
    if (this.change.isPositive()) {
      result.push({
        amount: this.change.getNumberByUnit(this.amountUnits.top).toNumber(),
        address: this.changeAddress
      });
    }
    return result;
  }

  get totalAvailable(): A {
    return this.utxo
      .map((b) => this.amountDecoder(b.value))
      .reduce((a, b) => a.plus(b), this.zero);
  }

  get fees(): A {
    return this.totalToSpend.minus(this.change).minus(this.requiredAmount).max(this.zero);
  }

  estimateFees(price: number): A {
    const size = this.metric.weightOf(this.tx.from || [], this.outputs);
    return this.amountFactory(price).multiply(size)
  }

  public validate(): ValidationResult {
    if (typeof this.tx.from == "undefined" || this.tx.from.length == 0) {
      return ValidationResult.NO_FROM;
    }
    if (typeof this.tx.to.amount == "undefined" || this.tx.to.amount.isZero()) {
      this.tx.from = [];
      return ValidationResult.NO_AMOUNT;
    }
    if (!this.tx.to.address || this.tx.to.address == "") {
      return ValidationResult.NO_TO;
    }
    if (this.totalToSpend.isLessThan(this.tx.to.amount)) {
      return ValidationResult.INSUFFICIENT_FUNDS;
    }
    return ValidationResult.OK;
  }

  create(): UnsignedBitcoinTx {
    return {
      inputs: this.tx.from.map((it) => {
        return {
          txid: it.txid,
          amount: Satoshi.decode(it.value).number.toNumber(),
          vout: it.vout,
          address: it.address,
        }
      }),
      outputs: this.outputs,
      fee: this.fees.number.toNumber()
    }
  }

  debug(): any {
    return {
      available: this.totalAvailable.toString(),
      send: this.tx.to.amount?.toString(),
      fess: this.fees.toString(),
      change: this.change.toString(),
      from: this.tx.from.map((it) => {
        return {
          address: it.address,
          amount: it.value
        }
      }),
      to: this.outputs.map((it) => {
        return {
          address: it.address,
          amount: it.amount
        }
      })
    }
  }
}