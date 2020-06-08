import { blockchains } from '@emeraldwallet/store';
import { ChainListener } from '../ChainListener';
import {IService} from './Services';
import {WebContents} from 'electron';

export class BlockchainStatus implements IService {
  public id: string;
  private apiAccess: any;
  private webContents?: WebContents;
  private readonly chain: string;
  private listener: ChainListener | null = null;

  constructor(chain: string, webContents: WebContents, apiAccess: any) {
    if (chain === 'mainnet') {
      chain = 'etc';
    }
    this.chain = chain;
    this.webContents = webContents;
    this.id = `BlockchainStatus-${chain}`;
    this.apiAccess = apiAccess;
  }

  public start () {
    this.stop();
    this.listener = this.apiAccess.newChainListener();
    this.listener!.subscribe(this.chain,(head) => {
      const action = blockchains.actions.blockAction({
        blockchain: this.chain,
        height: head.height,
        hash: head.hash
      });
      try {
        this.webContents?.send('store', action);
      } catch (e) {
        console.warn("Cannot send to the UI", e)
      }
    });
  }

  public stop() {
    if (this.listener) {
      this.listener.stop();
    }
    this.listener = null;
  }

  setWebContents(webContents: WebContents): void {
    this.webContents = webContents;
  }
}
