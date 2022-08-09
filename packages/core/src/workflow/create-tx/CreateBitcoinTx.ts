import { BigAmount, CreateAmount, Units } from '@emeraldpay/bigamount';
import { BitcoinEntry, CurrentAddress, UnsignedBitcoinTx } from '@emeraldpay/emerald-vault-core';
import BigNumber from 'bignumber.js';
import { amountDecoder, amountFactory, BalanceUtxo, BlockchainCode, blockchainIdToCode } from '../../blockchains';
import { ValidationResult } from './types';

export interface BitcoinTxDetails<A extends BigAmount> {
  from: BalanceUtxo[];
  to: {
    address?: string;
    amount?: A;
  };
  change?: A;
}

export interface Output {
  address: string;
  amount: number;
  entryId?: string;
}

export interface TxMetric {
  // https://en.bitcoin.it/wiki/Weight_units
  weightOf(inputs: BalanceUtxo[], outputs: Output[]): number;
}

class AverageTxMetric implements TxMetric {
  weightOf(inputs: BalanceUtxo[], outputs: Output[]): number {
    /*
     * TODO
     *   Incorrect for many scenarios, based on numbers from https://en.bitcoin.it/wiki/Weight_units
     *   "Detailed Example" taken as is
     */
    return (
      22 + (128 + 16 + 4 + 92) * inputs.length + 16 + 4 + (32 + 4 + 100 + 1 + 1 + 72 + 1 + 33 + 16) * outputs.length
    );
  }
}

// https://bitcoinfees.net/, https://www.buybitcoinworldwide.com/fee-calculator
const DEFAULT_VKB_FEE = 1024;

// see https://en.bitcoin.it/wiki/Weight_units
export function convertWUToVB(wu: number): number {
  return wu / 4;
}

export class CreateBitcoinTx {
  public metric: TxMetric = new AverageTxMetric();
  public vkbPrice: BigAmount;

  private readonly amountDecoder: (n: string) => BigAmount;
  private readonly amountFactory: CreateAmount<BigAmount>;
  private readonly amountUnits: Units;
  private readonly blockchain: BlockchainCode;
  private readonly changeAddress: string;
  private readonly source: BitcoinEntry;
  private readonly tx: BitcoinTxDetails<BigAmount>;
  private readonly utxo: BalanceUtxo[];
  private readonly zero: BigAmount;

  constructor(source: BitcoinEntry, addresses: CurrentAddress[], utxo: BalanceUtxo[]) {
    this.source = source;
    this.utxo = utxo;

    this.blockchain = blockchainIdToCode(source.blockchain);

    const changeAddress = addresses.find((item) => item.role == 'change')?.address;

    if (changeAddress == null) {
      throw new Error('No change address found');
    }

    this.changeAddress = changeAddress;

    this.amountDecoder = amountDecoder(this.blockchain);
    this.amountFactory = amountFactory(this.blockchain) as CreateAmount<BigAmount>;

    this.zero = this.amountFactory(0);
    this.amountUnits = this.zero.units;

    this.vkbPrice = this.amountFactory(DEFAULT_VKB_FEE);

    this.tx = {
      from: [],
      to: {},
    };
  }

  get transaction(): BitcoinTxDetails<BigAmount> {
    return { ...this.tx };
  }

  set address(address: string) {
    this.tx.to.address = address;
    this.rebalance();
  }

  set feePrice(price: number) {
    this.vkbPrice = this.amountFactory(price);
    this.rebalance();
  }

  set requiredAmountBitcoin(amount: number | string) {
    this.requiredAmount = this.amountFactory(new BigNumber(amount).multipliedBy(this.amountUnits.top.multiplier));
  }

  get requiredAmount(): BigAmount {
    return this.tx.to.amount ?? this.zero;
  }

  set requiredAmount(value: BigAmount) {
    this.tx.to.amount = value;
    this.rebalance();
  }

  get totalToSpend(): BigAmount {
    return this.totalUtxo(this.tx.from ?? []);
  }

  get change(): BigAmount {
    return this.tx.change ?? this.zero;
  }

  get outputs(): Output[] {
    const result: Output[] = [];

    if (this.tx.to.address && this.tx.to.amount) {
      result.push({
        amount: this.tx.to.amount.number.toNumber(),
        address: this.tx.to.address,
      });
    }

    if (this.change.isPositive()) {
      result.push({
        amount: this.change.number.toNumber(),
        address: this.changeAddress,
        entryId: this.source.id,
      });
    }

    return result;
  }

  get totalAvailable(): BigAmount {
    return this.utxo.map((item) => this.amountDecoder(item.value)).reduce((a, b) => a.plus(b), this.zero);
  }

  get fees(): BigAmount {
    return this.totalToSpend.minus(this.change).minus(this.requiredAmount).max(this.zero);
  }

  totalUtxo(current: BalanceUtxo[]): BigAmount {
    return current.map((item) => this.amountDecoder(item.value)).reduce((t1, t2) => t1.plus(t2), this.zero);
  }

  rebalance(): boolean {
    if (typeof this.tx.to.amount == 'undefined' || this.tx.to.amount.isZero()) {
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

    const weight = this.metric.weightOf(from, [{ address: this.tx.to.address ?? '?', amount: 0 }]);
    const bareFees = this.vkbPrice.multiply(convertWUToVB(weight)).divide(1024);

    let change: BigAmount;

    if (requiredAmount.plus(bareFees).isLessOrEqualTo(totalSend)) {
      // sending more that receive + fees ==> keep change
      const weightWithChange = this.metric.weightOf(from, [
        { address: this.tx.to.address ?? '?', amount: 0 },
        { address: this.changeAddress, amount: 0, entryId: this.source.id },
      ]);

      const changeFees = this.vkbPrice.multiply(convertWUToVB(weightWithChange)).divide(1024);

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

  estimateFees(price: number): BigAmount {
    const size = this.metric.weightOf(this.tx.from ?? [], this.outputs);

    return this.amountFactory(price).multiply(size).divide(1024);
  }

  public validate(): ValidationResult {
    if (typeof this.tx.from == 'undefined' || this.tx.from.length == 0) {
      return ValidationResult.NO_FROM;
    }

    if (typeof this.tx.to.amount == 'undefined' || this.tx.to.amount.isZero()) {
      this.tx.from = [];

      return ValidationResult.NO_AMOUNT;
    }

    if ((this.tx.to.address?.length ?? 0) === 0) {
      return ValidationResult.NO_TO;
    }

    if (this.totalToSpend.isLessThan(this.tx.to.amount)) {
      return ValidationResult.INSUFFICIENT_FUNDS;
    }

    return ValidationResult.OK;
  }

  create(): UnsignedBitcoinTx {
    return {
      inputs: this.tx.from.map((item) => {
        return {
          txid: item.txid,
          amount: this.amountDecoder(item.value).number.toNumber(),
          vout: item.vout,
          address: item.address,
          entryId: this.source.id,
        };
      }),
      outputs: this.outputs,
      fee: this.fees.number.toNumber(),
    };
  }

  debug(): Record<string, unknown> {
    return {
      available: this.totalAvailable.toString(),
      send: this.tx.to.amount?.toString(),
      fess: this.fees.toString(),
      change: this.change.toString(),
      from: this.tx.from.map((item) => {
        return {
          address: item.address,
          amount: item.value,
        };
      }),
      to: this.outputs.map((item) => {
        return {
          address: item.address,
          amount: item.amount,
        };
      }),
    };
  }
}
