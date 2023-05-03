import { SATOSHIS, Satoshi } from '@emeraldpay/bigamount-crypto';
import { BitcoinEntry } from '@emeraldpay/emerald-vault-core';
import { InputUtxo } from '../../blockchains';
import { CreateBitcoinTx, Output, TxMetric, convertWUToVB } from './CreateBitcoinTx';
import { TxTarget, ValidationResult } from './types';

const basicEntry: BitcoinEntry = {
  id: 'f76416d7-3510-4d80-85df-52e7222e56df-1',
  blockchain: 1,
  createdAt: new Date(),
  address: undefined,
  addresses: [],
  key: undefined,
  xpub: [],
};

const restoreEntry: BitcoinEntry = {
  id: '2a19e023-f119-4dab-b2cb-4b3e73fa32c9-1',
  blockchain: 1,
  createdAt: new Date(),
  address: undefined,
  addresses: [],
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

  weightOf(inputs: InputUtxo[], outputs: Output[]): number {
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

    // ((2 * 120) + (2 * 80)) * 100 * 1024 / 4 == 10000
    expect(create.estimateFees(100 * 1024).toString()).toBe(Satoshi.fromBitcoin(0.0001).toString());
    expect(create.estimateFees(150 * 1024).toString()).toBe(Satoshi.fromBitcoin(0.00015).toString());
    expect(create.estimateFees(200 * 1024).toString()).toBe(Satoshi.fromBitcoin(0.0002).toString());
    expect(create.estimateFees(2000 * 1024).toString()).toBe(Satoshi.fromBitcoin(0.002).toString());
  });

  it('estimate price', () => {
    const tx = new CreateBitcoinTx(
      basicEntry,
      [{ address: 'addrChange', hdPath: "m/84'", role: 'change' }],
      [
        { txid: '1', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'addrReceive' },
        { txid: '2', vout: 1, value: Satoshi.fromBitcoin(0.05).encode(), address: 'addrChange' },
      ],
    );

    tx.metric = defaultMetric;
    tx.address = 'addrTo';
    tx.requiredAmount = Satoshi.fromBitcoin(0.08);

    expect(tx.estimateVkbPrice(Satoshi.fromBitcoin(0.0001))).toEqual(100 * 1024);
    expect(tx.estimateVkbPrice(Satoshi.fromBitcoin(0.00015))).toEqual(150 * 1024);
    expect(tx.estimateVkbPrice(Satoshi.fromBitcoin(0.0002))).toEqual(200 * 1024);
    expect(tx.estimateVkbPrice(Satoshi.fromBitcoin(0.002))).toEqual(2000 * 1024);
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
      sequence: 4294967280,
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

  it('creates restored', () => {
    const tx = new CreateBitcoinTx(
      restoreEntry,
      [
        {
          address: 'tb1q8grga8c48wa4dsevt0v0gcl6378rfljj6vrz0u',
          hdPath: "m/84'/1'/0'/1/1",
          role: 'change',
        },
      ],
      [
        {
          address: 'tb1qjg445dvh6krr6gtmuh4eqgua372vxaf4q07nv9',
          txid: 'fd53023c4a9627c26c5d930f3149890b2eecf4261f409bd1a340454b7dede244',
          value: '1210185/SAT',
          vout: 0,
        },
      ],
    );

    tx.address = 'tb1q2h3wgjasuprzrmcljkpkcyeh69un3r0tzf9nnn';
    tx.requiredAmount = new Satoshi(1000);
    tx.feePrice = 1067;

    const unsigned = tx.create();

    expect(unsigned.fee).toEqual(208);
    expect(unsigned.inputs.length).toEqual(1);
    expect(unsigned.outputs.length).toEqual(2);
  });

  it('creates with zero fee', () => {
    const tx = new CreateBitcoinTx(
      basicEntry,
      [{ address: 'addrChange', hdPath: "m/84'", role: 'change' }],
      [{ txid: '1', vout: 0, value: new Satoshi(1000).encode(), address: 'addr1' }],
    );

    tx.address = 'addrTo';
    tx.requiredAmount = new Satoshi(1000);
    tx.feePrice = 0;

    const unsigned = tx.create();

    expect(unsigned.fee).toEqual(0);
    expect(unsigned.inputs.length).toEqual(1);
    expect(unsigned.outputs.length).toEqual(1);
  });

  it('creates with enough inputs for fee', () => {
    const tx = new CreateBitcoinTx(
      basicEntry,
      [{ address: 'addrChange', hdPath: "m/84'", role: 'change' }],
      [
        { txid: '1', vout: 0, value: new Satoshi(1000).encode(), address: 'addr1' },
        { txid: '2', vout: 1, value: new Satoshi(1000).encode(), address: 'addr2' },
      ],
    );

    tx.address = 'addrTo';
    tx.requiredAmount = new Satoshi(1000);
    tx.feePrice = 1024;

    const unsigned = tx.create();

    expect(unsigned.fee).toEqual(260);
    expect(unsigned.inputs.length).toEqual(2);
    expect(unsigned.outputs.length).toEqual(2);
  });

  it('creates with inputs amount equals required amount and zero fee', () => {
    const tx = new CreateBitcoinTx(
      basicEntry,
      [{ address: 'addrChange', hdPath: "m/84'", role: 'change' }],
      [
        { txid: '1', vout: 0, value: new Satoshi(1000).encode(), address: 'addr1' },
        { txid: '2', vout: 1, value: new Satoshi(1000).encode(), address: 'addr2' },
      ],
    );

    tx.address = 'addrTo';
    tx.requiredAmount = new Satoshi(2000);
    tx.feePrice = 1024;

    const unsigned = tx.create();

    expect(unsigned.fee).toEqual(0);
    expect(unsigned.inputs.length).toEqual(2);
    expect(unsigned.outputs.length).toEqual(1);
  });

  it('creates cancel transaction', () => {
    const tx = new CreateBitcoinTx(
      basicEntry,
      [{ address: 'addrChange', hdPath: "m/84'", role: 'change' }],
      [
        { txid: '1', vout: 0, value: new Satoshi(1000).encode(), address: 'addrReceive' },
        { txid: '2', vout: 1, value: new Satoshi(1000).encode(), address: 'addrChange' },
      ],
    );

    tx.address = 'addrTo';
    tx.requiredAmount = new Satoshi(1000);
    tx.feePrice = 1024;

    const original = tx.create();

    expect(original.inputs.length).toEqual(2);
    expect(original.outputs.length).toEqual(2);

    expect(original.outputs).toEqual(expect.arrayContaining([expect.objectContaining({ address: 'addrTo' })]));

    tx.address = 'addrChange';
    tx.feePrice = 1536;

    const cancel = tx.create();

    expect(cancel.fee).toBeGreaterThan(original.fee);
    expect(cancel.inputs.length).toEqual(2);
    /**
     * TODO Make single output
     *
     * @see task WALLET-251
     */
    expect(cancel.outputs.length).toEqual(2);

    const changeAddress = expect.objectContaining({ address: 'addrChange' });

    expect(cancel.outputs).toEqual(expect.arrayContaining([changeAddress, changeAddress]));
    expect(cancel.outputs).not.toEqual(expect.arrayContaining([expect.objectContaining({ address: 'addrTo' })]));
  });
});
