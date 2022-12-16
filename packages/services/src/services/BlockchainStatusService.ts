import { BlockchainCode, IpcCommands } from '@emeraldwallet/core';
import { WebContents } from 'electron';
import { IService } from './Services';
import { EmeraldApiAccess } from '..';
import { ChainListener } from '../ChainListener';

export class BlockchainStatusService implements IService {
  public id: string;
  private apiAccess: EmeraldApiAccess;
  private webContents?: WebContents;
  private readonly chain: BlockchainCode;
  private listener: ChainListener | null = null;

  constructor(chain: BlockchainCode, webContents: WebContents, apiAccess: EmeraldApiAccess) {
    this.chain = chain;
    this.webContents = webContents;
    this.id = `BlockchainStatus-${chain}`;
    this.apiAccess = apiAccess;
  }

  start(): void {
    this.stop();

    this.listener = this.apiAccess.newChainListener();
    this.listener.subscribe(this.chain, (head) =>
      this.webContents?.send(IpcCommands.STORE_DISPATCH, {
        type: 'BLOCKCHAINS/BLOCK',
        payload: {
          blockchain: this.chain,
          height: head.height,
          hash: head.hash,
        },
      }),
    );
  }

  stop(): void {
    this.listener?.stop();
    this.listener = null;
  }

  reconnect(): void {
    this.stop();
    this.start();
  }

  setWebContents(webContents: WebContents): void {
    this.webContents = webContents;
  }
}
