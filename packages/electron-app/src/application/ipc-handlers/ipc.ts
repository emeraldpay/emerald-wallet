import {
  AddressBookService, AnyCoinCode,
  BlockchainCode,
  blockchainCodeToId,
  Blockchains,
  Commands, isAnyTokenCode, isCoinTickerCode,
  Logger, vault,
  WalletService,
} from '@emeraldwallet/core';
import {loadTransactions2, storeTransactions2} from '@emeraldwallet/history-store';
import {ipcMain} from 'electron';
import * as os from 'os';
import Application from '../Application';
import {tokenContract} from '../erc20';
import {Uuid, Wallet, AddEntry} from "@emeraldpay/emerald-vault-core";
import {registry} from "@emeraldwallet/erc20";
import BigNumber from 'bignumber.js';

interface BalanceResult {
  asset: AnyCoinCode;
  balance: string;
}

const log = Logger.forCategory('IPC Handlers');

export function setIpcHandlers(app: Application) {

  ipcMain.handle(Commands.GET_VERSION, async (event, args) => {
    const osDetails = {
      platform: os.platform(),
      release: os.release(),
      arch: os.arch()
    };
    return {
      os: osDetails,
      version: app.versions?.version,
      gitVersion: app.versions?.gitVersion
    };
  });

  ipcMain.handle(Commands.GET_APP_SETTINGS, () => {
    return app.settings.toJS();
  });

  ipcMain.handle(Commands.SET_TERMS, (event: any, v: string) => {
    app.settings.setTerms(v);
  });

  // Address Book API
  ipcMain.handle(Commands.GET_ADDR_BOOK_ITEMS, (event: any, blockchain: BlockchainCode) => {
    const service = new AddressBookService(app.vault!);
    const result = service.getItems(blockchain);
    return Promise.resolve(result);
  });

  ipcMain.handle(Commands.ADD_ADDR_BOOK_ITEM, (event: any, item: any) => {
    const service = new AddressBookService(app.vault!);
    const result = service.addNew(item);
    return Promise.resolve(result);
  });

  ipcMain.handle(Commands.DELETE_ADDR_BOOK_ITEM, (event: any, blockchain: BlockchainCode, address: any) => {
    const service = new AddressBookService(app.vault!);
    const result = service.remove(blockchain, address);
    return Promise.resolve(result);
  });

  // Transaction history API
  ipcMain.handle(Commands.PERSIST_TX_HISTORY, (event: any, blockchain: BlockchainCode, txs: any) => {
    storeTransactions2(blockchain, txs);
  });

  ipcMain.handle(Commands.LOAD_TX_HISTORY, (event: any, blockchain: BlockchainCode) => {
    return loadTransactions2(blockchain);
  });

  // ERC20
  // FIXME DEPRECATE
  ipcMain.handle(Commands.ERC20_GET_BALANCE,
    (event: any, blockchain: BlockchainCode, tokenId: string, address: string) => {
      // Call Erc20 contract to request balance for address
      const data = tokenContract.functionToData('balanceOf', {_owner: address});
      return app.rpc.chain(blockchain).eth.call({to: tokenId, data});
    });

  ipcMain.handle(Commands.GET_BALANCE,
    (event: any, blockchain: BlockchainCode, address: string, tokens: AnyCoinCode[]) => {
      //TODO use dshackle service
      const api = app.rpc.chain(blockchain).eth;
      const calls: Promise<BalanceResult>[] = []
      tokens.forEach((token) => {
        if (isCoinTickerCode(token)) {
          calls.push(
            api.getBalance(address)
              .then((b) => b.toString(10))
              .then((value) => {
                return {asset: token, balance: value}
              })
          );
        } else if (isAnyTokenCode(token)) {
          try {
            const contract = registry.bySymbol(blockchain, token);
            // Call Erc20 contract to request balance for address
            const data = tokenContract.functionToData('balanceOf', {_owner: address});
            calls.push(
              api.call({to: contract.address, data})
                .then((hex: string) => new BigNumber(hex.substring(2), 16).toString(10))
                .then((value) => {
                  return {asset: token, balance: value}
                })
            );
          } catch (e) {
            log.error("failed to get balance", token, e);
          }
        } else {
          log.warn("Unsupported asset", token);
        }
      });

      return Promise.all(calls).then((all: BalanceResult[]) => {
        const result: { [key: string]: string } = {};
        all.forEach((balance) => {
          result[balance.asset] = balance.balance;
        })
        return result;
      });
    });

  ipcMain.handle(Commands.GET_GAS_PRICE, async (event: any, blockchain: BlockchainCode) => {
    const gasPrice = await app.rpc.chain(blockchain).eth.gasPrice();
    return gasPrice.toNumber();
  });

  ipcMain.handle(Commands.BROADCAST_TX, async (event: any, blockchain: BlockchainCode, tx: any) => {
    return app.rpc.chain(blockchain).eth.sendRawTransaction(tx);
  });

  ipcMain.handle(Commands.ESTIMATE_TX, (event: any, blockchain: BlockchainCode, tx: any) => {
    return app.rpc.chain(blockchain).eth.estimateGas(tx);
  });

  ipcMain.handle(Commands.SIGN_TX, (event: any, accountId: string, unsignedTx: any, password: string) => {
    return app.vault!.signTx(accountId, unsignedTx, password);
  });

  ipcMain.handle(Commands.ACCOUNT_IMPORT_ETHEREUM_JSON,
    (event: any, blockchain: BlockchainCode, json: any) => {
      const addAccount: vault.AddEntry = {
        blockchain: blockchainCodeToId(blockchain),
        type: 'ethereum-json',
        key: JSON.stringify(json)
      };
      const walletName = Blockchains[blockchain].getTitle();
      const walletId = app.vault!.addWallet(walletName);
      const accountId = app.vault?.addEntry(walletId, addAccount);
      return walletId;
    });

  ipcMain.handle(Commands.ACCOUNT_IMPORT_PRIVATE_KEY,
    (event: any, blockchain: BlockchainCode, pk: string, password: string) => {
      const addAccount: vault.AddEntry = {
        blockchain: blockchainCodeToId(blockchain),
        type: 'raw-pk-hex',
        key: pk,
        password
      };
      const walletName = Blockchains[blockchain].getTitle();
      const walletId = app.vault!.addWallet(walletName);
      const accountId = app.vault?.addEntry(walletId, addAccount);
      return walletId;
    });

  ipcMain.handle(Commands.VAULT_CREATE_HD_ACCOUNT,
    (event: any, walletId: Uuid, blockchain: BlockchainCode, hdPath: string, password: string) => {
      const wallet = app.vault?.getWallet(walletId);
      if (!wallet) {
        throw Error("Unknown wallet");
      }
      if (typeof wallet.reserved == 'undefined' || wallet.reserved.length == 0) {
        throw Error("Wallet doesnt have associated seed");
      }
      const seedId = wallet.reserved[0].seedId;
      const addAccount: AddEntry = {
        blockchain: blockchainCodeToId(blockchain),
        type: 'hd-path',
        key: {
          seed: {type: "id", value: seedId, password},
          hdPath,
        },
      };
      return app.vault?.addEntry(walletId, addAccount);
    });

  ipcMain.handle(Commands.ACCOUNT_EXPORT_RAW_PRIVATE,
    (event: any, accountId: string, password: string) => {
      return app.vault?.exportRawPrivateKey(accountId, password);
    });

  ipcMain.handle(Commands.ACCOUNT_EXPORT_JSON_FILE, (event: any, accountId: string) => {
    return app.vault?.exportJsonPrivateKey(accountId, undefined);
  });
  // Wallets
  ipcMain.handle(Commands.VAULT_CREATE_WALLET, (event: any, name: string, password: string, mnemonic: string) => {
    const service = new WalletService(app.vault!);
    return service.createNewWallet(name, password, mnemonic);
  });

  ipcMain.handle(Commands.VAULT_GET_WALLET, (event: any, walletId: string) => {
    const service = new WalletService(app.vault!);
    return service.getWallet(walletId);
  });

  ipcMain.handle(Commands.VAULT_GET_WALLETS, (event: any) => {
    const service = new WalletService(app.vault!);
    return service.getAllWallets();
  });

  ipcMain.handle(Commands.VAULT_UPDATE_WALLET, (event: any, walletId: string, name: string) => {
    return app.vault?.setWalletLabel(walletId, name);
  });

  ipcMain.handle(Commands.VAULT_GET_SEEDS, (event: any) => {
    return app.vault?.listSeeds()
  });

  ipcMain.handle(Commands.VAULT_SEED_ADDRESSES, (event, seedId: Uuid, password: string, blockchain: BlockchainCode, hdpaths: string[]) => {
    try {
      return app.vault?.listSeedAddresses({type: "id", value: seedId, password}, "ethereum", hdpaths);
    } catch (e) {
      log.error("Unable to get seed addresses", e.message, hdpaths, password);
    }
    return {};
  });
}
