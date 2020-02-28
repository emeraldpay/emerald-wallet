import { blockchains } from '@emeraldwallet/store';
import { ChainListener } from '../ChainListener';
import { IService } from './Services';

export class BlockchainStatus implements IService {
  public id: string;
  private apiAccess: any;
  private webContents: any;
  private readonly chain: string;
  private listener: ChainListener | null = null;

  constructor (chain: string, webContents: any, apiAccess: any) {
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
    const { webContents } = this;
    this.listener!.subscribe(this.chain,(head) => {
      const action = blockchains.actions.blockAction({
        blockchain: this.chain,
        height: head.height,
        hash: head.hash
      });
      webContents.send('store', action);
    });
  }

  public stop () {
    if (this.listener) {
      this.listener.stop();
    }
    this.listener = null;
  }
}
