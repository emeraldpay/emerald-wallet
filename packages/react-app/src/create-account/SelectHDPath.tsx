import { BigAmount } from '@emeraldpay/bigamount';
import { SeedReference, isLedger } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, Blockchains, HDPath, amountDecoder, formatAmount, isEthereum } from '@emeraldwallet/core';
import { IState, accounts, hdpathPreview, hwkey } from '@emeraldwallet/store';
import { HDPathIndexes, IAddressState } from '@emeraldwallet/store/lib/hdpath-preview/types';
import { Address } from '@emeraldwallet/ui';
import {
  Grid,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  createStyles,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import BeenhereIcon from '@material-ui/icons/Beenhere';
import ClearIcon from '@material-ui/icons/Clear';
import { Skeleton } from '@material-ui/lab';
import * as React from 'react';
import { ChangeEvent, Dispatch } from 'react';
import { connect } from 'react-redux';
import HDPathCounter from './HDPathCounter';

const useStyles = makeStyles(
  createStyles({
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
      width: 160,
    },
    hdPathIndex: {
      fontSize: '1rem',
    },
  }),
);

type Actions = {
  onAccountUpdate(
    account: number,
    ready: boolean,
    addresses: Partial<Record<BlockchainCode, string>>,
    indexes: HDPathIndexes,
  ): void;
  onReady(
    account: number,
    ready: boolean,
    addresses: Partial<Record<BlockchainCode, string>>,
    indexes: HDPathIndexes,
  ): void;
  onStart(): void;
};

type OwnProps = {
  blockchains: BlockchainCode[];
  seed: SeedReference;
  onChange(
    account: number | undefined,
    addresses: Partial<Record<BlockchainCode, string>>,
    indexes: HDPathIndexes,
  ): void;
};

type StateProps = {
  disabledAccounts: number[];
  initAccountId: number;
  isHWKey: boolean;
  isPreloaded: boolean;
  table: IAddressState[];
};

const BASE_HD_PATH: HDPath = HDPath.parse("m/44'/0'/0'/0/0");

const SelectHDPath: React.FC<Actions & OwnProps & StateProps> = ({
  disabledAccounts,
  initAccountId,
  isHWKey,
  isPreloaded,
  table,
  onAccountUpdate,
  onReady,
  onStart,
}) => {
  const styles = useStyles();

  const [accountId, setAccountId] = React.useState(initAccountId);
  const [initialized, setInitialized] = React.useState(false);
  const [indexes, setIndexes] = React.useState<HDPathIndexes>(
    table.reduce((carry, item) => ({ ...carry, [item.blockchain]: HDPath.parse(item.hdpath).index }), {}),
  );

  const addresses = React.useMemo(
    () =>
      table.reduce<Partial<Record<BlockchainCode, string>>>((carry, item) => {
        if (item.xpub == null && item.address == null) {
          return carry;
        }

        return {
          ...carry,
          [item.blockchain]: item.xpub ?? item.address,
        };
      }, {}),
    [table],
  );

  const isReady = React.useMemo(() => !isHWKey || isPreloaded, [isHWKey, isPreloaded]);

  const isActive = React.useCallback((item: IAddressState) => {
    const amountReader = amountDecoder(item.blockchain);

    return item.balance != null && amountReader(item.balance).isPositive();
  }, []);

  const renderAddress = React.useCallback(
    (value: string | undefined | null, blockchain: BlockchainCode) => {
      if (value != null && value.length > 0) {
        return <Address address={value} disableCopy={true} />;
      }

      if (isHWKey) {
        const appTitle = Blockchains[blockchain].getTitle();

        return (
          <Skeleton variant="text" width={380} height={20} className={styles.addressSkeleton}>
            Open {appTitle} App on Ledger
          </Skeleton>
        );
      }

      return <Skeleton variant="text" width={380} height={12} />;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isHWKey],
  );

  const renderBalance = React.useCallback(
    (item: IAddressState) => {
      if (item.balance == null || item.balance.length == 0) {
        return <Skeleton variant="text" width={80} height={12} className={styles.balanceSkeleton} />;
      }

      const amountReader = amountDecoder<BigAmount>(item.blockchain);
      const amount = amountReader(item.balance);

      return <Typography>{formatAmount(amount)}</Typography>;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onAccountChange = React.useCallback(
    (path: HDPath) => {
      setAccountId(path.account);

      onAccountUpdate(path.account, isReady, addresses, indexes);
    },
    [addresses, indexes, isReady, onAccountUpdate],
  );

  const onIndexChange = React.useCallback(
    (item: IAddressState) =>
      ({ target: { value } }: ChangeEvent<{ value: unknown }>) => {
        const newIndexes = { ...indexes };

        newIndexes[item.blockchain] = parseInt(value as string, 10);

        onAccountUpdate(accountId, isReady, addresses, newIndexes);
      },
    [accountId, addresses, indexes, isReady, onAccountUpdate],
  );

  React.useEffect(
    () => {
      if (!initialized) {
        onStart();

        onAccountUpdate(accountId, isReady, addresses, indexes);

        setInitialized(true);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onStart, onAccountUpdate],
  );

  React.useEffect(
    () => {
      onReady(accountId, isReady, addresses, indexes);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isHWKey, isPreloaded],
  );

  React.useEffect(() => {
    setIndexes(table.reduce((carry, item) => ({ ...carry, [item.blockchain]: HDPath.parse(item.hdpath).index }), {}));
  }, [table]);

  let previousItem: IAddressState | undefined;

  const isChanged = ({ address, blockchain, hdpath }: IAddressState): boolean => {
    if (previousItem == null) {
      return true;
    }

    return address !== previousItem.address || blockchain !== previousItem.blockchain || hdpath !== previousItem.hdpath;
  };

  return (
    <Grid container={true}>
      <Grid item={true} xs={12}>
        <HDPathCounter
          base={BASE_HD_PATH.toString()}
          start={accountId}
          disabled={disabledAccounts}
          onChange={onAccountChange}
        />
      </Grid>
      <Grid item={true} xs={12}>
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
            {table.map((item, index) => {
              const hdpath = HDPath.parse(item.hdpath);

              const element = (
                <TableRow key={item.blockchain + '-' + item.address + '-' + item.asset}>
                  <TableCell>{isChanged(item) ? Blockchains[item.blockchain].getTitle() : ''}</TableCell>
                  <TableCell className={styles.hdPathCell}>
                    {isChanged(item) ? (
                      isEthereum(item.blockchain) ? (
                        <>
                          {`m/${hdpath.purpose}'/${hdpath.coin}'/${hdpath.account}'/${hdpath.change}/`}
                          <Select className={styles.hdPathIndex} value={hdpath.index} onChange={onIndexChange(item)}>
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
                    ) : (
                      ''
                    )}
                  </TableCell>
                  <TableCell>{isChanged(item) ? renderAddress(item.address, item.blockchain) : ''}</TableCell>
                  <TableCell align="right">{renderBalance(item)}</TableCell>
                  <TableCell>{item.asset}</TableCell>
                  <TableCell>
                    <Tooltip title={isActive(item) ? 'You had used this address before' : 'New inactive address'}>
                      {isActive(item) ? <BeenhereIcon /> : <ClearIcon className={styles.inactiveCheck} />}
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

export default connect(
  (state: IState, ownProps: OwnProps): StateProps => {
    let { seed } = ownProps;

    const isHWSeed = accounts.selectors.isHardwareSeed(state, seed);

    // if ledger seed, check if it's already used and get id
    if (isHWSeed && isLedger(seed)) {
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

    let accountId = 0;

    while (disabledAccounts.indexOf(accountId) >= 0) {
      accountId++;
    }

    return {
      disabledAccounts,
      initAccountId: accountId,
      isHWKey: isHWSeed,
      isPreloaded: hdpathPreview.selectors.isPreloaded(state),
      table: hdpathPreview.selectors.getCurrentDisplay(state, seed),
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {
      onAccountUpdate(account, ready, addresses, indexes) {
        dispatch(hdpathPreview.actions.displayAccount(account, indexes));

        ownProps.onChange(ready ? account : undefined, addresses, indexes);
      },
      onReady(account, ready, addresses, indexes) {
        ownProps.onChange(ready ? account : undefined, addresses, indexes);
      },
      onStart() {
        dispatch(hdpathPreview.actions.init(ownProps.blockchains, ownProps.seed));
        dispatch(hwkey.actions.setWatch(true));
      },
    };
  },
)(SelectHDPath);
