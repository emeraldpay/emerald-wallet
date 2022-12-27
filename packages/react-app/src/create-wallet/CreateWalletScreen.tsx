import { AddEntry, SeedDefinition, SeedDescription, SeedReference } from '@emeraldpay/emerald-vault-core';
import { AddJsonEntry, AddRawPkEntry } from '@emeraldpay/emerald-vault-core/lib/types';
import { BlockchainCode, Blockchains, IBlockchain, blockchainCodeToId } from '@emeraldwallet/core';
import { IState, accounts, hdpathPreview, hwkey, screen, settings } from '@emeraldwallet/store';
import { HDPathIndexes } from '@emeraldwallet/store/lib/hdpath-preview/types';
import * as React from 'react';
import { Dispatch } from 'react';
import { connect } from 'react-redux';
import CreateWalletWizard from './CreateWalletWizard';
import { Result, isLedger, isPk, isPkJson, isPkRaw, isSeedCreate, isSeedSelected } from './flow/types';

type NewEntry = AddEntry & { additional: boolean };

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
  addresses: Partial<Record<BlockchainCode, string>>,
  indexes: HDPathIndexes,
): NewEntry[] {
  const entries = blockchains.map<NewEntry>((blockchain) => ({
    additional: false,
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
        additional: true,
        blockchain: blockchainCodeToId(blockchain === BlockchainCode.ETC ? BlockchainCode.ETH : BlockchainCode.ETC),
      });
    }
  });

  return entries.concat(additionalEntries);
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
        dispatch(hwkey.actions.setWatch(false));
        dispatch(hdpathPreview.actions.clean());
        dispatch(screen.actions.gotoWalletsScreen());
      },
      onCreate: (value: Result) => {
        return new Promise((resolve, reject) => {
          const { addresses, blockchains, indexes, seed, type, seedAccount: account } = value;

          const entries: NewEntry[] = [];

          if (isSeedSelected(type) || isSeedCreate(type)) {
            if (account != null && seed?.type === 'id' && seed?.password != null) {
              entriesForBlockchains(seed, account, blockchains, addresses ?? {}, indexes ?? {}).forEach((entry) =>
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
                additional: false,
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
                additional: false,
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
                additional: true,
              });
            }
          } else if (isLedger(type)) {
            if (account != null) {
              entriesForBlockchains({ type: 'ledger' }, account, blockchains, addresses ?? {}, indexes ?? {}).forEach(
                (entry) => entries.push(entry),
              );
            }
          }

          const { exactEntries, receiveDisabled } = entries.reduce<{
            exactEntries: AddEntry[];
            receiveDisabled: Array<{ blockchain: number; address?: string }>;
          }>(
            (carry, { additional, ...entry }) => {
              if (additional) {
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

          dispatch(hwkey.actions.setWatch(false));
          dispatch(hdpathPreview.actions.clean());
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
