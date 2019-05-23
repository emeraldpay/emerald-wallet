import {ChainListener} from "../ChainListener";
import {IService} from './Services';

export class BlockchainStatus implements IService {
  id: string;
  private webContents: any;
  private readonly chain: string;
  private listener: ChainListener | null = null;

  constructor(chain: string, webContents: any) {
    if (chain === 'mainnet') {
      chain = 'etc';
    }
    this.chain = chain;
    this.webContents = webContents;
    this.id = `BlockchainStatus-${chain}`;
  }

  start() {
    this.stop();
    this.listener = new ChainListener(this.chain, 'localhost:8090');
    const {webContents} = this;
    this.listener.subscribe((head) => {
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
