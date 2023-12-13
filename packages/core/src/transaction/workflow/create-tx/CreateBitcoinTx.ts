import { CreateAmount } from '@emeraldpay/bigamount';
import { SatoshiAny } from '@emeraldpay/bigamount-crypto';
import { EntryId, UnsignedBitcoinTx } from '@emeraldpay/emerald-vault-core';
import BigNumber from 'bignumber.js';
import { BlockchainCode, InputUtxo, amountDecoder, amountFactory } from '../../../blockchains';
import { BitcoinPlainTx, CommonTx, TxMetaType, TxTarget, ValidationResult } from '../types';

const DEFAULT_SEQUENCE = 0xfffffff0 as const;
const MAX_SEQUENCE = 0xffffffff as const;

/**
 * @see https://bitcoinfees.net
 * @see https://www.buybitcoinworldwide.com/fee-calculator
 */
export const DEFAULT_VKB_FEE = 1024 as const;

export interface BitcoinTxDetails {
  amount?: SatoshiAny;
  change?: SatoshiAny;
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

interface CommonBitcoinTx extends CommonTx {
  readonly changeAddress?: string;
  readonly entryId: EntryId;
  readonly tx: BitcoinTxDetails;
  metric: BitcoinTxMetric;
  vkbPrice: number;
  build(): UnsignedBitcoinTx;
  dump(): BitcoinPlainTx;
  estimateVkbPrice(fee: SatoshiAny): number;
  getFees(): SatoshiAny;
  rebalance(): boolean;
  totalUtxo(utxo: InputUtxo[]): SatoshiAny;
  validate(): ValidationResult;
}

abstract class AbstractBitcoinTx {
  abstract set amount(value: SatoshiAny | BigNumber);
  abstract get change(): SatoshiAny;
  abstract get fees(): SatoshiAny;
  abstract set feePrice(price: number);
  abstract get outputs(): BitcoinTxOutput[];
  abstract set target(target: TxTarget);
  abstract set to(address: string | undefined);
  abstract get totalAvailable(): SatoshiAny;
  abstract get totalToSpend(): SatoshiAny;
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

export interface BitcoinTxOrigin {
  blockchain: BlockchainCode;
  changeAddress?: string;
  entryId: EntryId;
}

export class CreateBitcoinTx implements BitcoinTx {
  meta = { type: TxMetaType.BITCOIN_TRANSFER };

  readonly tx: BitcoinTxDetails;

  readonly blockchain: BlockchainCode;
  readonly changeAddress?: string;
  readonly entryId: EntryId;
  readonly utxo: InputUtxo[];

  public metric: BitcoinTxMetric = new AverageTxMetric();
  public vkbPrice: number;

  private readonly amountDecoder: (value: string) => SatoshiAny;
  private readonly amountFactory: CreateAmount<SatoshiAny>;

  private readonly zero: SatoshiAny;

  constructor({ blockchain, changeAddress, entryId }: BitcoinTxOrigin, utxo: InputUtxo[]) {
    this.tx = { from: [], target: TxTarget.MANUAL };

    this.blockchain = blockchain;
    this.changeAddress = changeAddress;
    this.entryId = entryId;
    this.utxo = utxo;

    this.amountDecoder = amountDecoder<SatoshiAny>(this.blockchain);
    this.amountFactory = amountFactory(this.blockchain) as CreateAmount<SatoshiAny>;

    this.vkbPrice = DEFAULT_VKB_FEE;
    this.zero = this.amountFactory(0);
  }

  static fromPlain(origin: BitcoinTxOrigin, plain: BitcoinPlainTx): CreateBitcoinTx {
    const tx = new CreateBitcoinTx(origin, plain.utxo);

    const decoder = amountDecoder<SatoshiAny>(origin.blockchain);

    tx.amount = decoder(plain.amount);
    tx.target = plain.target;
    tx.to = plain.to;
    tx.vkbPrice = plain.vkbPrice;
    tx.rebalance();

    return tx;
  }

  get change(): SatoshiAny {
    return this.tx.change ?? this.zero;
  }

  get fees(): SatoshiAny {
    return this.totalToSpend.minus(this.change).minus(this.amount).max(this.zero);
  }

  set feePrice(price: number) {
    this.vkbPrice = price;

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

    if (this.changeAddress != null && this.change.isPositive()) {
      result.push({
        address: this.changeAddress,
        amount: this.change.number.toNumber(),
        entryId: this.entryId,
      });
    }

    return result;
  }

  get amount(): SatoshiAny {
    return this.tx.amount ?? this.zero;
  }

  set amount(value: SatoshiAny | BigNumber) {
    this.setAmount(value);
  }

  /**
   * @deprecated
   *   Added to make one logic for Bitcoin and Ethereum flow.
   *   Create getter after refactoring Ethereum create transaction class.
   */
  getAsset(): string {
    return this.amount.units.top.code;
  }

  /**
   * @deprecated
   *   Added to make one logic for Bitcoin and Ethereum flow.
   *   Use setter after refactoring Ethereum create transaction class.
   */
  setAmount(value: SatoshiAny | BigNumber): void {
    this.tx.target = TxTarget.MANUAL;

    if (SatoshiAny.is(value)) {
      this.tx.amount = value;
    } else {
      const { units } = this.amount;

      this.tx.amount = new SatoshiAny(1, units).multiply(units.top.multiplier).multiply(value);
    }

    this.rebalance();
  }

  set target(target: TxTarget) {
    this.tx.target = target;

    this.rebalance();
  }

  set to(address: string | undefined) {
    this.tx.to = address;

    this.rebalance();
  }

  get totalAvailable(): SatoshiAny {
    return this.utxo
      .map((item) => this.amountDecoder(item.value))
      .reduce((carry, balance) => carry.plus(balance), this.zero);
  }

  get totalToSpend(): SatoshiAny {
    return this.totalUtxo(this.tx.from);
  }

  get transaction(): BitcoinTxDetails {
    return { ...this.tx };
  }

  build(): UnsignedBitcoinTx {
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

  dump(): BitcoinPlainTx {
    return {
      amount: this.amount.encode(),
      blockchain: this.blockchain,
      changeAddress: this.changeAddress,
      meta: { type: this.meta.type },
      originalFees: this.fees.encode(),
      target: this.tx.target,
      vkbPrice: this.vkbPrice,
      to: this.tx.to,
      utxo: this.utxo,
    };
  }

  estimateFeesFor(inputs: InputUtxo[], outputs: BitcoinTxOutput[]): SatoshiAny {
    const weight = this.metric.weightOf(inputs, outputs);

    return this.amountFactory(this.vkbPrice).multiply(convertWUToVB(weight)).divide(1024);
  }

  estimateVkbPrice(fee: SatoshiAny): number {
    const size = this.metric.weightOf(this.tx.from, this.outputs);

    return fee.multiply(1024).divide(convertWUToVB(size)).number.toNumber();
  }

  getFees(): SatoshiAny {
    const size = this.metric.weightOf(this.tx.from, this.outputs);

    return this.amountFactory(this.vkbPrice).multiply(convertWUToVB(size)).divide(1024);
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

    let change: SatoshiAny = this.zero;

    if (this.tx.target === TxTarget.MANUAL) {
      if (amount == null || amount.isZero()) {
        return false;
      }

      if (this.changeAddress != null && amount.plus(fees).isLessThan(send)) {
        // sending more that receive + fees ==> keep change
        const changeFees = this.estimateFeesFor(from, [
          ...to,
          {
            address: this.changeAddress,
            amount: 0,
            entryId: this.entryId,
          },
        ]);

        change = send.minus(amount).minus(changeFees);

        if (change.isNegative()) {
          // when doesn't have enough to pay fees to send change, i.e. too small change
          change = this.zero;
        }
      }
    } else {
      amount = send.minus(fees).max(this.zero);

      this.tx.amount = amount;
    }

    this.tx.from = from;
    this.tx.change = change;

    return send.isGreaterOrEqualTo(amount);
  }

  totalUtxo(utxo: InputUtxo[]): SatoshiAny {
    return utxo
      .map((item) => this.amountDecoder(item.value))
      .reduce((carry, balance) => carry.plus(balance), this.zero);
  }

  validate(): ValidationResult {
    if (this.changeAddress == null) {
      return ValidationResult.NO_CHANGE_ADDRESS;
    }

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
}
