import * as vault from '@emeraldpay/emerald-vault-core';
import {
  AddEntry,
  LedgerSeedReference,
  SeedDefinition,
  SeedEntry,
  SeedReference,
} from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, blockchainCodeToId, Blockchains, IBlockchain } from '@emeraldwallet/core';
import { accounts, hdpathPreview, hwkey, IState, screen, settings } from '@emeraldwallet/store';
import { HDPathIndexes } from '@emeraldwallet/store/lib/hdpath-preview/types';
import * as React from 'react';
import { Dispatch } from 'react';
import { connect } from 'react-redux';
import CreateWalletWizard from './CreateWalletWizard';
import { isLedger, isPk, isPkJson, isPkRaw, isSeedCreate, isSeedSelected, Result } from './flow/types';

type Props = {
  seeds: vault.SeedDescription[];
  blockchains: IBlockchain[];
}
type Actions = {
  onCreate: (value: Result) => Promise<string>;
  onError: (err: any) => void;
  onCancel: () => void;
  mnemonicGenerator?: () => Promise<string>;
  onSaveSeed: (seed: SeedDefinition) => Promise<string>;
}

/**
 * App Screen for the Create Wallet Wizard
 * @see CreateWalletWizard
 */
const Component: React.FC<Props & Actions> = (props) => {
  return <CreateWalletWizard {...props} />;
};

function entriesForBlockchains(
  seedRef: SeedReference,
  account: number,
  blockchains: BlockchainCode[],
  addresses: Partial<Record<BlockchainCode, string>>,
  indexes: HDPathIndexes,
): AddEntry[] {
  const entries: vault.AddEntry[] = [];
  blockchains.forEach((blockchain) => {
    const key: SeedEntry = {
      hdPath: Blockchains[blockchain].params.hdPath
        .forAccount(account)
        .forIndex(indexes?.[blockchain] ?? 0)
        .toString(),
      seed: seedRef,
      address: addresses[blockchain],
    };
    entries.push({
      type: 'hd-path',
      blockchain: blockchainCodeToId(blockchain),
      key,
    });
  });
  return entries;
}

export default connect(
  (state: IState): Props => {
    return {
      seeds: accounts.selectors.getSeeds(state),
      blockchains: settings.selectors.currentChains(state),
    };
  },
  (dispatch: Dispatch<any>): Actions => {
    return {
      onError: screen.actions.catchError(dispatch),
      onCreate: (value: Result) => {
        return new Promise((resolve, reject) => {
          const handler = (walletId?: string, err?: any): void => {
            if (err || typeof walletId == 'undefined') {
              reject(err);
            } else {
              dispatch(accounts.actions.fetchErc20BalancesAction());
              dispatch(accounts.actions.subscribeWalletBalance(walletId));
              resolve(walletId);
            }
          };
          const opts = {
            label: value.options.label,
          };
          const entries: vault.AddEntry[] = [];
          const type = value.type;
          if (isSeedSelected(type) || isSeedCreate(type)) {
            const seed = value.seed;
            if (typeof seed == 'object' && seed.type == 'id' && seed.password && typeof value.seedAccount == 'number') {
              const account: number = value.seedAccount;
              entriesForBlockchains(value.seed!, account, value.blockchains, value.addresses ?? {}, value.indexes ?? {})
                .forEach((e) => entries.push(e));
            } else {
              console.warn('Account number is not set');
            }
          } else if (isPk(type)) {
            if (isPkJson(type)) {
              entries.push({
                type: 'ethereum-json',
                key: type.json,
                blockchain: blockchainCodeToId(value.blockchains[0]),
                jsonPassword: type.jsonPassword,
                password: type.password,
              });
            } else if (isPkRaw(type)) {
              entries.push({
                type: 'raw-pk-hex',
                key: type.pk,
                password: type.password,
                blockchain: blockchainCodeToId(value.blockchains[0]),
              });
            }
          } else if (isLedger(type)) {
            if (typeof value.seedAccount == 'number') {
              const account: number = value.seedAccount;
              const seedRef: LedgerSeedReference = {
                type: "ledger"
              }
              entriesForBlockchains(seedRef, account, value.blockchains, value.addresses ?? {}, value.indexes ?? {})
                .forEach((e) => entries.push(e));
            } else {
              console.warn('Account number is not set');
            }
          }
          dispatch(accounts.actions.createWallet(opts, entries, handler));
          dispatch(hwkey.actions.setWatch(false));
          dispatch(hdpathPreview.actions.clean());
        });
      },
      mnemonicGenerator: () => {
        return new Promise((resolve) => dispatch(accounts.actions.generateMnemonic(resolve)));
      },
      onSaveSeed: (seed: SeedDefinition) => {
        return new Promise<string>((resolve) => {
          const id = dispatch(accounts.actions.createSeed(seed, resolve));
          dispatch(accounts.actions.loadSeedsAction());
          return id;
        });
      },
      onCancel: () => {
        dispatch(hwkey.actions.setWatch(false));
        dispatch(hdpathPreview.actions.clean());
        dispatch(screen.actions.gotoWalletsScreen());
      },
    };
  },
)(Component);
