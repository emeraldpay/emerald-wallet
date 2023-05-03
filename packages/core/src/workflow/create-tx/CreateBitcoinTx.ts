import { BigAmount, CreateAmount, Units } from '@emeraldpay/bigamount';
import { BitcoinEntry, CurrentAddress, UnsignedBitcoinTx } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, InputUtxo, amountDecoder, amountFactory, blockchainIdToCode } from '../../blockchains';
import { TxTarget, ValidationResult } from './types';

const DEFAULT_SEQUENCE = 0xfffffff0 as const;
const MAX_SEQUENCE = 0xffffffff as const;

/**
 * @see https://bitcoinfees.net
 * @see https://www.buybitcoinworldwide.com/fee-calculator
 */
const DEFAULT_VKB_FEE = 1024 as const;

export interface BitcoinTxDetails<T extends BigAmount> {
  change?: T;
  from: InputUtxo[];
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
  /**
   * @see https://en.bitcoin.it/wiki/Weight_units
   */
  weightOf(inputs: InputUtxo[], outputs: Output[]): number;
}

/**
 * @see https://en.bitcoin.it/wiki/Weight_units
 */
export function convertWUToVB(wu: number): number {
  return wu / 4;
}

class AverageTxMetric implements TxMetric {
  weightOf(inputs: InputUtxo[], outputs: Output[]): number {
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

export class CreateBitcoinTx {
  public metric: TxMetric = new AverageTxMetric();
  public vkbPrice: BigAmount;

  readonly changeAddress: string;

  private readonly amountDecoder: (value: string) => BigAmount;
  private readonly amountFactory: CreateAmount<BigAmount>;
  private readonly amountUnits: Units;
  private readonly blockchain: BlockchainCode;
  private readonly source: BitcoinEntry;
  private readonly tx: BitcoinTxDetails<BigAmount>;
  private readonly utxo: InputUtxo[];
  private readonly zero: BigAmount;

  constructor(source: BitcoinEntry, addresses: CurrentAddress[], utxo: InputUtxo[]) {
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

  set address(address: string | undefined) {
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
        address: this.tx.to.address,
        amount: this.tx.to.amount.number.toNumber(),
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
      inputs: this.tx.from.map(({ address, sequence, txid, value, vout }) => ({
        address,
        txid,
        vout,
        amount: this.amountDecoder(value).number.toNumber(),
        entryId: this.source.id,
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

    let { amount } = this.tx.to;

    const { address } = this.tx.to;

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

  totalUtxo(current: InputUtxo[]): BigAmount {
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

  private adjustSequence(sequence: number | undefined): number {
    if (sequence == null) {
      return DEFAULT_SEQUENCE;
    }

    return sequence < MAX_SEQUENCE ? sequence + 1 : MAX_SEQUENCE;
  }

  private estimateFeesFor(inputs: InputUtxo[], outputs: Output[]): BigAmount {
    const weight = this.metric.weightOf(inputs, outputs);

    return this.vkbPrice.multiply(convertWUToVB(weight)).divide(1024);
  }
}
