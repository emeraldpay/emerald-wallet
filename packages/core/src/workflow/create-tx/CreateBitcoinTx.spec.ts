import { SATOSHIS, Satoshi } from '@emeraldpay/bigamount-crypto';
import { BitcoinEntry } from '@emeraldpay/emerald-vault-core';
import { CreateBitcoinTx, Output, TxMetric, convertWUToVB } from './CreateBitcoinTx';
import { TxTarget, ValidationResult } from './types';
import { BalanceUtxo } from '../../blockchains';

const basicEntry: BitcoinEntry = {
  address: undefined,
  addresses: [],
  blockchain: 1,
  createdAt: new Date(),
  id: 'f76416d7-3510-4d80-85df-52e7222e56df-1',
  key: undefined,
  xpub: [],
};

class TestMetric implements TxMetric {
  readonly inputWeight: number;
  readonly outputWeight: number;

  constructor(inputWeight: number, outputWeight: number) {
    this.inputWeight = inputWeight;
    this.outputWeight = outputWeight;
  }

  weight(inputs: number, outputs: number): number {
    return inputs * this.inputWeight + outputs * this.outputWeight;
  }

  weightOf(inputs: BalanceUtxo[], outputs: Output[]): number {
    return this.weight(inputs.length, outputs.length);
  }

  fees(inputs: number, outputs: number, create: CreateBitcoinTx): number {
    return create.vkbPrice
      .multiply(convertWUToVB(this.weight(inputs, outputs)))
      .number.dividedBy(SATOSHIS.top.multiplier)
      .dividedBy(1024)
      .toNumber();
  }
}

const defaultMetric = new TestMetric(120, 80);

describe('CreateBitcoinTx', () => {
  const defaultBitcoin = new CreateBitcoinTx(
    basicEntry,
    [{ address: 'addrchange', hdPath: "m/84'", role: 'change' }],
    [],
  );

  defaultBitcoin.metric = defaultMetric;
  defaultBitcoin.feePrice = 100;

  it('create', () => {
    const act = new CreateBitcoinTx(basicEntry, [{ address: 'addrchange', hdPath: "m/84'", role: 'change' }], []);

    expect(act).toBeDefined();
    expect(act.totalToSpend).toBeDefined();
    expect(act.totalToSpend.isZero()).toBeTruthy();
    expect(act.validate()).not.toBe(ValidationResult.OK);
  });

  it('total zero for empty utxo', () => {
    expect(defaultBitcoin.totalUtxo([]).toString()).toBe(Satoshi.ZERO.toString());
  });

  it('total for single utxo', () => {
    expect(
      defaultBitcoin
        .totalUtxo([{ txid: '', vout: 0, value: Satoshi.fromBitcoin(0.5).encode(), address: 'ADDR' }])
        .toString(),
    ).toBe(Satoshi.fromBitcoin(0.5).toString());
  });

  it('total for few utxo', () => {
    expect(
      defaultBitcoin
        .totalUtxo([
          { txid: '1', vout: 0, value: Satoshi.fromBitcoin(0.5).encode(), address: 'ADDR' },
          { txid: '2', vout: 0, value: Satoshi.fromBitcoin(0.61).encode(), address: 'ADDR' },
          { txid: '3', vout: 0, value: Satoshi.fromBitcoin(0.756).encode(), address: 'ADDR' },
        ])
        .toString(),
    ).toBe(Satoshi.fromBitcoin(0.5 + 0.61 + 0.756).toString());
  });

  it('rebalance when have enough', () => {
    const create = new CreateBitcoinTx(
      basicEntry,
      [{ address: 'addrchange', hdPath: "m/84'", role: 'change' }],
      [
        { txid: '1', vout: 0, value: Satoshi.fromBitcoin(0.5).encode(), address: 'ADDR' },
        { txid: '2', vout: 0, value: Satoshi.fromBitcoin(0.61).encode(), address: 'ADDR' },
        { txid: '3', vout: 0, value: Satoshi.fromBitcoin(0.756).encode(), address: 'ADDR' },
      ],
    );
    create.metric = defaultMetric;
    create.requiredAmount = Satoshi.fromBitcoin(0.97);
    create.address = 'AAA';
    create.feePrice = 100 * 1024;

    const ok = create.rebalance();
    expect(ok).toBeTruthy();

    expect(create.transaction.from.length).toBe(2);
    expect(create.transaction.from[0].txid).toBe('1');
    expect(create.transaction.from[1].txid).toBe('2');

    expect(create.totalToSpend.toString()).toBe(Satoshi.fromBitcoin(0.5 + 0.61).toString());

    // sending + change
    expect(create.outputs.length).toBe(2);

    expect(create.fees.number.toNumber())
      // 100 sat per wu
      // ((2 * 120) + (2 * 80)) * 100 / 4
      .toBe(10000);
    expect(create.fees.getNumberByUnit(SATOSHIS.top).toNumber()).toBe(
      defaultMetric.fees(2, create.outputs.length, create),
    );

    expect(create.change.toString())
      // 40000 / 10^8 = 0.0004
      .toBe(Satoshi.fromBitcoin(0.5 + 0.61 - 0.97 - 0.0001).toString());

    expect(create.validate()).toBe(ValidationResult.OK);
  });

  it('rebalance when less that enough', () => {
    const create = new CreateBitcoinTx(
      basicEntry,
      [{ address: 'addrchange', hdPath: "m/84'", role: 'change' }],
      [
        { txid: '1', vout: 0, value: Satoshi.fromBitcoin(0.5).encode(), address: 'ADDR' },
        { txid: '2', vout: 0, value: Satoshi.fromBitcoin(0.61).encode(), address: 'ADDR' },
        { txid: '3', vout: 0, value: Satoshi.fromBitcoin(0.756).encode(), address: 'ADDR' },
      ],
    );
    create.requiredAmount = Satoshi.fromBitcoin(2);
    create.address = 'AAA';
    const ok = create.rebalance();
    expect(ok).toBeFalsy();
    expect(create.transaction.from.length).toBe(3);
    expect(create.transaction.from[0].txid).toBe('1');
    expect(create.transaction.from[1].txid).toBe('2');
    expect(create.transaction.from[2].txid).toBe('3');
    expect(create.totalToSpend.toString()).toBe(Satoshi.fromBitcoin(0.5 + 0.61 + 0.756).toString());
    expect(create.change.toString()).toBe(Satoshi.ZERO.toString());
    expect(create.validate()).toBe(ValidationResult.INSUFFICIENT_FUNDS);
  });

  it('rebalance when no change', () => {
    const create = new CreateBitcoinTx(
      basicEntry,
      [{ address: 'addrchange', hdPath: "m/84'", role: 'change' }],
      [
        { txid: '1', vout: 0, value: Satoshi.fromBitcoin(0.005).encode(), address: 'ADDR' },
        { txid: '2', vout: 0, value: Satoshi.fromBitcoin(0.005).encode(), address: 'ADDR' },
        { txid: '3', vout: 0, value: Satoshi.fromBitcoin(0.005).encode(), address: 'ADDR' },
        { txid: '4', vout: 0, value: Satoshi.fromBitcoin(0.005).encode(), address: 'ADDR' },
      ],
    );
    create.metric = defaultMetric;
    create.requiredAmount = Satoshi.fromBitcoin(0.02 - 0.00008);
    create.feePrice = 65 * 1024;
    create.address = 'AAA';

    const ok = create.rebalance();

    expect(ok).toBeTruthy();
    expect(create.transaction.from.length).toBe(4);
    expect(create.totalToSpend.toString()).toBe(Satoshi.fromBitcoin(0.02).toString());
    expect(create.change.toString()).toBe(Satoshi.ZERO.toString());

    expect(create.outputs.length).toBe(1);
    expect(create.outputs[0].address).toBe('AAA');
    expect(create.outputs[0].amount).toBe(1992000);

    expect(create.fees.toString())
      // ((4 * 120) + (1 * 80)) * 65 / 4 == 9100 (or 0.000091)
      // but it doesn't have enough change, only 0.00008
      .toBe(Satoshi.fromBitcoin(0.00008).toString());

    expect(create.validate()).toBe(ValidationResult.OK);
  });

  it('rebalance with send all target', () => {
    const create = new CreateBitcoinTx(
      basicEntry,
      [{ address: 'addrchange', hdPath: "m/84'", role: 'change' }],
      [
        { txid: '1', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'ADDR' },
        { txid: '2', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'ADDR' },
      ],
    );
    create.metric = defaultMetric;
    create.address = 'AAA';
    create.feePrice = 100 * 1024;
    create.target = TxTarget.SEND_ALL;

    const ok = create.rebalance();

    expect(ok).toBeTruthy();
    expect(create.requiredAmount.number.toNumber()).toEqual(9992000);
  });

  it('simple fee', () => {
    const create = new CreateBitcoinTx(
      basicEntry,
      [{ address: 'addrchange', hdPath: "m/84'", role: 'change' }],
      [
        { txid: '1', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'ADDR' },
        { txid: '2', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'ADDR' },
      ],
    );
    create.metric = defaultMetric;
    create.requiredAmount = Satoshi.fromBitcoin(0.08);
    create.address = 'AAA';
    create.feePrice = 100 * 1024;

    expect(create.fees.toString())
      // ((2 * 120) + (2 * 80)) * 100 / 4== 10000
      .toBe(Satoshi.fromBitcoin(0.0001).toString());
  });

  it('fee when not enough', () => {
    const create = new CreateBitcoinTx(
      basicEntry,
      [{ address: 'addrchange', hdPath: "m/84'", role: 'change' }],
      [
        { txid: '1', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'ADDR' },
        { txid: '2', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'ADDR' },
      ],
    );
    create.metric = defaultMetric;
    create.requiredAmount = Satoshi.fromBitcoin(2);
    create.address = 'AAA';

    expect(create.fees.toString()).toBe(Satoshi.ZERO.toString());
  });

  it('update fee', () => {
    const create = new CreateBitcoinTx(
      basicEntry,
      [{ address: 'addrchange', hdPath: "m/84'", role: 'change' }],
      [
        { txid: '1', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'ADDR' },
        { txid: '2', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'ADDR' },
      ],
    );
    create.metric = defaultMetric;
    create.requiredAmount = Satoshi.fromBitcoin(0.08);
    create.address = 'AAA';
    create.feePrice = 100 * 1024;

    expect(create.fees.toString())
      // ((2 * 120) + (2 * 80)) * 100 / 4
      .toBe(Satoshi.fromBitcoin(0.0001).toString());

    create.feePrice = 150 * 1024;

    expect(create.fees.toString())
      // ((2 * 120) + (2 * 80)) * 150 / 4
      .toBe(Satoshi.fromBitcoin(0.00015).toString());
  });

  it('estimate fees', () => {
    const create = new CreateBitcoinTx(
      basicEntry,
      [{ address: 'addrchange', hdPath: "m/84'", role: 'change' }],
      [
        { txid: '1', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'ADDR' },
        { txid: '2', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'ADDR' },
      ],
    );
    create.metric = defaultMetric;
    create.requiredAmount = Satoshi.fromBitcoin(0.08);
    create.address = 'AAA';

    // ((2 * 120) + (2 * 80)) * 100 * 1024 == 40000
    expect(create.estimateFees(100 * 1024).toString()).toBe(Satoshi.fromBitcoin(0.0004).toString());
    expect(create.estimateFees(150 * 1024).toString()).toBe(Satoshi.fromBitcoin(0.0006).toString());
    expect(create.estimateFees(200 * 1024).toString()).toBe(Satoshi.fromBitcoin(0.0008).toString());
    expect(create.estimateFees(2000 * 1024).toString()).toBe(Satoshi.fromBitcoin(0.008).toString());
  });

  it('total available', () => {
    let create = new CreateBitcoinTx(
      basicEntry,
      [{ address: 'addrchange', hdPath: "m/84'", role: 'change' }],
      [{ txid: '2', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'ADDR' }],
    );

    expect(create.totalAvailable.toString()).toBe(Satoshi.fromBitcoin(0.05).toString());

    create = new CreateBitcoinTx(
      basicEntry,
      [{ address: 'addrchange', hdPath: "m/84'", role: 'change' }],
      [
        { txid: '1', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'ADDR' },
        { txid: '2', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'ADDR' },
      ],
    );

    expect(create.totalAvailable.toString()).toBe(Satoshi.fromBitcoin(0.1).toString());

    create = new CreateBitcoinTx(
      basicEntry,
      [{ address: 'addrchange', hdPath: "m/84'", role: 'change' }],
      [
        { txid: '1', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'ADDR' },
        { txid: '2', vout: 0, value: Satoshi.fromBitcoin(0.06).encode(), address: 'ADDR' },
        { txid: '3', vout: 0, value: Satoshi.fromBitcoin(0.07).encode(), address: 'ADDR' },
      ],
    );

    expect(create.totalAvailable.toString()).toBe(Satoshi.fromBitcoin(0.18).toString());
  });

  it('creates unsigned', () => {
    const create = new CreateBitcoinTx(
      basicEntry,
      [{ address: 'addrchange', hdPath: "m/84'", role: 'change' }],
      [{ txid: '1', vout: 0, value: new Satoshi(112233).encode(), address: 'ADDR' }],
    );
    create.metric = defaultMetric;
    create.requiredAmount = new Satoshi(80000);
    create.address = '2to';
    create.feePrice = 100 * 1024;

    const unsigned = create.create();

    expect(unsigned.inputs.length).toBe(1);
    expect(unsigned.inputs[0]).toEqual({
      address: 'ADDR',
      amount: 112233,
      txid: '1',
      vout: 0,
      entryId: 'f76416d7-3510-4d80-85df-52e7222e56df-1',
    });

    //  ((1 * 120) + (2 * 80)) * 100 / 4
    expect(unsigned.fee).toBe(7000);

    expect(unsigned.outputs.length).toBe(2);
    expect(unsigned.outputs[0]).toEqual({
      address: '2to',
      amount: 80000,
    });
    expect(unsigned.outputs[1]).toEqual({
      address: 'addrchange',
      amount: 112233 - 80000 - 7000,
      entryId: 'f76416d7-3510-4d80-85df-52e7222e56df-1',
    });
  });
});
