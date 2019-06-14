import {blockchains} from '@emeraldwallet/store';
import {ChainListener} from "../ChainListener";
import {IService} from './Services';

export class BlockchainStatus implements IService {
  id: string;
  private apiAccess: any;
  private webContents: any;
  private readonly chain: string;
  private listener: ChainListener | null = null;

  constructor(chain: string, webContents: any, apiAccess: any) {
    if (chain === 'mainnet') {
      chain = 'etc';
    }
    this.chain = chain;
    this.webContents = webContents;
    this.id = `BlockchainStatus-${chain}`;
    this.apiAccess = apiAccess;
  }

  start() {
    this.stop();
    this.listener = this.apiAccess.newChainListener(this.chain);
    const {webContents} = this;
    this.listener!.subscribe((head) => {
      const action = blockchains.actions.blockAction({
        chain: this.chain,
        height: head.height,
        hash: head.hash
      });
      webContents.send('store', action);
    });
  }

  stop() {
    if (this.listener) {
      this.listener.stop();
    }
    this.listener = null;
  }
}
