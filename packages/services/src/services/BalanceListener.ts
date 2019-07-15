import {IService} from "./Services";
import {AddressListener} from "../AddressListener";

export class BalanceListener implements IService {
  id: string;
  private apiAccess: any;
  private webContents: any;
  private ipcMain: any;
  private subscribers: AddressListener[];

  constructor(ipcMain: any, webContents: any, apiAccess: any) {
    this.ipcMain = ipcMain;
    this.webContents = webContents;
    this.apiAccess = apiAccess;
    this.id = `BalanceIpcListener`;
    this.subscribers = []
  }

  stop() {
    this.subscribers.forEach((s) => s.stop())
  }

  start() {
    const {webContents} = this;
    this.ipcMain.on('subscribe-balance', (_: any, blockchain: string, addresses: any) => {
      if (blockchain === 'mainnet') {
        blockchain = 'etc';
      }
      const subscriber = this.apiAccess.newAddressListener();
      this.subscribers.push(subscriber);
      subscriber.subscribe(blockchain, addresses, (event: any) => {
        const action = {
          type: 'ACCOUNT/SET_BALANCE',
          payload: {
            blockchain: blockchain,
            accountId: event.address,
            value: event.balance,
          },
        };
        webContents.send('store', action);
      });
    });
  }
}
