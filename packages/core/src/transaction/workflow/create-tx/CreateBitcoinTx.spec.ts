import { SATOSHIS, Satoshi } from '@emeraldpay/bigamount-crypto';
import { BlockchainCode, InputUtxo, amountFactory } from '../../../blockchains';
import { TxTarget, ValidationResult } from '../types';
import { BitcoinTxMetric, BitcoinTxOutput, CreateBitcoinTx, convertWUToVB } from './CreateBitcoinTx';

const basicEntryId = 'f76416d7-3510-4d80-85df-52e7222e56df-1';
const restoreEntryId = '2a19e023-f119-4dab-b2cb-4b3e73fa32c9-1';

class TestMetric implements BitcoinTxMetric {
  readonly inputWeight: number;
  readonly outputWeight: number;

  constructor(inputWeight: number, outputWeight: number) {
    this.inputWeight = inputWeight;
    this.outputWeight = outputWeight;
  }

  weight(inputs: number, outputs: number): number {
    return inputs * this.inputWeight + outputs * this.outputWeight;
  }

  weightOf(inputs: InputUtxo[], outputs: BitcoinTxOutput[]): number {
    return this.weight(inputs.length, outputs.length);
  }

  fees(inputs: number, outputs: number, create: CreateBitcoinTx): number {
    return amountFactory(create.blockchain)(create.vkbPrice)
      .multiply(convertWUToVB(this.weight(inputs, outputs)))
      .number.dividedBy(SATOSHIS.top.multiplier)
      .dividedBy(1024)
      .toNumber();
  }
}

const defaultMetric = new TestMetric(120, 80);

describe('CreateBitcoinTx', () => {
  const defaultBitcoin = new CreateBitcoinTx(
    {
      blockchain: BlockchainCode.BTC,
      entryId: basicEntryId,
      changeAddress: 'addrchange',
    },
    [],
  );

  defaultBitcoin.metric = defaultMetric;
  defaultBitcoin.feePrice = 100;

  it('create', () => {
    const act = new CreateBitcoinTx(
      {
        blockchain: BlockchainCode.BTC,
        entryId: basicEntryId,
        changeAddress: 'addrchange',
      },
      [],
    );

    expect(act).toBeDefined();
    expect(act.totalToSpend).toBeDefined();
    expect(act.totalToSpend.isZero()).toBeTruthy();
    expect(act.validate()).not.toBe(ValidationResult.OK);
  });

  it('total zero for empty utxo', () => expect(defaultBitcoin.totalUtxo([]).toString()).toBe(Satoshi.ZERO.toString()));

  it('total for single utxo', () =>
    expect(
      defaultBitcoin
        .totalUtxo([
          {
            address: 'ADDR',
            txid: '',
            value: Satoshi.fromBitcoin(0.5).encode(),
            vout: 0,
          },
        ])
        .toString(),
    ).toBe(Satoshi.fromBitcoin(0.5).toString()));

  it('total for few utxo', () =>
    expect(
      defaultBitcoin
        .totalUtxo([
          { txid: '1', vout: 0, value: Satoshi.fromBitcoin(0.5).encode(), address: 'ADDR' },
          { txid: '2', vout: 0, value: Satoshi.fromBitcoin(0.61).encode(), address: 'ADDR' },
          { txid: '3', vout: 0, value: Satoshi.fromBitcoin(0.756).encode(), address: 'ADDR' },
        ])
        .toString(),
    ).toBe(Satoshi.fromBitcoin(0.5 + 0.61 + 0.756).toString()));

  it('rebalance when have enough', () => {
    const create = new CreateBitcoinTx(
      {
        blockchain: BlockchainCode.BTC,
        entryId: basicEntryId,
        changeAddress: 'addrchange',
      },
      [
        { txid: '1', vout: 0, value: Satoshi.fromBitcoin(0.5).encode(), address: 'ADDR' },
        { txid: '2', vout: 0, value: Satoshi.fromBitcoin(0.61).encode(), address: 'ADDR' },
        { txid: '3', vout: 0, value: Satoshi.fromBitcoin(0.756).encode(), address: 'ADDR' },
      ],
    );

    create.metric = defaultMetric;

    create.amount = Satoshi.fromBitcoin(0.97);
    create.feePrice = 100 * 1024;
    create.to = 'AAA';

    const rebalanced = create.rebalance();

    expect(rebalanced).toBeTruthy();

    expect(create.transaction.from.length).toBe(2);
    expect(create.transaction.from[0].txid).toBe('1');
    expect(create.transaction.from[1].txid).toBe('2');

    // sending + change
    expect(create.outputs.length).toBe(2);

    // 100 sat per wu, ((2 * 120) + (2 * 80)) * 100 / 4
    expect(create.fees.number.toNumber()).toBe(10000);

    expect(create.fees.getNumberByUnit(SATOSHIS.top).toNumber()).toBe(
      defaultMetric.fees(2, create.outputs.length, create),
    );

    // 40000 / 10^8 = 0.0004
    expect(create.change.toString()).toBe(Satoshi.fromBitcoin(0.5 + 0.61 - 0.97 - 0.0001).toString());
    expect(create.totalToSpend.toString()).toBe(Satoshi.fromBitcoin(0.5 + 0.61).toString());

    expect(create.validate()).toBe(ValidationResult.OK);
  });

  it('rebalance when less that enough', () => {
    const create = new CreateBitcoinTx(
      {
        blockchain: BlockchainCode.BTC,
        entryId: basicEntryId,
        changeAddress: 'addrchange',
      },
      [
        { txid: '1', vout: 0, value: Satoshi.fromBitcoin(0.5).encode(), address: 'addr1' },
        { txid: '2', vout: 0, value: Satoshi.fromBitcoin(0.61).encode(), address: 'addr2' },
        { txid: '3', vout: 0, value: Satoshi.fromBitcoin(0.756).encode(), address: 'addr3' },
      ],
    );

    create.amount = Satoshi.fromBitcoin(2);
    create.to = 'addrTo';

    const ok = create.rebalance();

    expect(ok).toBeFalsy();

    expect(create.transaction.from.length).toBe(3);
    expect(create.transaction.from[0].txid).toBe('1');
    expect(create.transaction.from[1].txid).toBe('2');
    expect(create.transaction.from[2].txid).toBe('3');

    expect(create.change.toString()).toBe(Satoshi.ZERO.toString());
    expect(create.totalToSpend.toString()).toBe(Satoshi.fromBitcoin(0.5 + 0.61 + 0.756).toString());

    expect(create.validate()).toBe(ValidationResult.INSUFFICIENT_FUNDS);
  });

  it('rebalance when no change', () => {
    const create = new CreateBitcoinTx(
      {
        blockchain: BlockchainCode.BTC,
        entryId: basicEntryId,
        changeAddress: 'addrchange',
      },
      [
        { txid: '1', vout: 0, value: Satoshi.fromBitcoin(0.005).encode(), address: 'addr1' },
        { txid: '2', vout: 0, value: Satoshi.fromBitcoin(0.005).encode(), address: 'addr2' },
        { txid: '3', vout: 0, value: Satoshi.fromBitcoin(0.005).encode(), address: 'addr3' },
        { txid: '4', vout: 0, value: Satoshi.fromBitcoin(0.005).encode(), address: 'addr4' },
      ],
    );

    create.metric = defaultMetric;

    create.amount = Satoshi.fromBitcoin(0.02 - 0.00008);
    create.feePrice = 65 * 1024;
    create.to = 'addrTo';

    const ok = create.rebalance();

    expect(ok).toBeTruthy();

    expect(create.transaction.from.length).toBe(4);
    expect(create.change.toString()).toBe(Satoshi.ZERO.toString());
    expect(create.totalToSpend.toString()).toBe(Satoshi.fromBitcoin(0.02).toString());

    expect(create.outputs.length).toBe(1);
    expect(create.outputs[0].address).toBe('addrTo');
    expect(create.outputs[0].amount).toBe(1992000);

    // ((4 * 120) + (1 * 80)) * 65 / 4 == 9100 (or 0.000091), but it doesn't have enough change, only 0.00008
    expect(create.fees.toString()).toBe(Satoshi.fromBitcoin(0.00008).toString());

    expect(create.validate()).toBe(ValidationResult.OK);
  });

  it('rebalance with send all target', () => {
    const create = new CreateBitcoinTx(
      {
        blockchain: BlockchainCode.BTC,
        entryId: basicEntryId,
        changeAddress: 'addrchange',
      },
      [
        { txid: '1', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'addr1' },
        { txid: '2', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'addr2' },
      ],
    );

    create.metric = defaultMetric;

    create.feePrice = 100 * 1024;
    create.to = 'addrTo';
    create.target = TxTarget.SEND_ALL;

    const ok = create.rebalance();

    expect(ok).toBeTruthy();

    expect(create.amount.number.toNumber()).toEqual(9992000);
  });

  it('simple fee', () => {
    const create = new CreateBitcoinTx(
      {
        blockchain: BlockchainCode.BTC,
        entryId: basicEntryId,
        changeAddress: 'addrchange',
      },
      [
        { txid: '1', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'addr1' },
        { txid: '2', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'addr2' },
      ],
    );

    create.metric = defaultMetric;

    create.amount = Satoshi.fromBitcoin(0.08);
    create.feePrice = 100 * 1024;
    create.to = 'addrTo';

    // ((2 * 120) + (2 * 80)) * 100 / 4== 10000
    expect(create.fees.toString()).toBe(Satoshi.fromBitcoin(0.0001).toString());
  });

  it('fee when not enough', () => {
    const create = new CreateBitcoinTx(
      {
        blockchain: BlockchainCode.BTC,
        entryId: basicEntryId,
        changeAddress: 'addrchange',
      },
      [
        { txid: '1', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'addr1' },
        { txid: '2', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'addr2' },
      ],
    );

    create.metric = defaultMetric;

    create.amount = Satoshi.fromBitcoin(2);
    create.to = 'addrTo';

    expect(create.fees.toString()).toBe(Satoshi.ZERO.toString());
  });

  it('update fee', () => {
    const create = new CreateBitcoinTx(
      {
        blockchain: BlockchainCode.BTC,
        entryId: basicEntryId,
        changeAddress: 'addrchange',
      },
      [
        { txid: '1', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'addr1' },
        { txid: '2', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'addr2' },
      ],
    );

    create.metric = defaultMetric;

    create.amount = Satoshi.fromBitcoin(0.08);
    create.feePrice = 100 * 1024;
    create.to = 'addrTo';

    // ((2 * 120) + (2 * 80)) * 100 / 4
    expect(create.fees.toString()).toBe(Satoshi.fromBitcoin(0.0001).toString());

    create.feePrice = 150 * 1024;

    // ((2 * 120) + (2 * 80)) * 150 / 4
    expect(create.fees.toString()).toBe(Satoshi.fromBitcoin(0.00015).toString());
  });

  it('estimate fees', () => {
    const create = new CreateBitcoinTx(
      {
        blockchain: BlockchainCode.BTC,
        entryId: basicEntryId,
        changeAddress: 'addrchange',
      },
      [
        { txid: '1', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'addr1' },
        { txid: '2', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'addr2' },
      ],
    );

    create.metric = defaultMetric;

    create.amount = Satoshi.fromBitcoin(0.08);
    create.to = 'addrTo';

    // ((2 * 120) + (2 * 80)) * 100 * 1024 / 4 = 10000
    create.vkbPrice = 100 * 1024;
    expect(create.getFees().toString()).toBe(Satoshi.fromBitcoin(0.0001).toString());

    create.vkbPrice = 150 * 1024;
    expect(create.getFees().toString()).toBe(Satoshi.fromBitcoin(0.00015).toString());

    create.vkbPrice = 200 * 1024;
    expect(create.getFees().toString()).toBe(Satoshi.fromBitcoin(0.0002).toString());

    create.vkbPrice = 2000 * 1024;
    expect(create.getFees().toString()).toBe(Satoshi.fromBitcoin(0.002).toString());
  });

  it('estimate price', () => {
    const tx = new CreateBitcoinTx(
      {
        blockchain: BlockchainCode.BTC,
        entryId: basicEntryId,
        changeAddress: 'addrchange',
      },
      [
        { txid: '1', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'addr1' },
        { txid: '2', vout: 1, value: Satoshi.fromBitcoin(0.05).encode(), address: 'addr2' },
      ],
    );

    tx.amount = Satoshi.fromBitcoin(0.08);
    tx.metric = defaultMetric;
    tx.to = 'addrTo';

    expect(tx.estimateVkbPrice(Satoshi.fromBitcoin(0.0001))).toEqual(100 * 1024);
    expect(tx.estimateVkbPrice(Satoshi.fromBitcoin(0.00015))).toEqual(150 * 1024);
    expect(tx.estimateVkbPrice(Satoshi.fromBitcoin(0.0002))).toEqual(200 * 1024);
    expect(tx.estimateVkbPrice(Satoshi.fromBitcoin(0.002))).toEqual(2000 * 1024);
  });

  it('total available', () => {
    let create = new CreateBitcoinTx(
      {
        blockchain: BlockchainCode.BTC,
        entryId: basicEntryId,
        changeAddress: 'addrchange',
      },
      [{ txid: '2', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'addr1' }],
    );

    expect(create.totalAvailable.toString()).toBe(Satoshi.fromBitcoin(0.05).toString());

    create = new CreateBitcoinTx(
      {
        blockchain: BlockchainCode.BTC,
        entryId: basicEntryId,
        changeAddress: 'addrchange',
      },
      [
        { txid: '1', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'addr1' },
        { txid: '2', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'addr2' },
      ],
    );

    expect(create.totalAvailable.toString()).toBe(Satoshi.fromBitcoin(0.1).toString());

    create = new CreateBitcoinTx(
      {
        blockchain: BlockchainCode.BTC,
        entryId: basicEntryId,
        changeAddress: 'addrchange',
      },
      [
        { txid: '1', vout: 0, value: Satoshi.fromBitcoin(0.05).encode(), address: 'addr1' },
        { txid: '2', vout: 0, value: Satoshi.fromBitcoin(0.06).encode(), address: 'addr2' },
        { txid: '3', vout: 0, value: Satoshi.fromBitcoin(0.07).encode(), address: 'addr3' },
      ],
    );

    expect(create.totalAvailable.toString()).toBe(Satoshi.fromBitcoin(0.18).toString());
  });

  it('creates unsigned', () => {
    const create = new CreateBitcoinTx(
      {
        blockchain: BlockchainCode.BTC,
        entryId: basicEntryId,
        changeAddress: 'addrChange',
      },
      [{ txid: '1', vout: 0, value: new Satoshi(112233).encode(), address: 'addr1' }],
    );

    create.metric = defaultMetric;

    create.amount = new Satoshi(80000);
    create.feePrice = 100 * 1024;
    create.to = 'addrTo';

    const unsigned = create.build();

    expect(unsigned.inputs.length).toBe(1);
    expect(unsigned.inputs[0]).toEqual({
      address: 'addr1',
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
      address: 'addrTo',
      amount: 80000,
    });
    expect(unsigned.outputs[1]).toEqual({
      address: 'addrChange',
      amount: 112233 - 80000 - 7000,
      entryId: 'f76416d7-3510-4d80-85df-52e7222e56df-1',
    });
  });

  it('creates restored', () => {
    const tx = new CreateBitcoinTx(
      {
        blockchain: BlockchainCode.BTC,
        entryId: restoreEntryId,
        changeAddress: 'tb1q8grga8c48wa4dsevt0v0gcl6378rfljj6vrz0u',
      },
      [
        {
          address: 'tb1qjg445dvh6krr6gtmuh4eqgua372vxaf4q07nv9',
          txid: 'fd53023c4a9627c26c5d930f3149890b2eecf4261f409bd1a340454b7dede244',
          value: '1210185/SAT',
          vout: 0,
        },
      ],
    );

    tx.amount = new Satoshi(1000);
    tx.feePrice = 1067;
    tx.to = 'tb1q2h3wgjasuprzrmcljkpkcyeh69un3r0tzf9nnn';

    const unsigned = tx.build();

    expect(unsigned.fee).toEqual(208);
    expect(unsigned.inputs.length).toEqual(1);
    expect(unsigned.outputs.length).toEqual(2);
  });

  it('creates with zero fee', () => {
    const tx = new CreateBitcoinTx(
      {
        blockchain: BlockchainCode.BTC,
        entryId: basicEntryId,
        changeAddress: 'addrchange',
      },
      [{ txid: '1', vout: 0, value: new Satoshi(1000).encode(), address: 'addr1' }],
    );

    tx.amount = new Satoshi(1000);
    tx.feePrice = 0;
    tx.to = 'addrTo';

    const unsigned = tx.build();

    expect(unsigned.fee).toEqual(0);
    expect(unsigned.inputs.length).toEqual(1);
    expect(unsigned.outputs.length).toEqual(1);
  });

  it('creates with enough inputs for fee', () => {
    const tx = new CreateBitcoinTx(
      {
        blockchain: BlockchainCode.BTC,
        entryId: basicEntryId,
        changeAddress: 'addrchange',
      },
      [
        { txid: '1', vout: 0, value: new Satoshi(1000).encode(), address: 'addr1' },
        { txid: '2', vout: 1, value: new Satoshi(1000).encode(), address: 'addr2' },
      ],
    );

    tx.amount = new Satoshi(1000);
    tx.feePrice = 1024;
    tx.to = 'addrTo';

    const unsigned = tx.build();

    expect(unsigned.fee).toEqual(260);
    expect(unsigned.inputs.length).toEqual(2);
    expect(unsigned.outputs.length).toEqual(2);
  });

  it('creates with inputs amount equals required amount and zero fee', () => {
    const tx = new CreateBitcoinTx(
      {
        blockchain: BlockchainCode.BTC,
        entryId: basicEntryId,
        changeAddress: 'addrchange',
      },
      [
        { txid: '1', vout: 0, value: new Satoshi(1000).encode(), address: 'addr1' },
        { txid: '2', vout: 1, value: new Satoshi(1000).encode(), address: 'addr2' },
      ],
    );

    tx.to = 'addrTo';
    tx.amount = new Satoshi(2000);
    tx.feePrice = 1024;

    const unsigned = tx.build();

    expect(unsigned.fee).toEqual(0);
    expect(unsigned.inputs.length).toEqual(2);
    expect(unsigned.outputs.length).toEqual(1);
  });

  it('creates cancel transaction', () => {
    const tx = new CreateBitcoinTx(
      {
        blockchain: BlockchainCode.BTC,
        entryId: basicEntryId,
        changeAddress: 'addrchange',
      },
      [
        { txid: '1', vout: 0, value: new Satoshi(1000).encode(), address: 'addr1' },
        { txid: '2', vout: 1, value: new Satoshi(1000).encode(), address: 'addr2' },
      ],
    );

    tx.amount = new Satoshi(1000);
    tx.feePrice = 1024;
    tx.to = 'addrTo';

    const original = tx.build();

    expect(original.inputs.length).toEqual(2);
    expect(original.outputs.length).toEqual(2);

    expect(original.outputs).toEqual(expect.arrayContaining([expect.objectContaining({ address: 'addrTo' })]));

    tx.to = 'addrChange';
    tx.feePrice = 1536;

    const cancel = tx.build();

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

  describe("With Source Order", () => {
    it('Use largest inputs first', () => {
      const tx = new CreateBitcoinTx(
        {
          blockchain: BlockchainCode.BTC,
          entryId: basicEntryId,
          changeAddress: 'addrchange',
        },
        [
          { txid: '1', vout: 0, value: new Satoshi(1000).encode(), address: 'addr1' },
          { txid: '2', vout: 1, value: new Satoshi(3000).encode(), address: 'addr2' },
          { txid: '3', vout: 1, value: new Satoshi(2000).encode(), address: 'addr2' },
        ],
      );

      tx.to = 'addrTo';
      tx.amount = new Satoshi(3500);
      tx.feePrice = 1024;
      tx.utxoOrder = 'largest';

      const unsigned = tx.build();

      expect(unsigned.inputs.length).toEqual(2);
      expect(unsigned.inputs[0].txid).toEqual('2');
      expect(unsigned.inputs[1].txid).toEqual('3');
    });

    it('Use smallest inputs first', () => {
      const tx = new CreateBitcoinTx(
        {
          blockchain: BlockchainCode.BTC,
          entryId: basicEntryId,
          changeAddress: 'addrchange',
        },
        [
          { txid: '1', vout: 0, value: new Satoshi(1000).encode(), address: 'addr1' },
          { txid: '2', vout: 1, value: new Satoshi(3000).encode(), address: 'addr2' },
          { txid: '3', vout: 1, value: new Satoshi(2000).encode(), address: 'addr2' },
        ],
      );

      tx.to = 'addrTo';
      tx.amount = new Satoshi(3500);
      tx.feePrice = 1024;
      tx.utxoOrder = 'smallest';

      const unsigned = tx.build();

      expect(unsigned.inputs[0].txid).toEqual('1');
      expect(unsigned.inputs[1].txid).toEqual('3');
      expect(unsigned.inputs[2].txid).toEqual('2');
      expect(unsigned.inputs.length).toEqual(3);
    });

    it('Use random inputs first', () => {
      const tx = new CreateBitcoinTx(
        {
          blockchain: BlockchainCode.BTC,
          entryId: basicEntryId,
          changeAddress: 'addrchange',
        },
        [
          { txid: '1', vout: 0, value: new Satoshi(1000).encode(), address: 'addr1' },
          { txid: '2', vout: 1, value: new Satoshi(2000).encode(), address: 'addr2' },
          { txid: '3', vout: 1, value: new Satoshi(3000).encode(), address: 'addr3' },
          { txid: '4', vout: 1, value: new Satoshi(4000).encode(), address: 'addr4' },
          { txid: '5', vout: 1, value: new Satoshi(5000).encode(), address: 'addr5' },
        ],
      );

      tx.to = 'addrTo';
      tx.amount = new Satoshi(3500);
      tx.feePrice = 1024;
      tx.utxoOrder = 'random';

      const all = [];

      for (let i = 0; i < 100; i++) {
        tx.rebalance()
        const unsigned = tx.build();
        all.push(unsigned.inputs.map((input) => input.txid).join(','));
      }

      const uniqSet = new Set(all);

      expect(uniqSet.size).toBeLessThan(all.length);

    });

    it('Saves UTXO Order to dump', () => {
      const origin = {
        blockchain: BlockchainCode.BTC,
        entryId: basicEntryId,
        changeAddress: 'addrchange',
      };
      const tx = new CreateBitcoinTx(
        origin,
        [
          { txid: '1', vout: 0, value: new Satoshi(1000).encode(), address: 'addr1' },
        ],
      );

      tx.to = 'addrTo';
      tx.amount = new Satoshi(3500);
      tx.feePrice = 1024;
      tx.utxoOrder = 'largest';

      let dump = tx.dump();
      expect(dump.utxoOrder).toBe('largest');

      let txRestored = CreateBitcoinTx.fromPlain(origin, dump);

      expect(txRestored.utxoOrder).toBe('largest');
    });

  });
});
