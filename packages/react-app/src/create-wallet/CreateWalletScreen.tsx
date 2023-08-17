import { AddEntry, SeedDefinition, SeedDescription, SeedReference } from '@emeraldpay/emerald-vault-core';
import { AddJsonEntry, AddRawPkEntry } from '@emeraldpay/emerald-vault-core/lib/types';
import { BlockchainCode, Blockchains, IBlockchain, blockchainCodeToId } from '@emeraldwallet/core';
import {
  HDPathAddresses,
  HDPathIndexes,
  IState,
  accounts,
  hdpathPreview,
  screen,
  settings,
} from '@emeraldwallet/store';
import * as React from 'react';
import { Dispatch } from 'react';
import { connect } from 'react-redux';
import CreateWalletWizard from './CreateWalletWizard';
import { Result, isLedger, isPk, isPkJson, isPkRaw, isSeedCreate, isSeedSelected } from './flow/types';

type NewEntry = AddEntry & { shadow: boolean };

type StateProps = {
  blockchains: IBlockchain[];
  seeds: SeedDescription[];
};

type DispatchProps = {
  mnemonicGenerator?(): Promise<string>;
  onCancel(): void;
  onCreate(value: Result): Promise<string>;
  onError(error: Error): void;
  onSaveSeed(seed: SeedDefinition): Promise<string>;
};

function entriesForBlockchains(
  seedRef: SeedReference,
  account: number,
  blockchains: BlockchainCode[],
  addresses: HDPathAddresses,
  indexes: HDPathIndexes,
): NewEntry[] {
  const entries = blockchains.map<NewEntry>((blockchain) => ({
    shadow: false,
    blockchain: blockchainCodeToId(blockchain),
    key: {
      address: addresses[blockchain],
      hdPath: Blockchains[blockchain].params.hdPath
        .forAccount(account)
        .forIndex(indexes?.[blockchain] ?? 0)
        .toString(),
      seed: seedRef,
    },
    type: 'hd-path',
  }));

  const additionalEntries: NewEntry[] = [];

  [BlockchainCode.ETC, BlockchainCode.ETH].forEach((blockchain) => {
    const blockchainId = blockchainCodeToId(blockchain);

    const entry = entries.find((item) => item.blockchain === blockchainId);

    if (entry != null) {
      additionalEntries.push({
        ...entry,
        shadow: true,
        blockchain: blockchainCodeToId(blockchain === BlockchainCode.ETC ? BlockchainCode.ETH : BlockchainCode.ETC),
      });
    }
  });

  return [...entries, ...additionalEntries];
}

/**
 * App Screen for the Create Wallet Wizard
 *
 * @see CreateWalletWizard
 */
const CreateWalletScreen: React.FC<DispatchProps & StateProps> = (props) => {
  return <CreateWalletWizard {...props} />;
};

export default connect(
  (state: IState): StateProps => {
    return {
      seeds: accounts.selectors.getSeeds(state),
      blockchains: settings.selectors.currentChains(state),
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: Dispatch<any>): DispatchProps => {
    return {
      mnemonicGenerator: () => {
        return new Promise((resolve) => dispatch(accounts.actions.generateMnemonic(resolve)));
      },
      onCancel: () => {
        dispatch(hdpathPreview.actions.cleanAccount());
        dispatch(screen.actions.gotoWalletsScreen());
      },
      onCreate: (value: Result) => {
        return new Promise((resolve, reject) => {
          const { blockchains, seed, type, seedAccount: account, addresses = {}, indexes = {} } = value;

          const entries: NewEntry[] = [];

          if (isSeedSelected(type) || isSeedCreate(type)) {
            if (account != null && seed?.type === 'id' && seed?.password != null) {
              entriesForBlockchains(seed, account, blockchains, addresses, indexes).forEach((entry) =>
                entries.push(entry),
              );
            }
          } else if (isPk(type)) {
            const [blockchainCode] = blockchains;

            let pkEntry: Omit<AddJsonEntry, 'blockchain'> | Omit<AddRawPkEntry, 'blockchain'> | undefined;

            if (isPkJson(type)) {
              const { json, jsonPassword, password } = type;

              pkEntry = {
                jsonPassword: jsonPassword,
                key: json,
                password: password,
                type: 'ethereum-json',
              };

              entries.push({
                ...pkEntry,
                shadow: false,
                blockchain: blockchainCodeToId(blockchainCode),
              });
            } else if (isPkRaw(type)) {
              const { password, pk } = type;

              pkEntry = {
                key: pk,
                password: password,
                type: 'raw-pk-hex',
              };

              entries.push({
                ...pkEntry,
                shadow: false,
                blockchain: blockchainCodeToId(blockchainCode),
              });
            }

            if (pkEntry != null && (blockchainCode === BlockchainCode.ETC || blockchainCode === BlockchainCode.ETH)) {
              const blockchain = blockchainCodeToId(
                blockchainCode === BlockchainCode.ETH ? BlockchainCode.ETC : BlockchainCode.ETH,
              );

              entries.push({
                ...pkEntry,
                blockchain,
                shadow: true,
              });
            }
          } else if (isLedger(type)) {
            if (Object.keys(addresses).length === 0) {
              reject(new Error("Can't create wallet without addresses"));

              return;
            }

            if (account != null) {
              entriesForBlockchains({ type: 'ledger' }, account, blockchains, addresses, indexes).forEach((entry) =>
                entries.push(entry),
              );
            }
          }

          const { exactEntries, receiveDisabled } = entries.reduce<{
            exactEntries: AddEntry[];
            receiveDisabled: Array<{ blockchain: number; address?: string }>;
          }>(
            (carry, { shadow, ...entry }) => {
              if (shadow) {
                return {
                  exactEntries: [...carry.exactEntries, entry],
                  receiveDisabled: [
                    ...carry.receiveDisabled,
                    {
                      blockchain: entry.blockchain,
                      address: entry.type === 'hd-path' ? entry.key.address : undefined,
                    },
                  ],
                };
              }

              return {
                exactEntries: [...carry.exactEntries, entry],
                receiveDisabled: carry.receiveDisabled,
              };
            },
            {
              exactEntries: [],
              receiveDisabled: [],
            },
          );

          dispatch(
            accounts.actions.createWallet({ label: value.options.label }, exactEntries, (wallet, error) => {
              if (error || wallet == null) {
                reject(error);
              } else {
                wallet.entries.forEach((entry) => {
                  const disabled =
                    receiveDisabled.find(({ address, blockchain }) => {
                      if (blockchain === entry.blockchain) {
                        const { value: entryAddress } = entry.address ?? {};

                        return address == null || entryAddress == null ? true : address === entryAddress;
                      }

                      return false;
                    }) != null;

                  if (disabled) {
                    dispatch(accounts.actions.disableReceiveForEntry(entry.id));
                  }
                });

                dispatch(accounts.actions.loadSeedsAction());
                dispatch(accounts.actions.loadWalletsAction());

                resolve(wallet.id);
              }
            }),
          );

          dispatch(hdpathPreview.actions.cleanAccount());
        });
      },
      onError: screen.actions.catchError(dispatch),
      onSaveSeed: (seed: SeedDefinition) => {
        return new Promise<string>((resolve) => {
          const id = dispatch(accounts.actions.createSeed(seed, resolve));

          dispatch(accounts.actions.loadSeedsAction());

          return id;
        });
      },
    };
  },
)(CreateWalletScreen);
