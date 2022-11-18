import { BlockchainCode, Logger } from '@emeraldwallet/core';
import { WebContents } from 'electron';
import { IService } from './Services';
import { EmeraldApiAccess } from '..';
import { ChainListener } from '../ChainListener';

const log = Logger.forCategory('BlockchainStatusService');

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
    this.listener.subscribe(this.chain, (head) => {
      try {
        this.webContents?.send('store', {
          type: 'BLOCKCHAINS/BLOCK',
          payload: {
            blockchain: this.chain,
            height: head.height,
            hash: head.hash,
          },
        });
      } catch (exception) {
        log.warn('Cannot send to the UI', exception);
      }
    });
  }

  stop(): void {
    this.listener?.stop();
    this.listener = null;
  }

  setWebContents(webContents: WebContents): void {
    this.webContents = webContents;
  }

  reconnect(): void {
    this.stop();
    this.start();
  }
}
