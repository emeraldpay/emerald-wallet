import {IService} from "./Services";
import {AddressListener} from "../AddressListener";

export class BalanceListener implements IService {
  id: string;
  private apiAccess: any;
  private webContents: any;
  private ipcMain: any;
  private readonly chain: string;
  private subscriber: AddressListener | null = null;

  constructor(chain: string, ipcMain: any, webContents: any, apiAccess: any) {
    if (chain === 'mainnet') {
      chain = 'etc';
    }
    this.ipcMain = ipcMain;
    this.webContents = webContents;
    this.apiAccess = apiAccess;
    this.chain = chain;
    this.id = `BalanceIpcListener-${chain}`;
  }

  stop() {
    if (this.subscriber) {
      this.subscriber.stop();
    }
  }

  start() {
    this.stop();
    const subscriber = this.apiAccess.newAddressListener(this.chain);
    this.subscriber = subscriber;
    const {webContents} = this;
    this.ipcMain.on('subscribe-balance', (_: any, addresses: any) => {
      subscriber.stop();
      subscriber.subscribe(addresses, (event: any) => {
        const action = {
          type: 'ACCOUNT/SET_BALANCE',
          payload: {
            chain: this.chain,
            accountId: event.address,
            value: event.balance,
          },
        };
        webContents.send('store', action);
      });
    });
  }
}
