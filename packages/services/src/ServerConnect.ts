import { IServerConnect } from '@emeraldwallet/core';
import { JsonRpcProvider, Vault} from '@emeraldplatform/vault';
import {
  DefaultJsonRpc, HttpTransport, RevalidatingJsonRpc, VerifyingJsonRpc, RotatingJsonRpc,
} from '@emeraldplatform/rpc';
import {
  EthRpc, VerifyMinPeers, VerifyNotSyncing, VerifyGenesis, VerifyBlockHash,
} from '@emeraldplatform/eth-rpc';
import HttpTransportAdapter from './HttpTransport';
import GrpcTransport from './GrpcTransport';
import {BlockchainClient} from "@emeraldplatform/grpc";

const os = require('os');

const CHAIN_VERIFY: {[key:string]: any} = {
  etc: [
    new VerifyMinPeers(3),
    new VerifyNotSyncing(),
    new VerifyGenesis('0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3'),
    new VerifyBlockHash(1920000, '0x94365e3a8c0b35089c1d1195081fe7489b528a84b22199c916180db8b28ade7f'),
  ],
  // DEPRECATED
  mainnet: [
    new VerifyMinPeers(3),
    new VerifyNotSyncing(),
    new VerifyGenesis('0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3'),
    new VerifyBlockHash(1920000, '0x94365e3a8c0b35089c1d1195081fe7489b528a84b22199c916180db8b28ade7f'),
  ],
  eth: [
    new VerifyMinPeers(3),
    new VerifyNotSyncing(),
    new VerifyGenesis('0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3'),
    new VerifyBlockHash(1920000, '0x4985f5ca3d2afbec36529aa96f74de3cc10a2a4a6c44f2157a57d2c6059a11bb '),
  ],
  morden: [
    new VerifyMinPeers(1),
    new VerifyNotSyncing(),
    new VerifyGenesis('0x0cd786a2425d16f152c658316c423e6ce1181e15c3295826d7c9904cba9ce303'),
  ],
  kovan: [
    new VerifyMinPeers(1),
    new VerifyNotSyncing(),
    new VerifyGenesis('0xa3c565fc15c7478862d50ccd6561e3c06b24cc509bf388941c25ea985ce32cb9'),
  ],
};



class ServerConnect implements IServerConnect {
  headers: any;
  appVersion: any;
  locale: any;
  revalidate?: RevalidatingJsonRpc;
  log: any;
  blockchainClient: BlockchainClient;

  constructor(appVersion: string, locale: any, log: any, blockchainClient: BlockchainClient) {
    this.log = log;
    this.appVersion = appVersion;
    this.locale = locale;
    this.blockchainClient = blockchainClient;
    this.headers = {
      'User-Agent': `EmeraldWallet/${appVersion}`,
    };
  }

  init(versions: any) {
    const details = [os.platform(), os.release(), os.arch(), this.locale].join('; ');
    this.headers['User-Agent'] = `Electron/${versions.electron} (${details}) EmeraldWallet/${this.appVersion} (+https://emeraldwallet.io) Chrome/${versions.chrome} node-fetch/1.0`;
  }

  createHttpTransport(url: string) {
    return new HttpTransportAdapter(new HttpTransport(url, this.headers));
  }

  connectEthChain(name: string): null | EthRpc {
    const verifiers = CHAIN_VERIFY[name];
    if (typeof verifiers === 'undefined') {
      this.log.error('No verifiers for chain', name);
      return null;
    }
    const local = new VerifyingJsonRpc(new DefaultJsonRpc(new HttpTransport('http://127.0.0.1:8545')));
    verifiers.forEach((v: any) => local.verifyWith(v));
    const localRevalidate = new RevalidatingJsonRpc(15000, local);
    if (typeof this.revalidate !== 'undefined') {
      this.revalidate.stop();
    }
    this.revalidate = localRevalidate;
    localRevalidate.listener = (status) => {
      this.log.info(`Local Node Available: ${status}`);
    };
    localRevalidate.revalidate()
      .then(() => this.log.info('Verified local node'))
      .catch(() => this.log.info('Failed to verify local node'));
    localRevalidate.start();

    return new EthRpc(
      new RotatingJsonRpc(localRevalidate, new DefaultJsonRpc(new GrpcTransport(name, this.blockchainClient)))
    );
  }

  disconnect(): Promise<any> {
    return new Promise((resolve, reject) => {
        if (this.revalidate) {
          this.revalidate.stop();
        }
        resolve();
    })
  }

  connectEmerald(): Vault {
    return new Vault(
      new JsonRpcProvider(new DefaultJsonRpc(this.createHttpTransport('http://127.0.0.1:1920')))
    );
  }

  getUserAgent() {
    return this.headers['User-Agent'];
  }
}

export default ServerConnect;
