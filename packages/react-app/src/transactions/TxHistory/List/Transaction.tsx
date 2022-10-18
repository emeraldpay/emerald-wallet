import { BigAmount, FormatterBuilder } from '@emeraldpay/bigamount';
import { EntryId, Wallet } from '@emeraldpay/emerald-vault-core';
import {
  BlockchainCode,
  CurrencyAmount,
  PersistentState,
  blockchainIdToCode,
  formatAmount,
  isEthereum,
} from '@emeraldwallet/core';
import {
  IState,
  StoredTransaction,
  accounts,
  blockchains,
  screen,
  settings,
  transaction,
  txhistory,
} from '@emeraldwallet/store';
import { CoinAvatar, HashIcon } from '@emeraldwallet/ui';
import { IconButton, InputAdornment, Menu, MenuItem, TextField, createStyles, makeStyles } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import EditIcon from '@material-ui/icons/Edit';
import MoreIcon from '@material-ui/icons/MoreHoriz';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import * as React from 'react';
import { connect } from 'react-redux';
import ProgressPie from './ProgressPie';
import { WalletTabs } from '../../../wallets/WalletDetails';

const { Direction, State, Status } = PersistentState;

const Confirmations: Readonly<Record<BlockchainCode, number>> = {
  [BlockchainCode.Unknown]: 1,
  [BlockchainCode.BTC]: 3,
  [BlockchainCode.TestBTC]: 3,
  [BlockchainCode.ETH]: 12,
  [BlockchainCode.Goerli]: 12,
  [BlockchainCode.ETC]: 48,
};

const Confirmed: Readonly<Record<BlockchainCode, number>> = {
  [BlockchainCode.Unknown]: 1,
  [BlockchainCode.BTC]: 6 * 24,
  [BlockchainCode.TestBTC]: 6 * 24,
  [BlockchainCode.ETH]: 4 * 60 * 24,
  [BlockchainCode.Goerli]: 4 * 60 * 24,
  [BlockchainCode.ETC]: 4 * 60 * 24,
};

const useStyles = makeStyles((theme) =>
  createStyles({
    button: {
      color: theme.palette.text.secondary,
      fontSize: 16,
      padding: 4,
    },
    changes: {
      display: 'flex',
      flexDirection: 'column',
    },
    changeItem: {
      marginTop: 10,
    },
    changeItemAmount: {
      alignItems: 'center',
      display: 'flex',
      lineHeight: '24px',
      marginTop: 5,
    },
    changeItemAmountFiat: {
      color: theme.palette.text.secondary,
    },
    changeItemAmountWallet: {
      alignItems: 'center',
      color: theme.palette.text.secondary,
      cursor: 'pointer',
      display: 'flex',
      marginRight: 20,
    },
    changeItemAmountWalletIcon: {
      marginRight: 10,
    },
    changeItemCoin: {
      lineHeight: '24px',
      textAlign: 'right',
    },
    container: {
      boxSizing: 'border-box',
      display: 'flex',
      paddingBottom: theme.spacing(2),
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
    },
    progress: {
      marginRight: 20,
    },
    progressStatus: {
      position: 'relative',
      '&::before': {
        backgroundColor: 'gray',
        borderRadius: '50%',
        bottom: 0,
        content: "''",
        height: 10,
        position: 'absolute',
        right: 0,
        width: 10,
        zIndex: 1,
      },
    },
    progressStatusFail: {
      '&::before': {
        backgroundColor: theme.palette.error.main,
      },
    },
    progressStatusOk: {
      '&::before': {
        backgroundColor: theme.palette.success.main,
      },
    },
    progressStatusUnknown: {
      '&::before': {
        backgroundColor: theme.palette.warning.main,
      },
    },
    textField: {
      height: 24,
      padding: '0 1px',
      width: '100%',
    },
    textFieldRoot: {
      minHeight: 0,
    },
    textFieldInput: {
      fontSize: 16,
      height: 'auto',
      lineHeight: 1,
      padding: '1px 0',
    },
    transaction: {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      marginRight: 20,
    },
    transactionDetails: {
      alignItems: 'center',
      display: 'flex',
      lineHeight: '24px',
      marginTop: 5,
    },
    transactionDetailsInfo: {
      color: theme.palette.text.secondary,
      fontSize: 14,
      marginRight: 10,
      whiteSpace: 'nowrap',
    },
    transactionLabel: {
      alignItems: 'center',
      display: 'flex',
      lineHeight: '24px',
    },
    transactionLabelText: {
      marginRight: 10,
    },
  }),
);

type Change = Omit<txhistory.types.StoredTransactionChange, 'wallet'> & { wallet: Wallet };

interface OwnProps {
  tx: StoredTransaction;
  style?: React.CSSProperties;
}

interface StateProps {
  getFiatValue(amount: BigAmount): CurrencyAmount;
  getHeight(blockchain: BlockchainCode): number;
  getWallet(entryId: EntryId): Wallet | undefined;
}

interface DispatchProps {
  goToCancelTx(tx: StoredTransaction): void;
  goToSpeedUpTx(tx: StoredTransaction): void;
  goToTransaction(tx: StoredTransaction): void;
  goToWallet(walletId: string): void;
  setTransactionMeta(meta: PersistentState.TxMeta): Promise<PersistentState.TxMeta>;
}

const fiatFormatter = new FormatterBuilder().useTopUnit().number(2).append(' ').unitCode().build();

const Transaction: React.FC<OwnProps & StateProps & DispatchProps> = ({
  tx,
  style,
  getFiatValue,
  getHeight,
  getWallet,
  goToCancelTx,
  goToSpeedUpTx,
  goToTransaction,
  goToWallet,
  setTransactionMeta,
}) => {
  const styles = useStyles();

  const blockchainCode = blockchainIdToCode(tx.blockchain);

  const [menuAnchor, setMenuAnchor] = React.useState<HTMLButtonElement | null>(null);

  const [label, setLabel] = React.useState(tx.meta?.label ?? tx.txId);
  const [labelEdit, setLabelEdit] = React.useState(false);

  const confirmations = React.useMemo(() => {
    if (tx.block == null) {
      return 0;
    }

    const height = getHeight(blockchainCode);

    if (height > 0) {
      return height - tx.block.height;
    }

    return 0;
  }, [blockchainCode, tx.block, getHeight]);
  const confirmed = React.useMemo(() => confirmations >= Confirmed[blockchainCode], [blockchainCode, confirmations]);
  const sinceTime = React.useMemo(
    () =>
      DateTime.fromJSDate(tx.sinceTimestamp).toRelative({
        round: true,
        unit: ['years', 'months', 'days', 'hours', 'minutes'],
      }),
    [tx.sinceTimestamp],
  );

  const onEditLabel = React.useCallback(() => {
    setLabelEdit(!labelEdit);
  }, [labelEdit]);

  const onOpenMenu = React.useCallback((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setMenuAnchor(event.currentTarget);
  }, []);

  const onCloseMenu = React.useCallback(() => {
    setMenuAnchor(null);
  }, []);

  const onSaveLabel = React.useCallback(async () => {
    await setTransactionMeta({
      ...(tx.meta ?? {
        blockchain: blockchainCode,
        txId: tx.txId,
      }),
      label,
      timestamp: new Date(),
    });

    setLabelEdit(false);
  }, [blockchainCode, label, tx, setTransactionMeta]);

  return (
    <div className={styles.container} style={style}>
      <div className={styles.progress}>
        <ProgressPie progress={Math.min(100, (100 / Confirmations[blockchainCode]) * confirmations)}>
          <CoinAvatar
            blockchain={blockchainCode}
            className={classNames(
              styles.progressStatus,
              tx.status === Status.OK
                ? styles.progressStatusOk
                : tx.status === Status.FAILED
                ? styles.progressStatusFail
                : styles.progressStatusUnknown,
            )}
          />
        </ProgressPie>
      </div>
      <div className={styles.transaction}>
        <div className={styles.transactionLabel}>
          {labelEdit ? (
            <TextField
              InputProps={{
                classes: {
                  input: styles.textFieldInput,
                  root: styles.textFieldRoot,
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton className={styles.button} onClick={onSaveLabel}>
                      <CheckIcon fontSize="inherit" />
                    </IconButton>
                    <IconButton className={styles.button} onClick={onEditLabel}>
                      <CloseIcon fontSize="inherit" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              classes={{ root: styles.textField }}
              size="small"
              value={label}
              onChange={({ target: { value } }) => setLabel(value)}
              onKeyDown={({ key }) => key === 'Enter' && onSaveLabel()}
            />
          ) : (
            <>
              <div className={styles.transactionLabelText}>Tx {label}</div>
              <IconButton className={styles.button} onClick={onEditLabel}>
                <EditIcon fontSize="inherit" />
              </IconButton>
            </>
          )}
        </div>
        <div className={styles.transactionDetails}>
          <div className={styles.transactionDetailsInfo}>
            {sinceTime} / {confirmed ? 'Confirmed' : `${confirmations > 0 ? confirmations : 'No'} confirmation`}
          </div>
          <IconButton className={styles.button} onClick={onOpenMenu}>
            <MoreIcon fontSize="inherit" />
          </IconButton>
          <Menu anchorEl={menuAnchor} open={menuAnchor != null} onClose={onCloseMenu}>
            <MenuItem onClick={() => goToTransaction(tx)}>Details</MenuItem>
            {isEthereum(blockchainCode) && tx.state < State.CONFIRMED && (
              <MenuItem onClick={() => goToCancelTx(tx)}>Cancel</MenuItem>
            )}
            {isEthereum(blockchainCode) && tx.state < State.CONFIRMED && (
              <MenuItem onClick={() => goToSpeedUpTx(tx)}>Speed Up</MenuItem>
            )}
          </Menu>
        </div>
      </div>
      <div className={styles.changes}>
        {tx.changes
          .filter((change) => change.amountValue.isPositive())
          .reduce<Change[]>((carry, change) => {
            // TODO Remove second condition
            if (change.wallet == null || change.wallet === '-0') {
              return carry;
            }

            const wallet = getWallet(change.wallet);

            if (wallet == null) {
              return carry;
            }

            return [...carry, { ...change, amountValue: change.amountValue, wallet }];
          }, [])
          .map((change, index) => (
            <div className={index > 0 ? styles.changeItem : undefined} key={`${change.address}-${index}`}>
              <div className={styles.changeItemCoin}>
                {change.direction === Direction.EARN ? '+' : '-'} {formatAmount(change.amountValue)}
              </div>
              <div className={styles.changeItemAmount}>
                <div className={styles.changeItemAmountWallet} onClick={() => goToWallet(change.wallet.id)}>
                  <HashIcon
                    className={styles.changeItemAmountWalletIcon}
                    size={24}
                    value={`WALLET/${change.wallet.id}`}
                  />
                  {change.wallet.name}
                </div>
                <div className={styles.changeItemAmountFiat}>
                  {fiatFormatter.format(getFiatValue(change.amountValue))}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state) => ({
    getFiatValue(amount) {
      const { top: topUnit } = amount.units;

      const rate = settings.selectors.fiatRate(topUnit.code, state) ?? 0;
      const value = amount.getNumberByUnit(topUnit).multipliedBy(rate);

      return new CurrencyAmount(value.multipliedBy(100), state.settings.localeCurrency);
    },
    getHeight(blockchain) {
      return blockchains.selectors.getHeight(state, blockchain);
    },
    getWallet(entryId) {
      return accounts.selectors.findWalletByEntryId(state, entryId);
    },
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    async goToCancelTx(tx) {
      const ethTx = await dispatch(transaction.actions.getEthTx(blockchainIdToCode(tx.blockchain), tx.txId));

      if (ethTx != null) {
        dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX_CANCEL, ethTx, null, true));
      }
    },
    async goToSpeedUpTx(tx) {
      const ethTx = await dispatch(transaction.actions.getEthTx(blockchainIdToCode(tx.blockchain), tx.txId));

      if (ethTx != null) {
        dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX_SPEED_UP, ethTx, null, true));
      }
    },
    goToTransaction(tx) {
      dispatch(screen.actions.gotoScreen(screen.Pages.TX_DETAILS, tx, { tab: WalletTabs.TRANSACTIONS }));
    },
    goToWallet(walletId) {
      dispatch(screen.actions.gotoScreen(screen.Pages.WALLET, walletId));
    },
    setTransactionMeta(meta) {
      return dispatch(txhistory.actions.setTransactionMeta(meta));
    },
  }),
)(Transaction);
