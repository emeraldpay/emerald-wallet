import {LocalConnector} from './LocalConnector';

describe('LocalConnector', () => {
  it('should be created with default logger', () => {
    const conn = new LocalConnector('/tmp/emerald-test');
    expect(conn).toBeDefined();
    expect(conn.getProvider()).toBeDefined();
  });

  it('should list wallets', () => {
    const ts = new Date().getTime() - 1576037200000;
    const conn = new LocalConnector(`/tmp/emerald-test-vault-list-${ts}`);
    const wallets = conn.getProvider().listWallets();
    expect(wallets.length).toEqual(0);
  });

  it('should create wallets', () => {
    const ts = new Date().getTime() - 1576037200000;
    const conn = new LocalConnector(`/tmp/emerald-test-vault-create-${ts}`);
    const wallets1 = conn.getProvider().listWallets();
    expect(wallets1.length).toEqual(0);
    conn.getProvider().addWallet("test 1");
    const wallets2 = conn.getProvider().listWallets();
    expect(wallets2.length).toEqual(1);
    expect(wallets2[0].name).toEqual("test 1");
  });
});
