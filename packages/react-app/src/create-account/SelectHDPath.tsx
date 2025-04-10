import { SeedReference, isLedger } from '@emeraldpay/emerald-vault-core';
import {
  BlockchainCode,
  Blockchains,
  HDPath,
  amountFactory,
  formatAmountPartial,
  isEthereum,
} from '@emeraldwallet/core';
import { AccountState, HDPathIndexes, IState, accounts, hdpathPreview } from '@emeraldwallet/store';
import { Address, Table } from '@emeraldwallet/ui';
import {
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Skeleton
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { Clear as UnusedIcon, Beenhere as UsedIcon } from '@mui/icons-material';
import * as React from 'react';
import { connect } from 'react-redux';
import HDPathCounter from './HDPathCounter';

const useStyles = makeStyles()({
  activeCell: {
    width: 80,
  },
  addressSkeleton: {
    paddingLeft: 4,
    paddingTop: 4,
  },
  balanceSkeleton: {
    float: 'right',
  },
  inactiveCheck: {
    color: '#d0d0d0',
  },
  hdPathCell: {
    width: 180,
  },
  hdPathIndex: {
    fontSize: '1rem',
  },
});

interface OwnProps {
  blockchains: BlockchainCode[];
  seed: SeedReference;
  onChange(accountId: number | undefined, indexes: HDPathIndexes): void;
}

interface StateProps {
  disabledAccounts: number[];
  hdPathDisplay: AccountState[];
  indexes: HDPathIndexes;
  initialAccountId: number;
  isHardware: boolean;
}

interface DispatchProps {
  onInit(): void;
  onUpdate(accountId: number, indexes: HDPathIndexes): void;
}

const BASE_HD_PATH: HDPath = HDPath.parse("m/44'/0'/0'/0/0");

const SelectHDPath: React.FC<OwnProps & StateProps & DispatchProps> = ({
  disabledAccounts,
  hdPathDisplay,
  indexes,
  initialAccountId,
  isHardware,
  onChange,
  onInit,
  onUpdate,
}) => {
  const { classes } = useStyles();

  const [accountId, setAccountId] = React.useState(initialAccountId);

  const onAccountChange = ({ account }: HDPath): void => {
    setAccountId(account);

    onUpdate(account, indexes);
    onChange(account, indexes);
  };

  const onIndexChange = (item: AccountState) => {
    return (event: SelectChangeEvent) => {
      const newIndexes = {...indexes, [item.blockchain]: parseInt(event.target.value as string, 10)};

      onUpdate(accountId, newIndexes);
      onChange(accountId, newIndexes);
    };
  };

  const isActive = ({ balance, blockchain }: AccountState): boolean =>
    balance != null && amountFactory(blockchain)(balance).isPositive();

  const renderAddress = (value: string | undefined | null, blockchain: BlockchainCode): React.ReactElement => {
    if (value != null && value.length > 0) {
      return <Address address={value} disableCopy={true} />;
    }

    if (isHardware) {
      const appTitle = Blockchains[blockchain].getTitle();

      return (
        <Skeleton className={classes.addressSkeleton} height={20} width={380} variant="text">
          Open {appTitle} App on Ledger
        </Skeleton>
      );
    }

    return <Skeleton variant="text" width={380} height={12} />;
  };

  const renderBalance = ({ balance, blockchain }: AccountState): React.ReactElement => {
    if (balance === null) {
      return <Typography>&mdash;</Typography>;
    }

    if (balance === undefined || balance.length === 0) {
      return <Skeleton className={classes.balanceSkeleton} height={12} width={80} variant="text" />;
    }

    const [amount] = formatAmountPartial(amountFactory(blockchain)(balance));

    return <Typography>{amount}</Typography>;
  };

  React.useEffect(
    () => {
      onInit();

      onUpdate(accountId, indexes);
      onChange(accountId, indexes);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  let previousItem: AccountState | undefined;

  const isChanged = ({ address, blockchain, hdpath }: AccountState): boolean => {
    if (previousItem == null) {
      return true;
    }

    return address !== previousItem.address || blockchain !== previousItem.blockchain || hdpath !== previousItem.hdpath;
  };

  return (
    <Grid container>
      <Grid item xs={12}>
        <HDPathCounter
          base={BASE_HD_PATH.toString()}
          start={accountId}
          disabled={disabledAccounts}
          onChange={onAccountChange}
        />
      </Grid>
      <Grid item xs={12}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Blockchain</TableCell>
              <TableCell>HD Path</TableCell>
              <TableCell>Address</TableCell>
              <TableCell align="right">Balance</TableCell>
              <TableCell>Coin</TableCell>
              <TableCell>In use</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hdPathDisplay.map((item, index) => {
              const hdpath = HDPath.parse(item.hdpath);

              const element = (
                <TableRow key={item.blockchain + '-' + item.address + '-' + item.asset}>
                  <TableCell>{isChanged(item) ? Blockchains[item.blockchain].getTitle() : ''}</TableCell>
                  <TableCell className={classes.hdPathCell}>
                    {isChanged(item) ? (
                      isEthereum(item.blockchain) ? (
                        <>
                          {`m/${hdpath.purpose}'/${hdpath.coin}'/${hdpath.account}'/${hdpath.change}/`}
                          <Select className={classes.hdPathIndex} value={hdpath.index?.toString()} onChange={onIndexChange(item)}>
                            {Array(11)
                              .fill(null)
                              .map((value, hdPathIndex) => (
                                <MenuItem key={`hdpath[${index}][${hdPathIndex}]`} value={hdPathIndex}>
                                  {hdPathIndex}
                                </MenuItem>
                              ))}
                          </Select>
                        </>
                      ) : (
                        item.hdpath
                      )
                    ) : null}
                  </TableCell>
                  <TableCell>{isChanged(item) ? renderAddress(item.address, item.blockchain) : ''}</TableCell>
                  <TableCell align="right">{renderBalance(item)}</TableCell>
                  <TableCell>{item.asset}</TableCell>
                  <TableCell className={classes.activeCell}>
                    <Tooltip title={isActive(item) ? 'You had used this address before' : 'New inactive address'}>
                      {isActive(item) ? <UsedIcon /> : <UnusedIcon className={classes.inactiveCheck} />}
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );

              previousItem = item;

              return element;
            })}
          </TableBody>
        </Table>
      </Grid>
    </Grid>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { seed }) => {
    const isHardware = accounts.selectors.isHardwareSeed(state, seed);

    // If ledger seed, check if it's already used and get id
    if (isHardware && isLedger(seed)) {
      const ledgerSeed = accounts.selectors.findLedgerSeed(state);

      if (ledgerSeed?.id) {
        seed = {
          type: 'id',
          value: ledgerSeed.id,
        };
      }
    }

    const disabledAccounts = accounts.selectors
      .allWallets(state)
      .filter(({ reserved }) => reserved?.some(({ seedId }) => !isLedger(seed) && seedId === seed.value))
      .map(({ reserved }) => reserved?.map(({ accountId }) => accountId) ?? [])
      .reduce((result, accountId) => result.concat(accountId), []);

    let initialAccountId = 0;

    while (disabledAccounts.indexOf(initialAccountId) >= 0) {
      initialAccountId++;
    }

    const hdPathDisplay = hdpathPreview.selectors.getCurrentDisplay(state, seed);

    return {
      disabledAccounts,
      hdPathDisplay,
      initialAccountId,
      isHardware,
      indexes: hdPathDisplay.reduce<HDPathIndexes>(
        (carry, item) => ({ ...carry, [item.blockchain]: HDPath.parse(item.hdpath).index }),
        {},
      ),
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, { blockchains, seed }) => {
    return {
      onInit() {
        dispatch(hdpathPreview.actions.initAccount(blockchains, seed));
      },
      onUpdate(accountId, indexes) {
        dispatch(hdpathPreview.actions.displayAccount(accountId, indexes));
      },
    };
  },
)(SelectHDPath);
