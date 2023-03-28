import { tempPath } from './_commons';
import { PersistentStateManager } from '../api';

describe('Balance', () => {
  let manager: PersistentStateManager;

  beforeEach(() => {
    manager = new PersistentStateManager(tempPath('balance'));
  });

  afterEach(() => {
    manager.close();
  });

  test('default is nothing', async () => {
    const act = await manager.balances.list('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');

    expect(act.length).toBe(0);
  });

  test('set balance', async () => {
    const added = await manager.balances.set({
      amount: '123456',
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      blockchain: 1,
      asset: 'BTC',
    });

    expect(added).toBeTruthy();

    const act = await manager.balances.list('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');

    expect(act.length).toBe(1);
    expect(act[0].amount).toBe('123456');
    expect(act[0].address).toBe('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
    expect(act[0].asset).toBe('BTC');
    expect(act[0].blockchain).toBe(1);
    expect(act[0].timestamp).toBeDefined();
    expect(act[0].timestamp).toBeInstanceOf(Date);
  });

  test('get balance for a new xpub', async () => {
    await manager.balances.set({
      amount: '123456',
      address: 'bc1q5da29t3fuw4tkfupl8e5rxydne6j93a72vh7jc',
      blockchain: 1,
      asset: 'BTC',
    });
    await manager.balances.set({
      amount: '234567',
      address: 'bc1q7gxw38tmv03z09gjvvynenaarwn7ephwnd5v32',
      blockchain: 1,
      asset: 'BTC',
    });

    const act = await manager.balances.list(
      'zpub6sozJoQ5h3nRweiYhN8XxW5c61vMzTAy4tSJ6AiVbJ1X4CxEJPZx9EhexbY64oWfLyzuMoY62xnLJJZT7H3LQJji66vhrH2nuFT5TFp3vjN',
    );

    expect(act.length).toBe(2);
    expect(act[0].amount).toBe('123456');
    expect(act[0].address).toBe('bc1q5da29t3fuw4tkfupl8e5rxydne6j93a72vh7jc');
    expect(act[1].amount).toBe('234567');
    expect(act[1].address).toBe('bc1q7gxw38tmv03z09gjvvynenaarwn7ephwnd5v32');
  });

  test('get balance for known xpub', async () => {
    // caught coffee elevator husband thrive high joke own uncle about bubble shoot boss you child
    const xpub =
      'zpub6sozJoQ5h3nRweiYhN8XxW5c61vMzTAy4tSJ6AiVbJ1X4CxEJPZx9EhexbY64oWfLyzuMoY62xnLJJZT7H3LQJji66vhrH2nuFT5TFp3vjN';

    await manager.balances.set({
      amount: '123456',
      address: 'bc1qr7mc99thsx2tajf0kvrkfcghf65e8f5rmw0uyh', // m/84'/0'/0'/0/45
      blockchain: 1,
      asset: 'BTC',
    });

    await manager.balances.set({
      amount: '234567',
      address: 'bc1q2aezyyy3phj7t027gssxvfcf45ac7avk7xh2kh', // m/84'/0'/0'/0/29
      blockchain: 1,
      asset: 'BTC',
    });

    await manager.xpubpos.setCurrentAddressAt(xpub, 50);

    const act = await manager.balances.list(xpub);

    expect(act.length).toBe(2);

    // will go in order in xpub, so m/84'/0'/0'/0/29 comes first
    expect(act[0].amount).toBe('234567');
    expect(act[0].address).toBe('bc1q2aezyyy3phj7t027gssxvfcf45ac7avk7xh2kh');
    expect(act[1].amount).toBe('123456');
    expect(act[1].address).toBe('bc1qr7mc99thsx2tajf0kvrkfcghf65e8f5rmw0uyh');
  });

  test('test', async () => {
    const xpub =
      'vpub5aDcuUbsqhyzYas5UJAfmhGBhU9mvAExPw6iwUFQayfinNr2hU54cN5d4UZVhfVUCJuYMJvCaRFBnqHwTMbVptUjPAA3hCzsSWbjPY1tc1s';

    await manager.balances.set({
      amount: '123456',
      address: 'tb1q357jn0t6j9tvcyu46rv8c94huukrzxvy66y3sx',
      blockchain: 10003,
      asset: 'BTC',
    });

    await manager.xpubpos.setCurrentAddressAt(xpub, 15);

    const act = await manager.balances.list(xpub);

    expect(act.length).toBe(1);
  });

  test('set balance with utxo', async () => {
    const added = await manager.balances.set({
      amount: '1308516',
      address: 'bc1q27kljlp2vlktza4rtsjxa4440hkaf7nydrze7s',
      blockchain: 1,
      asset: 'BTC',
      utxo: [
        {txid: "27bbc1466c2d6e1cb95724a77a226a0c7f7219ab86eb103534e7fd6c13aa5f1e", vout: 0, amount: 460000},
        {txid: "2a21a7745f8dc1400b3e0fea2ff505c013f5611512bae61eadb0430c79a1f31c", vout: 1, amount: 348516},
        {txid: "4786c03b9a6aaa1c789b4c315369d58cbbf9129864b0b6442e25ff5841d279e1", vout: 0, amount: 500000}
      ]
    });

    expect(added).toBeTruthy();

    const act = await manager.balances.list('bc1q27kljlp2vlktza4rtsjxa4440hkaf7nydrze7s');

    expect(act.length).toBe(1);
    expect(act[0].amount).toBe('1308516');
    expect(act[0].address).toBe('bc1q27kljlp2vlktza4rtsjxa4440hkaf7nydrze7s');
    expect(act[0].asset).toBe('BTC');
    expect(act[0].blockchain).toBe(1);
    expect(act[0].timestamp).toBeDefined();
    expect(act[0].timestamp).toBeInstanceOf(Date);
    expect(act[0].utxo).toBeDefined();
    //@ts-ignore
    expect(act[0].utxo.length).toBe(3);
    expect(act[0].utxo).toEqual([
      {txid: "27bbc1466c2d6e1cb95724a77a226a0c7f7219ab86eb103534e7fd6c13aa5f1e", vout: 0, amount: 460000},
      {txid: "2a21a7745f8dc1400b3e0fea2ff505c013f5611512bae61eadb0430c79a1f31c", vout: 1, amount: 348516},
      {txid: "4786c03b9a6aaa1c789b4c315369d58cbbf9129864b0b6442e25ff5841d279e1", vout: 0, amount: 500000}
    ]);
  });
});
