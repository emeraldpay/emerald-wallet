import { BigAmount, CreateAmount, Units } from '@emeraldpay/bigamount';
import { BitcoinEntry, EntryId, UnsignedBitcoinTx } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, InputUtxo, amountDecoder, amountFactory, blockchainIdToCode } from '../../blockchains';
import { TxTarget, ValidationResult } from './types';

const DEFAULT_SEQUENCE = 0xfffffff0 as const;
const MAX_SEQUENCE = 0xffffffff as const;

/**
 * @see https://bitcoinfees.net
 * @see https://www.buybitcoinworldwide.com/fee-calculator
 */
const DEFAULT_VKB_FEE = 1024 as const;

export interface BitcoinTxDetails {
  amount?: BigAmount;
  change?: BigAmount;
  from: InputUtxo[];
  target: TxTarget;
  to?: string;
}

export interface BitcoinTxOutput {
  address: string;
  amount: number;
  entryId?: string;
}

export interface BitcoinTxMetric {
  /**
   * @see https://en.bitcoin.it/wiki/Weight_units
   */
  weightOf(inputs: InputUtxo[], outputs: BitcoinTxOutput[]): number;
}

interface CommonBitcoinTx {
  readonly changeAddress: string;
  readonly entryId: EntryId;
  readonly tx: BitcoinTxDetails;
  vkbPrice: BigAmount;
  metric: BitcoinTxMetric;
  create(): UnsignedBitcoinTx;
  estimateFees(price: number): BigAmount;
  estimateVkbPrice(price: BigAmount): number;
  rebalance(): boolean;
  totalUtxo(utxo: InputUtxo[]): BigAmount;
  validate(): ValidationResult;
}

abstract class AbstractBitcoinTx {
  abstract get change(): BigAmount;
  abstract get fees(): BigAmount;
  abstract set feePrice(price: number);
  abstract get outputs(): BitcoinTxOutput[];
  abstract set requiredAmount(value: BigAmount);
  abstract set target(target: TxTarget);
  abstract set toAddress(address: string | undefined);
  abstract get totalAvailable(): BigAmount;
  abstract get totalToSpend(): BigAmount;
  abstract get transaction(): BitcoinTxDetails;
}

export type BitcoinTx = CommonBitcoinTx & AbstractBitcoinTx;

class AverageTxMetric implements BitcoinTxMetric {
  weightOf(inputs: InputUtxo[], outputs: BitcoinTxOutput[]): number {
    /**
     * TODO
     *   Incorrect for many scenarios, based on numbers from https://en.bitcoin.it/wiki/Weight_units "Detailed Example"
     *   taken as is
     */
    return (
      22 + (128 + 16 + 4 + 92) * inputs.length + 16 + 4 + (32 + 4 + 100 + 1 + 1 + 72 + 1 + 33 + 16) * outputs.length
    );
  }
}

/**
 * @see https://en.bitcoin.it/wiki/Weight_units
 */
export function convertWUToVB(wu: number): number {
  return wu / 4;
}

export class CreateBitcoinTx implements BitcoinTx {
  readonly changeAddress: string;
  readonly entryId: EntryId;
  readonly tx: BitcoinTxDetails;

  public metric: BitcoinTxMetric = new AverageTxMetric();
  public vkbPrice: BigAmount;

  private readonly amountDecoder: (value: string) => BigAmount;
  private readonly amountFactory: CreateAmount<BigAmount>;
  private readonly amountUnits: Units;
  private readonly blockchain: BlockchainCode;
  private readonly utxo: InputUtxo[];
  private readonly zero: BigAmount;

  constructor(entry: BitcoinEntry, changeAddress: string, utxo: InputUtxo[]) {
    this.changeAddress = changeAddress;
    this.entryId = entry.id;
    this.utxo = utxo;

    this.tx = { from: [], target: TxTarget.MANUAL };

    this.blockchain = blockchainIdToCode(entry.blockchain);

    this.amountDecoder = amountDecoder(this.blockchain);
    this.amountFactory = amountFactory(this.blockchain);

    this.zero = this.amountFactory(0);
    this.amountUnits = this.zero.units;

    this.vkbPrice = this.amountFactory(DEFAULT_VKB_FEE);
  }

  get change(): BigAmount {
    return this.tx.change ?? this.zero;
  }

  get fees(): BigAmount {
    return this.totalToSpend.minus(this.change).minus(this.requiredAmount).max(this.zero);
  }

  set feePrice(price: number) {
    this.vkbPrice = this.amountFactory(price);

    this.rebalance();
  }

  get outputs(): BitcoinTxOutput[] {
    const result: BitcoinTxOutput[] = [];

    if (this.tx.amount != null && this.tx.to != null) {
      result.push({
        address: this.tx.to,
        amount: this.tx.amount.number.toNumber(),
      });
    }

    if (this.change.isPositive()) {
      result.push({
        address: this.changeAddress,
        amount: this.change.number.toNumber(),
        entryId: this.entryId,
      });
    }

    return result;
  }

  get requiredAmount(): BigAmount {
    return this.tx.amount ?? this.zero;
  }

  set requiredAmount(value: BigAmount) {
    this.tx.target = TxTarget.MANUAL;
    this.tx.amount = value;

    this.rebalance();
  }

  set target(target: TxTarget) {
    this.tx.target = target;

    this.rebalance();
  }

  set toAddress(address: string | undefined) {
    this.tx.to = address;

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

  get transaction(): BitcoinTxDetails {
    return { ...this.tx };
  }

  create(): UnsignedBitcoinTx {
    return {
      fee: this.fees.number.toNumber(),
      inputs: this.tx.from.map(({ address, sequence, txid, value, vout }) => ({
        address,
        txid,
        vout,
        amount: this.amountDecoder(value).number.toNumber(),
        entryId: this.entryId,
        sequence: this.adjustSequence(sequence),
      })),
      outputs: this.outputs,
    };
  }

  estimateFees(price: number): BigAmount {
    const size = this.metric.weightOf(this.tx.from, this.outputs);

    return this.amountFactory(price).multiply(convertWUToVB(size)).divide(1024);
  }

  estimateVkbPrice(fee: BigAmount): number {
    const size = this.metric.weightOf(this.tx.from, this.outputs);

    return fee.multiply(1024).divide(convertWUToVB(size)).number.toNumber();
  }

  rebalance(): boolean {
    let fees = this.zero;
    let send = this.zero;

    let from: InputUtxo[] = [];

    let { amount } = this.tx;

    const { to: address } = this.tx;

    const to = address == null ? [] : [{ address, amount: 0 }];

    if (this.tx.target === TxTarget.MANUAL) {
      if (amount == null || amount.isZero()) {
        this.tx.from = [];

        return false;
      }

      for (let i = 0; i < this.utxo.length && send.minus(fees).isLessThan(amount); i++) {
        from.push(this.utxo[i]);

        fees = this.estimateFeesFor(from, to);
        send = this.totalUtxo(from);
      }
    } else {
      from = this.utxo;

      fees = this.estimateFeesFor(from, to);
      send = this.totalUtxo(from);
    }

    let change: BigAmount = this.zero;

    if (this.tx.target === TxTarget.MANUAL) {
      if (amount == null || amount.isZero()) {
        return false;
      }

      if (amount.plus(fees).isLessThan(send)) {
        // sending more that receive + fees ==> keep change
        const changeWeight = this.metric.weightOf(from, [
          ...to,
          { address: this.changeAddress, amount: 0, entryId: this.entryId },
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

      this.tx.amount = amount;
    }

    this.tx.from = from;
    this.tx.change = change;

    return send.isGreaterOrEqualTo(amount);
  }

  totalUtxo(utxo: InputUtxo[]): BigAmount {
    return utxo
      .map((item) => this.amountDecoder(item.value))
      .reduce((carry, balance) => carry.plus(balance), this.zero);
  }

  validate(): ValidationResult {
    if (this.tx.amount == null || this.tx.amount.isZero()) {
      this.tx.from = [];

      return ValidationResult.NO_AMOUNT;
    }

    if (this.tx.from.length === 0) {
      return ValidationResult.NO_FROM;
    }

    if ((this.tx.to?.length ?? 0) === 0) {
      return ValidationResult.NO_TO;
    }

    if (this.totalToSpend.isLessThan(this.tx.amount)) {
      return ValidationResult.INSUFFICIENT_FUNDS;
    }

    return ValidationResult.OK;
  }

  private adjustSequence(sequence: number | undefined): number {
    if (sequence == null) {
      return DEFAULT_SEQUENCE;
    }

    return sequence < MAX_SEQUENCE ? sequence + 1 : MAX_SEQUENCE;
  }

  private estimateFeesFor(inputs: InputUtxo[], outputs: BitcoinTxOutput[]): BigAmount {
    const weight = this.metric.weightOf(inputs, outputs);

    return this.vkbPrice.multiply(convertWUToVB(weight)).divide(1024);
  }
}
