import { SeedDescription, SeedReference, Uuid, WalletEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import { AddSeedEntry, isSeedPkRef } from '@emeraldpay/emerald-vault-core/lib/types';
import { Blockchains, HDPath, IBlockchain, blockchainCodeToId, blockchainIdToCode } from '@emeraldwallet/core';
import { IState, accounts, screen } from '@emeraldwallet/store';
import { Back, ButtonGroup, Page, PasswordInput, Table } from '@emeraldwallet/ui';
import {
  Button,
  Grid,
  MenuItem,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  createStyles,
  withStyles,
} from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import FormField from '../../form/FormField';
import FormLabel from '../../form/FormLabel';
import LedgerWait from '../../ledger/LedgerWait';

const styles = createStyles({
  blockchains: {
    flex: 1,
    marginRight: 20,
  },
  tableCellAction: {
    minWidth: 60,
    textAlign: 'right',
  },
  tableCellHdPath: {
    minWidth: 140,
  },
});

enum Stage {
  UNLOCK = 'unlock',
  LIST = 'list',
}

type SeedAddress = {
  address: string;
  existed: boolean;
  hdPath: string;
  seedId: string;
};

interface DispatchProps {
  addEntryToWallet(walletId: Uuid, entry: AddSeedEntry): Promise<string>;
  checkGlobalKey(password: string): Promise<boolean>;
  goBack(): void;
  isGlobalKeySet(): Promise<boolean>;
  listAddresses(seed: SeedReference, blockchain: number, hdPaths: string[]): Promise<{ [hdPath: string]: string }>;
}

interface OwnProps {
  walletId: string;
}

interface StateProps {
  blockchains: IBlockchain[];
  entries: WalletEntry[];
  seed: SeedDescription | undefined;
}

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

const AddHDAddress: React.FC<DispatchProps & OwnProps & StateProps & StylesProps> = ({
  blockchains,
  classes,
  entries,
  seed,
  walletId,
  addEntryToWallet,
  checkGlobalKey,
  goBack,
  isGlobalKeySet,
  listAddresses,
}) => {
  const [stage, setStage] = React.useState(Stage.UNLOCK);

  const [password, setPassword] = React.useState<string>();
  const [passwordError, setPasswordError] = React.useState<string>();

  const [entry] = entries;

  const [selectedBlockchain, setSelectedBlockchain] = React.useState(entry?.blockchain);

  const [counter, setCounter] = React.useState(0);
  const [seedAddresses, setSeedAddresses] = React.useState<SeedAddress[]>([]);

  const onSeedUnlock = React.useCallback(async () => {
    setPasswordError(undefined);

    const hasGlobalKey = await isGlobalKeySet();

    if (hasGlobalKey) {
      const correctPassword = await checkGlobalKey(password ?? '');

      if (correctPassword) {
        setStage(Stage.LIST);
      } else {
        setPasswordError('Incorrect password');
      }
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
        setStage(Stage.LIST);
      } else {
        setPasswordError('Incorrect password');
      }
    }
  }, [entries, password, checkGlobalKey, isGlobalKeySet, listAddresses, selectedBlockchain]);

  const onAddAddress = React.useCallback(
    ({ address, hdPath, seedId }: SeedAddress) => {
      addEntryToWallet(walletId, {
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
      }).then(goBack);
    },
    [password, selectedBlockchain, walletId, addEntryToWallet, goBack],
  );

  React.useEffect(() => {
    stage === Stage.LIST &&
      (async () => {
        const entry = entries.find((item) => item.blockchain === selectedBlockchain);

        if (entry == null || !isSeedPkRef(entry, entry.key)) {
          return;
        }

        const { hdPath: entryHdPath, seedId } = entry.key;
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
      })();
  }, [counter, entries, password, stage, listAddresses, selectedBlockchain]);

  return (
    <Page
      footer={
        stage === Stage.UNLOCK ? undefined : (
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item classes={{ root: classes.blockchains }}>
              <FormField style={{ paddingBottom: 0 }}>
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
              </FormField>
            </Grid>
            <Grid item>
              <ButtonGroup>
                <Button
                  color="primary"
                  disabled={counter === 0}
                  variant="outlined"
                  onClick={() => setCounter(counter - 1)}
                >
                  Back
                </Button>
                <Button color="primary" variant="outlined" onClick={() => setCounter(counter + 1)}>
                  Next
                </Button>
              </ButtonGroup>
            </Grid>
          </Grid>
        )
      }
      title="Additional Addresses"
      leftIcon={<Back onClick={goBack} />}
    >
      {stage === Stage.UNLOCK &&
        (seed?.type === 'ledger' ? (
          <LedgerWait fullSize onConnected={() => setStage(Stage.LIST)} />
        ) : (
          <>
            <Typography>Enter password to unlock seed {seed?.label ?? seed?.id}</Typography>
            <Grid container alignItems="center" spacing={1}>
              <Grid item xs={10}>
                <PasswordInput error={passwordError} minLength={1} onChange={setPassword} />
              </Grid>
              <Grid item xs={2}>
                <Button color="primary" variant="contained" onClick={onSeedUnlock}>
                  Unlock
                </Button>
              </Grid>
            </Grid>
          </>
        ))}
      {stage === Stage.LIST && (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell className={classes.tableCellHdPath}>HD Path</TableCell>
                <TableCell>Address</TableCell>
                <TableCell className={classes.tableCellAction}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {seedAddresses.map((seedAddress) => {
                const { address, existed, hdPath } = seedAddress;

                return (
                  <TableRow key={hdPath}>
                    <TableCell className={classes.tableCellHdPath}>{hdPath}</TableCell>
                    <TableCell>{address}</TableCell>
                    <TableCell className={classes.tableCellAction}>
                      <Button
                        color="primary"
                        disabled={existed}
                        variant="contained"
                        onClick={() => onAddAddress(seedAddress)}
                      >
                        Add
                      </Button>
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
    checkGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
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
  }),
)(withStyles(styles)(AddHDAddress));
