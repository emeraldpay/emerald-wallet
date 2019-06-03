import { JsonRpcProvider, Vault} from '@emeraldplatform/vault';
import {
  DefaultJsonRpc, HttpTransport, RevalidatingJsonRpc, VerifyingJsonRpc, RotatingJsonRpc,
} from '@emeraldplatform/rpc';
import {
  EthRpc, VerifyMinPeers, VerifyNotSyncing, VerifyGenesis, VerifyBlockHash,
} from '@emeraldplatform/eth-rpc';
import HttpTransportAdapter from './HttpTransport';
import GrpcTransport from './GrpcTransport';
import {ChannelCredentials} from "grpc";

const os = require('os');

const CHAIN_VERIFY: {[key:string]: any} = {
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
};

class ServerConnect {
  chainUrls: any;
  headers: any;
  appVersion: any;
  locale: any;
  revalidate?: RevalidatingJsonRpc;
  log: any;
  credentials: ChannelCredentials;

  constructor(chainUrls: any, appVersion: string, locale: any, log: any, credentials: ChannelCredentials) {
    this.log = log;
    this.chainUrls = chainUrls;
    this.appVersion = appVersion;
    this.locale = locale;
    this.credentials = credentials;
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

  // DEPRECATED
  connectEth(url: string) {
    if (!url) {
      this.log.error('Empty JSON RPC URL is provided');
      return null;
    }
    const chain = Object.entries(this.chainUrls).find((entry: any) => entry[1].url === url);
    if (!chain) {
      this.log.error('Unsupported JSON RPC URL is provided');
      return null;
    }
    return this.connectEthChain(chain[0]);
  }

  connectEthChain(name: string) {
    const chain = this.chainUrls[name];
    if (!chain) {
      this.log.error('Unknown chain', name);
      return null;
    }
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
      new RotatingJsonRpc(localRevalidate, new DefaultJsonRpc(new GrpcTransport(name, '127.0.0.1:8090', this.credentials)))
      // new RotatingJsonRpc(localRevalidate, new DefaultJsonRpc(this.createHttpTransport(chain.url)))
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

  connectEmerald() {
    return new Vault(
      new JsonRpcProvider(new DefaultJsonRpc(this.createHttpTransport('http://127.0.0.1:1920')))
    );
  }

  getUserAgent() {
    return this.headers['User-Agent'];
  }
}

export default ServerConnect;
