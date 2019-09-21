import { AddressListener } from '../AddressListener';
import { IService } from './Services';

export class BalanceListener implements IService {
  public id: string;
  private apiAccess: any;
  private webContents: any;
  private ipcMain: any;
  private subscribers: AddressListener[];

  constructor (ipcMain: any, webContents: any, apiAccess: any) {
    this.ipcMain = ipcMain;
    this.webContents = webContents;
    this.apiAccess = apiAccess;
    this.id = `BalanceIpcListener`;
    this.subscribers = [];
  }

  public stop () {
    this.subscribers.forEach((s) => s.stop());
  }

  public start () {
    this.ipcMain.on('subscribe-balance', (_: any, blockchain: string, addresses: string[]) => {
      if (blockchain === 'mainnet') {
        blockchain = 'etc';
      }
      const subscriber = this.apiAccess.newAddressListener();
      this.subscribers.push(subscriber);
      subscriber.subscribe(blockchain, addresses, (event: any) => {
        const action = {
          type: 'ACCOUNT/SET_BALANCE',
          payload: {
            blockchain,
            accountId: event.address,
            value: event.balance
          }
        };
        this.webContents.send('store', action);
      });
    });
  }
}
