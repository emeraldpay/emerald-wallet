import { BlockchainCode, IpcCommands } from '@emeraldwallet/core';
import { WebContents } from 'electron';
import { EmeraldApiAccess } from '..';
import { ChainListener } from '../ChainListener';
import { IService } from './Services';

export class BlockchainStatusService implements IService {
  readonly id: string;

  private readonly apiAccess: EmeraldApiAccess;
  private readonly blockchain: BlockchainCode;

  private listener: ChainListener | null = null;

  private webContents?: WebContents;

  constructor(
    blockchain: BlockchainCode,
    apiAccess: EmeraldApiAccess,
    webContents: Electron.CrossProcessExports.WebContents,
  ) {
    this.id = `BlockchainStatus-${blockchain}`;

    this.apiAccess = apiAccess;
    this.blockchain = blockchain;
    this.webContents = webContents;
  }

  start(): void {
    this.stop();

    this.listener = this.apiAccess.newChainListener();
    this.listener.subscribe(this.blockchain, (head) =>
      this.webContents?.send(IpcCommands.STORE_DISPATCH, {
        type: 'BLOCKCHAINS/BLOCK',
        payload: {
          blockchain: this.blockchain,
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
