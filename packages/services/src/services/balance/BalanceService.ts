import {AnyAsset, isAsset, Utxo} from '@emeraldpay/api';
import { EntryId } from '@emeraldpay/emerald-vault-core';
import {
  BlockchainCode,
  Blockchains,
  IpcCommands,
  Logger,
  SettingsManager,
  TokenRegistry,
  amountFactory,
  blockchainCodeToId, CoinTicker, InputUtxo,
} from '@emeraldwallet/core';
import { PersistentStateManager } from '@emeraldwallet/persistent-state';
import { IpcMain, WebContents } from 'electron';
import { EmeraldApiAccess } from '../..';
import { PriceService } from '../price/PriceService';
import { Service } from '../ServiceManager';
import {AddressEvent, BalanceListener} from './BalanceListener';
import {BigAmount, CreateAmount} from "@emeraldpay/bigamount";
import {BufferedHandler} from "../BuffereHandler";

interface Subscription {
  address: string;
  asset: string;
  blockchain: BlockchainCode;
  entryId: EntryId;
}

// same as in packages/store/src/accounts/types.ts
interface AccountBalance {
  address: string;
  entryId: EntryId;
  balance: string;
  utxo?: InputUtxo[];
}
// same as in packages/store/src/tokens/types.ts
interface TokenBalance {
  address: string;
  blockchain: BlockchainCode;
  balance: {
    decimals: number;
    symbol: string;
    unitsValue: string;
  };
  contractAddress: string;
}

function isEqual(first: Subscription, second: Subscription): boolean {
  return (
    first.address === second.address &&
    first.asset === second.asset &&
    first.blockchain === second.blockchain &&
    first.entryId === second.entryId
  );
}

const log = Logger.forCategory('BalanceService');

export class BalanceService implements Service {
  readonly id = 'BalanceService';

  private apiAccess: EmeraldApiAccess;
  private ipcMain: IpcMain;
  private persistentState: PersistentStateManager;
  private priceService: PriceService;
  private tokenRegistry: TokenRegistry;
  private webContents: WebContents;

  private subscribers: Map<string, BalanceListener> = new Map();
  private subscriptions: Subscription[] = [];

  private nativeBuffer: BufferedHandler<AccountBalance>;
  private erc20Buffer: BufferedHandler<TokenBalance>;

  constructor(
    ipcMain: IpcMain,
    apiAccess: EmeraldApiAccess,
    settings: SettingsManager,
    priceService: PriceService,
    persistentState: PersistentStateManager,
    webContents: WebContents,
  ) {
    this.apiAccess = apiAccess;
    this.ipcMain = ipcMain;
    this.persistentState = persistentState;
    this.priceService = priceService;
    this.tokenRegistry = new TokenRegistry(settings.getTokens());
    this.webContents = webContents;

    this.nativeBuffer = new BufferedHandler(this.submitManyAccountBalances());
    this.nativeBuffer.start();
    this.erc20Buffer = new BufferedHandler(this.submitManyTokenBalances());
    this.erc20Buffer.start();

    ipcMain.handle(IpcCommands.BALANCE_SET_TOKENS, (event, tokens) => {
      this.tokenRegistry = new TokenRegistry(tokens);

      this.stop();
      this.start();
    });
  }

  start(): void {
    this.ipcMain.handle(
      IpcCommands.BALANCE_SUBSCRIBE,
      (_event, entryId: EntryId, blockchain: BlockchainCode, address: string, asset: string) => {
        if (Array.isArray(address)) {
          address.forEach((item) => this.createSubscription(entryId, blockchain, item, asset));
        } else {
          this.createSubscription(entryId, blockchain, address, asset);
        }
      },
    );

    this.subscriptions.forEach((subscription) => this.subscribeBalance(subscription));
  }

  stop(): void {
    this.ipcMain.removeHandler(IpcCommands.BALANCE_SUBSCRIBE);

    this.subscribers.forEach((subscription) => subscription.stop());
    this.subscribers.clear();
  }

  reconnect(): void {
    this.stop();
    this.start();
  }

  setWebContents(webContents: WebContents): void {
    this.webContents = webContents;
  }

  createSubscription(entryId: EntryId, blockchain: BlockchainCode, address: string, asset: string): void {
    log.info(`Subscribing for ${address} asset ${asset} on ${blockchain} blockchain...`);

    const subscription: Subscription = { address, blockchain, entryId, asset };

    this.subscriptions = this.subscriptions.filter((item) => !isEqual(item, subscription));
    this.subscriptions.push(subscription);

    this.subscribeBalance(subscription);
  }

  private subscribeBalance({ address, asset, blockchain, entryId }: Subscription): void {
    const subscriber = this.apiAccess.newBalanceListener();

    const factory = amountFactory(blockchain);

    subscriber.subscribe(blockchain, address, asset, this.createHandler(blockchain, factory, entryId));

    const id = `${entryId}:${address}:${asset}`;

    this.subscribers.get(id)?.stop();
    this.subscribers.set(id, subscriber);
  }

  private createHandler(blockchain: BlockchainCode, factory: CreateAmount<BigAmount>, entryId: string): (event: AddressEvent) => void {
    return ({balance, utxo, address: eventAddress, asset: eventAsset}) => {
      const {
        params: {coinTicker},
      } = Blockchains[blockchain];

      this.persistentState.balances
        .set({
          address: eventAddress,
          amount: balance,
          asset: isAsset(eventAsset) ? coinTicker : eventAsset.contractAddress,
          blockchain: blockchainCodeToId(blockchain),
          utxo: utxo?.map(({txid, vout, value: amount}) => ({amount, txid, vout})),
        })
        .then(() => {
          this.sendAsset(entryId, eventAsset, blockchain, balance, utxo, eventAddress, factory, coinTicker);
        });
    };
  }

  private sendAsset(entryId: string, eventAsset: AnyAsset, blockchain: BlockchainCode, balance: string, utxo: Utxo[] | undefined, eventAddress: string,
                    factory: CreateAmount<BigAmount>, coinTicker: CoinTicker): void {
    if (isAsset(eventAsset)) {
      this.sendNativeAsset(entryId, eventAsset, blockchain, balance, utxo, eventAddress, factory, coinTicker);
    } else {
      this.sendERC20Asset(entryId, eventAsset, blockchain, balance, eventAddress);
    }
  }

  private sendNativeAsset(entryId: string, eventAsset: AnyAsset, blockchain: BlockchainCode, balance: string, utxo: Utxo[] | undefined, eventAddress: string, factory: CreateAmount<BigAmount>, coinTicker: CoinTicker): void {
    const amount = factory(balance);

    if (amount.isPositive()) {
      this.priceService.addFrom(coinTicker);
    }

    this.nativeBuffer.onData({
        entryId,
        address: eventAddress,
        balance: amount.encode(),
        utxo: utxo?.map((utxo) => ({
          address: eventAddress,
          txid: utxo.txid,
          value: factory(utxo.value).encode(),
          vout: utxo.vout,
        })),
      });
  }

  private sendERC20Asset(entryId: string, eventAsset: AnyAsset, blockchain: BlockchainCode, balance: string, eventAddress: string): void {
    // @ts-ignore
    const {contractAddress} = eventAsset;

    if (this.tokenRegistry.hasAddress(blockchain, contractAddress)) {
      const token = this.tokenRegistry.byAddress(blockchain, contractAddress);

      if (token.pinned || token.getAmount(balance).isPositive()) {
        this.priceService.addFrom(contractAddress, blockchain);
      }
      this.erc20Buffer.onData({
          blockchain,
          address: eventAddress,
          balance: {
            decimals: token.decimals,
            symbol: token.symbol,
            unitsValue: balance,
          },
          contractAddress: token.address,
      });
    }
  }

  private submitManyAccountBalances(): (values: AccountBalance[]) => Promise<void> {
    return async (values: AccountBalance[]) => {
      this.webContents.send(IpcCommands.STORE_DISPATCH, {
        type: 'ACCOUNT/SET_BALANCE',
        payload: values,
      });
    };
  }

  private submitManyTokenBalances(): (values: TokenBalance[]) => Promise<void> {
    return async (values: TokenBalance[]) => {
      this.webContents.send(IpcCommands.STORE_DISPATCH, {
        type: 'TOKENS/SET_TOKEN_BALANCE',
        payload: values,
      });
    };
  }
}
