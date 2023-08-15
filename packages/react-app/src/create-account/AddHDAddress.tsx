import {
  EntryId,
  SeedDescription,
  SeedReference,
  Uuid,
  WalletEntry,
  isEthereumEntry,
} from '@emeraldpay/emerald-vault-core';
import { AddSeedEntry, isSeedPkRef } from '@emeraldpay/emerald-vault-core/lib/types';
import {
  BlockchainCode,
  Blockchains,
  HDPath,
  IBlockchain,
  blockchainCodeToId,
  blockchainIdToCode,
} from '@emeraldwallet/core';
import { IState, accounts, screen } from '@emeraldwallet/store';
import { Address, Back, Button, ButtonGroup, FormLabel, FormRow, Page, PasswordInput, Table } from '@emeraldwallet/ui';
import {
  Grid,
  MenuItem,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  createStyles,
  makeStyles,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import * as React from 'react';
import { connect } from 'react-redux';
import WaitLedger from '../ledger/WaitLedger';

const useStyles = makeStyles(
  createStyles({
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      width: '100%',
    },
    tableCellAction: {
      display: 'flex',
      justifyContent: 'end',
      minWidth: 60,
    },
    tableCellHdPath: {
      minWidth: 140,
    },
  }),
);

enum Stage {
  UNLOCK = 'unlock',
  OPTIONS = 'options',
  LIST = 'list',
}

interface SeedAddress {
  address: string;
  existed: boolean;
  hdPath: string;
  seedId: string;
}

interface OwnProps {
  walletId: string;
}

interface StateProps {
  blockchains: IBlockchain[];
  entries: WalletEntry[];
  seed: SeedDescription | undefined;
}

interface DispatchProps {
  addEntryToWallet(walletId: Uuid, entry: AddSeedEntry): Promise<string>;
  disableReceiveForEntry(entryId: EntryId, disabled?: boolean): Promise<boolean>;
  goBack(): void;
  isGlobalKeySet(): Promise<boolean>;
  listAddresses(seed: SeedReference, blockchain: number, hdPaths: string[]): Promise<{ [hdPath: string]: string }>;
  loadWallets(): void;
  verifyGlobalKey(password: string): Promise<boolean>;
}

const AddHDAddress: React.FC<OwnProps & StateProps & DispatchProps> = ({
  blockchains,
  entries,
  seed,
  walletId,
  addEntryToWallet,
  disableReceiveForEntry,
  goBack,
  isGlobalKeySet,
  listAddresses,
  loadWallets,
  verifyGlobalKey,
}) => {
  const styles = useStyles();

  const listKey = React.useRef<string | undefined>();
  const mounted = React.useRef(true);

  const [stage, setStage] = React.useState(Stage.UNLOCK);

  const [initializing, setInitializing] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);

  const [password, setPassword] = React.useState<string>();
  const [passwordError, setPasswordError] = React.useState<string>();

  const [entry] = entries;

  const [selectedBlockchain, setSelectedBlockchain] = React.useState(entry?.blockchain);

  const [counter, setCounter] = React.useState(0);
  const [seedAddresses, setSeedAddresses] = React.useState<SeedAddress[]>([]);

  const onSeedUnlock = async (): Promise<void> => {
    if (password == null) {
      return;
    }

    setPasswordError(undefined);
    setVerifying(true);

    const hasGlobalKey = await isGlobalKeySet();

    if (hasGlobalKey) {
      const correctPassword = await verifyGlobalKey(password);

      if (correctPassword) {
        setStage(blockchains.length > 1 ? Stage.OPTIONS : Stage.LIST);
      } else {
        setPasswordError('Incorrect password');
      }

      setVerifying(false);
    } else {
      const entry = entries.find((item) => item.blockchain === selectedBlockchain);

      if (entry == null || !isSeedPkRef(entry, entry.key)) {
        return;
      }

      const { hdPath: entryHdPath, seedId } = entry.key;

      const addresses = await listAddresses(
        {
          password,
          type: 'id',
          value: seedId,
        },
        entry.blockchain,
        [entryHdPath],
      );

      if ((addresses[entryHdPath]?.length ?? 0) > 0) {
        setStage(blockchains.length > 1 ? Stage.OPTIONS : Stage.LIST);
      } else {
        setPasswordError('Incorrect password');
      }

      setVerifying(false);
    }
  };

  const onPasswordEnter = async (): Promise<void> => {
    if (!verifying && (password?.length ?? 0) > 0) {
      await onSeedUnlock();
    }
  };

  const onAddAddress = async ({ address, hdPath, seedId }: SeedAddress): Promise<void> => {
    const addEntry: AddSeedEntry = {
      blockchain: selectedBlockchain,
      type: 'hd-path',
      key: {
        address,
        hdPath,
        seed: {
          password,
          type: 'id',
          value: seedId,
        },
      },
    };

    await addEntryToWallet(walletId, addEntry);

    const addShadowEntry = {
      ...addEntry,
      blockchain: blockchainCodeToId(
        blockchainIdToCode(selectedBlockchain) === BlockchainCode.ETH ? BlockchainCode.ETC : BlockchainCode.ETH,
      ),
    };

    const shadowEntryId = await addEntryToWallet(walletId, addShadowEntry);

    await disableReceiveForEntry(shadowEntryId);

    loadWallets();
    goBack();
  };

  React.useEffect(() => {
    stage === Stage.LIST &&
      (async () => {
        const entry = entries
          .filter((entry) => !entry.receiveDisabled)
          .find((item) => item.blockchain === selectedBlockchain);

        if (entry == null || !isSeedPkRef(entry, entry.key)) {
          return;
        }

        const { hdPath: entryHdPath, seedId } = entry.key;

        const key = `${selectedBlockchain}:${seedId}:${counter}`;

        if (key === listKey.current) {
          return;
        }

        listKey.current = key;

        setInitializing(true);

        const baseHdPath = HDPath.parse(entryHdPath);

        const hdPaths = Array(10)
          .fill(counter * 10)
          .reduce<number[]>((carry, item, index) => [...carry, index === 0 ? item : carry[index - 1] + 1], [])
          .map((index) => baseHdPath.forIndex(index).toString());

        const addresses = await listAddresses(
          {
            password,
            type: 'id',
            value: seedId,
          },
          entry.blockchain,
          hdPaths,
        );

        if (mounted.current) {
          const existed = entries.reduce<number[]>((carry, item) => {
            if (item.blockchain !== selectedBlockchain || !isSeedPkRef(item, item.key)) {
              return carry;
            }

            const { hdPath: itemHdPath } = item.key;
            const { index } = HDPath.parse(itemHdPath);

            if (index == null) {
              return carry;
            }

            return [...carry, index];
          }, []);

          setSeedAddresses(
            Object.keys(addresses)
              .map<HDPath>((item) => HDPath.parse(item))
              .sort((first: HDPath, second: HDPath) => {
                if (first.index == null || second.index == null || first.index === second.index) {
                  return 0;
                }

                return first.index > second.index ? 1 : -1;
              })
              .map((item) => {
                const hdPath = item.toString();

                return {
                  hdPath,
                  seedId,
                  address: addresses[hdPath],
                  existed: item.index == null ? false : existed.includes(item.index),
                };
              }),
          );

          setInitializing(false);
        }
      })();
  }, [counter, entries, password, stage, listAddresses, selectedBlockchain]);

  React.useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <Page
      footer={
        stage === Stage.LIST ? (
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item />
            <Grid item>
              <ButtonGroup>
                <Button
                  primary
                  disabled={initializing || counter === 0}
                  label="Back"
                  variant="outlined"
                  onClick={() => setCounter(counter - 1)}
                />
                <Button
                  primary
                  disabled={initializing}
                  label="Next"
                  variant="outlined"
                  onClick={() => setCounter(counter + 1)}
                />
              </ButtonGroup>
            </Grid>
          </Grid>
        ) : undefined
      }
      title="Additional Addresses"
      leftIcon={<Back onClick={goBack} />}
    >
      {stage === Stage.UNLOCK && (
        <>
          {seed?.type === 'ledger' ? (
            <WaitLedger fullSize onConnected={() => setStage(blockchains.length > 1 ? Stage.OPTIONS : Stage.LIST)} />
          ) : (
            <>
              <FormRow>
                <FormLabel />
                <Typography>Enter password to unlock seed {seed?.label ?? seed?.id}</Typography>
              </FormRow>
              <FormRow>
                <FormLabel>Password</FormLabel>
                <PasswordInput
                  error={passwordError}
                  minLength={1}
                  placeholder="Enter existing password"
                  showLengthNotice={false}
                  onChange={setPassword}
                  onPressEnter={onPasswordEnter}
                />
              </FormRow>
            </>
          )}
          <FormRow last>
            <ButtonGroup classes={{ container: styles.buttons }}>
              <Button label="Cancel" onClick={goBack} />
              {seed?.type !== 'ledger' && (
                <Button
                  primary
                  disabled={verifying || (password?.length ?? 0) === 0}
                  label="Unlock"
                  onClick={onSeedUnlock}
                />
              )}
            </ButtonGroup>
          </FormRow>
        </>
      )}
      {stage === Stage.OPTIONS && (
        <>
          <FormRow>
            <FormLabel>Blockchain</FormLabel>
            <TextField
              fullWidth={true}
              select={true}
              value={selectedBlockchain}
              onChange={({ target: { value } }) => setSelectedBlockchain(parseInt(value, 10))}
            >
              {blockchains.map((blockchain) => (
                <MenuItem key={blockchain.params.code} value={blockchainCodeToId(blockchain.params.code)}>
                  {blockchain.getTitle()}
                </MenuItem>
              ))}
            </TextField>
          </FormRow>
          <FormRow last>
            <ButtonGroup classes={{ container: styles.buttons }}>
              <Button label="Cancel" onClick={goBack} />
              <Button primary label="Next" onClick={() => setStage(Stage.LIST)} />
            </ButtonGroup>
          </FormRow>
        </>
      )}
      {stage === Stage.LIST && (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={styles.tableCellHdPath}>HD Path</TableCell>
                <TableCell>Address</TableCell>
                <TableCell className={styles.tableCellAction}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {initializing || seedAddresses.length === 0
                ? Array.from({ length: 10 }).map((item, index) => (
                    <TableRow key={`skeleton-row-${index}`}>
                      <TableCell className={styles.tableCellHdPath}>
                        <Skeleton variant="text" width={120} height={12} />
                      </TableCell>
                      <TableCell>
                        <Skeleton variant="text" width={410} height={12} />
                      </TableCell>
                      <TableCell className={styles.tableCellAction}>
                        <Skeleton variant="rect" width={64} height={40} />
                      </TableCell>
                    </TableRow>
                  ))
                : seedAddresses.map((seedAddress) => {
                    const { address, existed, hdPath } = seedAddress;

                    return (
                      <TableRow key={hdPath}>
                        <TableCell className={styles.tableCellHdPath}>{hdPath}</TableCell>
                        <TableCell>
                          <Address address={address} />
                        </TableCell>
                        <TableCell className={styles.tableCellAction}>
                          <Button primary disabled={existed} label="Add" onClick={() => onAddAddress(seedAddress)} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
        </>
      )}
    </Page>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, ownProps): StateProps => {
    const wallet = accounts.selectors.findWallet(state, ownProps.walletId);

    const entries =
      wallet?.entries.filter(
        (entry) => isEthereumEntry(entry) && isSeedPkRef(entry, entry.key) && entry.key.type === 'hd-path',
      ) ?? [];

    const blockchains = entries
      .filter((entry) => !entry.receiveDisabled)
      .reduce<number[]>((carry, entry) => (carry.includes(entry.blockchain) ? carry : [...carry, entry.blockchain]), [])
      .map((blockchainId) => Blockchains[blockchainIdToCode(blockchainId)]);

    const [entry] = entries;

    const seed =
      entry == null || !isSeedPkRef(entry, entry.key) ? undefined : accounts.selectors.getSeed(state, entry.key.seedId);

    return { blockchains, entries, seed };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, ownProps) => ({
    addEntryToWallet(walletId, entry) {
      return dispatch(accounts.actions.addEntryToWallet(walletId, entry));
    },
    disableReceiveForEntry(entryId, disabled = true) {
      return dispatch(accounts.actions.disableReceiveForEntry(entryId, disabled));
    },
    goBack() {
      dispatch(screen.actions.gotoScreen(screen.Pages.WALLET, ownProps.walletId));
    },
    isGlobalKeySet() {
      return dispatch(accounts.actions.isGlobalKeySet());
    },
    listAddresses(seed, blockchain, hdPaths) {
      return dispatch(accounts.actions.listSeedAddresses(seed, blockchain, hdPaths));
    },
    loadWallets() {
      return dispatch(accounts.actions.loadWalletsAction());
    },
    verifyGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
  }),
)(AddHDAddress);
