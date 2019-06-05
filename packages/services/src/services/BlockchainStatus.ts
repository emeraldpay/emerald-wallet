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
      webContents.send('store', 'BLOCKCHAINS/BLOCK', {
        chain: this.chain,
        height: head.height,
        hash: head.hash
      });
    });
  }

  stop() {
    if (this.listener) {
      this.listener.stop();
    }
    this.listener = null;
  }
}
