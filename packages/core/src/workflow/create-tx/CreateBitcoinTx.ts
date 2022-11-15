import { BigAmount, CreateAmount, Units } from '@emeraldpay/bigamount';
import { BitcoinEntry, CurrentAddress, UnsignedBitcoinTx } from '@emeraldpay/emerald-vault-core';
import { TxTarget, ValidationResult } from './types';
import { BalanceUtxo, BlockchainCode, amountDecoder, amountFactory, blockchainIdToCode } from '../../blockchains';

export interface BitcoinTxDetails<T extends BigAmount> {
  change?: T;
  from: BalanceUtxo[];
  target: TxTarget;
  to: {
    address?: string;
    amount?: T;
  };
}

export interface Output {
  address: string;
  amount: number;
  entryId?: string;
}

export interface TxMetric {
  /** @see https://en.bitcoin.it/wiki/Weight_units */
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

/**
 * @see https://bitcoinfees.net
 * @see https://www.buybitcoinworldwide.com/fee-calculator
 */
const DEFAULT_VKB_FEE = 1024;

/** @see https://en.bitcoin.it/wiki/Weight_units */
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
    this.amountFactory = amountFactory(this.blockchain);

    this.zero = this.amountFactory(0);
    this.amountUnits = this.zero.units;

    this.vkbPrice = this.amountFactory(DEFAULT_VKB_FEE);

    this.tx = {
      from: [],
      target: TxTarget.MANUAL,
      to: {},
    };
  }

  set address(address: string) {
    this.tx.to.address = address;
    this.rebalance();
  }

  get change(): BigAmount {
    return this.tx.change ?? this.zero;
  }

  set feePrice(price: number) {
    this.vkbPrice = this.amountFactory(price);
    this.rebalance();
  }

  get fees(): BigAmount {
    return this.totalToSpend.minus(this.change).minus(this.requiredAmount).max(this.zero);
  }

  get outputs(): Output[] {
    const result: Output[] = [];

    if (this.tx.to.address != null && this.tx.to.amount != null) {
      result.push({
        amount: this.tx.to.amount.number.toNumber(),
        address: this.tx.to.address,
      });
    }

    if (this.change.isPositive()) {
      result.push({
        address: this.changeAddress,
        amount: this.change.number.toNumber(),
        entryId: this.source.id,
      });
    }

    return result;
  }

  get requiredAmount(): BigAmount {
    return this.tx.to.amount ?? this.zero;
  }

  set requiredAmount(value: BigAmount) {
    this.tx.target = TxTarget.MANUAL;
    this.tx.to.amount = value;
    this.rebalance();
  }

  set target(target: TxTarget) {
    this.tx.target = target;
    this.rebalance();
  }

  get totalAvailable(): BigAmount {
    return this.utxo
      .map((item) => this.amountDecoder(item.value))
      .reduce((carry, balance) => carry.plus(balance), this.zero);
  }

  get totalToSpend(): BigAmount {
    return this.totalUtxo(this.tx.from);
  }

  get transaction(): BitcoinTxDetails<BigAmount> {
    return { ...this.tx };
  }

  create(): UnsignedBitcoinTx {
    return {
      fee: this.fees.number.toNumber(),
      inputs: this.tx.from.map((item) => {
        return {
          address: item.address,
          amount: this.amountDecoder(item.value).number.toNumber(),
          entryId: this.source.id,
          txid: item.txid,
          vout: item.vout,
        };
      }),
      outputs: this.outputs,
    };
  }

  debug(): Record<string, unknown> {
    return {
      available: this.totalAvailable.toString(),
      change: this.change.toString(),
      fees: this.fees.toString(),
      from: this.tx.from.map((item) => {
        return {
          address: item.address,
          amount: item.value,
        };
      }),
      send: this.tx.to.amount?.toString(),
      to: this.outputs.map((item) => {
        return {
          address: item.address,
          amount: item.amount,
        };
      }),
    };
  }

  estimateFees(price: number): BigAmount {
    const size = this.metric.weightOf(this.tx.from, this.outputs);

    return this.amountFactory(price).multiply(convertWUToVB(size)).divide(1024);
  }

  rebalance(): boolean {
    let from: BalanceUtxo[] = [];
    let send = this.zero;

    if (this.tx.target === TxTarget.MANUAL) {
      const { amount } = this.tx.to;

      if (amount == null || amount.isZero()) {
        this.tx.from = [];

        return false;
      }

      for (let i = 0; i < this.utxo.length && send.isLessThan(amount); i++) {
        from.push(this.utxo[i]);

        send = this.totalUtxo(from);
      }
    } else {
      from = this.utxo;

      send = this.totalUtxo(from);
    }

    const { address } = this.tx.to;

    const to = address == null ? [] : [{ address, amount: 0 }];

    const weight = this.metric.weightOf(from, to);
    const fees = this.vkbPrice.multiply(convertWUToVB(weight)).divide(1024);

    let { amount } = this.tx.to;

    let change: BigAmount = this.zero;

    if (this.tx.target === TxTarget.MANUAL) {
      if (amount == null || amount.isZero()) {
        return false;
      }

      if (amount.plus(fees).isLessOrEqualTo(send)) {
        // sending more that receive + fees ==> keep change
        const changeWeight = this.metric.weightOf(from, [
          ...to,
          { address: this.changeAddress, amount: 0, entryId: this.source.id },
        ]);
        const changeFees = this.vkbPrice.multiply(convertWUToVB(changeWeight)).divide(1024);

        change = send.minus(amount).minus(changeFees);

        if (change.isNegative()) {
          // when doesn't have enough to pay fees to send change, i.e. too small change
          change = this.zero;
        }
      }
    } else {
      amount = send.minus(fees);

      this.tx.to.amount = amount;
    }

    this.tx.from = from;
    this.tx.change = change;

    return send.isGreaterOrEqualTo(amount);
  }

  totalUtxo(current: BalanceUtxo[]): BigAmount {
    return current
      .map((item) => this.amountDecoder(item.value))
      .reduce((carry, balance) => carry.plus(balance), this.zero);
  }

  validate(): ValidationResult {
    if (this.tx.to.amount == null || this.tx.to.amount.isZero()) {
      this.tx.from = [];

      return ValidationResult.NO_AMOUNT;
    }

    if (this.tx.from.length === 0) {
      return ValidationResult.NO_FROM;
    }

    if ((this.tx.to.address?.length ?? 0) === 0) {
      return ValidationResult.NO_TO;
    }

    if (this.totalToSpend.isLessThan(this.tx.to.amount)) {
      return ValidationResult.INSUFFICIENT_FUNDS;
    }

    return ValidationResult.OK;
  }
}
