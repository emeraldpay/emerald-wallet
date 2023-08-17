import { BigAmount } from '@emeraldpay/bigamount';
import {
  EthereumEntry,
  Uuid,
  Wallet,
  WalletEntry,
  isBitcoinEntry,
  isEthereumEntry,
} from '@emeraldpay/emerald-vault-core';
import { Blockchains, CurrencyAmount, blockchainIdToCode, formatFiatAmount } from '@emeraldwallet/core';
import { IState, accounts, screen } from '@emeraldwallet/store';
import { Button, HashIcon, Ledger } from '@emeraldwallet/ui';
import { ButtonGroup, Divider, Typography, createStyles, makeStyles } from '@material-ui/core';
import { ArrowDownward as ReceiveIcon, ArrowUpward as SendIcon, BorderColor as SignIcon } from '@material-ui/icons';
import * as React from 'react';
import { connect } from 'react-redux';
import BitcoinEntryItem from './entry/BitcoinEntryItem';
import EthereumEntryItem from './entry/EthereumEntryItem';

const useStyles = makeStyles((theme) =>
  createStyles({
    divider: {
      marginLeft: theme.spacing(),
      marginRight: theme.spacing(),
    },
    container: {
      display: 'flex',
    },
    columnLeft: {
      flex: '0 0 auto',
      marginLeft: theme.spacing(8),
      marginRight: theme.spacing(4),
    },
    columnRight: {
      flex: '1 1 auto',
      minWidth: 0,
    },
    walletIcon: {
      cursor: 'default',
      userSelect: 'none',
    },
    walletImage: {
      display: 'inline-block',
      height: 100,
      width: 100,
    },
    walletInfo: {
      alignItems: 'start',
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: theme.spacing(4),
    },
    walletDetails: {
      display: 'flex',
      flexDirection: 'column',
      marginRight: theme.spacing(2),
      minWidth: 0,
    },
    walletOptions: {
      alignItems: 'center',
      display: 'inline-flex',
    },
    walletOption: {
      marginRight: theme.spacing(),
    },
    walletBlockchains: {
      flex: 1,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    walletHardware: {
      alignItems: 'center',
      display: 'flex',
    },
    walletHardwareIcon: {
      display: 'block',
    },
    walletEntry: {
      '& + &': {
        marginTop: theme.spacing(2),
      },
    },
  }),
);

interface OwnProps {
  walletId: Uuid;
}

interface StateProps {
  balance?: CurrencyAmount;
  hasEthereumEntry: boolean;
  wallet?: Wallet;
  walletIcon?: string | null;
  isHardware(wallet: Wallet | undefined): boolean;
}

interface DispatchProps {
  gotoReceive(): void;
  gotoSend(): void;
  gotoSign(): void;
}

const WalletBalance: React.FC<OwnProps & StateProps & DispatchProps> = ({
  balance,
  hasEthereumEntry,
  wallet,
  walletIcon,
  isHardware,
  gotoSend,
  gotoSign,
  gotoReceive,
}) => {
  const styles = useStyles();

  const blockchains = React.useMemo(
    () =>
      wallet?.entries
        .reduce<string[]>((carry, entry) => {
          const blockchainCode = blockchainIdToCode(entry.blockchain);

          if (carry.includes(blockchainCode)) {
            return carry;
          }

          return [...carry, blockchainCode];
        }, [])
        .map((blockchain) => Blockchains[blockchain].getTitle())
        .join(', '),
    [wallet?.entries],
  );

  const entriesByBlockchain = React.useMemo(
    () =>
      Object.values(
        wallet?.entries
          .filter((entry) => !entry.receiveDisabled)
          .reduce<Record<number, WalletEntry[]>>(
            (carry, entry) => ({
              ...carry,
              [entry.blockchain]: [...(carry[entry.blockchain] ?? []), entry],
            }),
            {},
          ) ?? {},
      ),
    [wallet?.entries],
  );

  const receiveDisabledEntries = React.useMemo(
    () => wallet?.entries.filter((entry) => entry.receiveDisabled) ?? [],
    [wallet?.entries],
  );

  const renderEntry = (entries: WalletEntry[]): React.ReactNode => {
    if (wallet != null) {
      const [entry] = entries;

      if (isBitcoinEntry(entry)) {
        return (
          <div key={entry.id} className={styles.walletEntry}>
            <BitcoinEntryItem entry={entry} walletId={wallet.id} />
          </div>
        );
      }

      const ethereumEntries = entries.filter((item): item is EthereumEntry => isEthereumEntry(item));

      if (ethereumEntries.length > 0) {
        return (
          <div key={entry.id} className={styles.walletEntry}>
            <EthereumEntryItem entries={ethereumEntries} walletId={wallet.id} />
          </div>
        );
      }
    }

    return <></>;
  };

  return (
    <div className={styles.container}>
      <div className={styles.columnLeft}>
        {walletIcon == null ? (
          <HashIcon className={styles.walletIcon} value={`WALLET/${wallet?.id}`} size={100} />
        ) : (
          <img alt="Wallet Icon" className={styles.walletImage} src={`data:image/png;base64,${walletIcon}`} />
        )}
      </div>
      <div className={styles.columnRight}>
        <div className={styles.walletInfo}>
          <div className={styles.walletDetails}>
            <div className={styles.walletOptions}>
              {wallet?.name != null && wallet.name.length > 0 && (
                <Typography className={styles.walletOption} color="textPrimary" variant="h6">
                  {wallet.name}
                </Typography>
              )}
              {balance?.isPositive() && (
                <Typography className={styles.walletOption} variant="subtitle1">
                  {formatFiatAmount(balance)}
                </Typography>
              )}
            </div>
            <div className={styles.walletOptions}>
              <Typography className={styles.walletBlockchains} variant="caption">
                {blockchains}
              </Typography>
              {isHardware(wallet) ? (
                <div className={styles.walletHardware}>
                  <Divider flexItem className={styles.divider} orientation="vertical" />
                  <Typography variant="caption">
                    <Ledger className={styles.walletHardwareIcon} />
                  </Typography>
                  <Divider flexItem className={styles.divider} orientation="vertical" />
                  <Typography variant="caption">
                    {wallet?.reserved?.map(({ accountId }) => `m/x'/x'/${accountId}`).join(', ')}
                  </Typography>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
          <ButtonGroup>
            <Button primary icon={<SendIcon />} label="Send" onClick={gotoSend} />
            <Button primary icon={<ReceiveIcon />} label="Receive" onClick={gotoReceive} />
            <Button primary disabled={!hasEthereumEntry} icon={<SignIcon />} label="Sign" onClick={gotoSign} />
          </ButtonGroup>
        </div>
        {entriesByBlockchain.map(renderEntry)}
        {receiveDisabledEntries.map((entry) => renderEntry([entry]))}
      </div>
    </div>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { walletId }) => {
    const wallet = accounts.selectors.findWallet(state, walletId);

    let balances: BigAmount[] = [];

    if (wallet != null) {
      balances = accounts.selectors.getWalletBalances(state, wallet);
    }

    return {
      wallet,
      balance: accounts.selectors.fiatTotalBalance(state, balances),
      hasEthereumEntry: wallet?.entries.find((entry) => !entry.receiveDisabled && isEthereumEntry(entry)) != null,
      walletIcon: state.accounts.icons[walletId],
      isHardware(wallet) {
        const [account] = wallet?.reserved ?? [];

        if (account == null) {
          return false;
        }

        return accounts.selectors.isHardwareSeed(state, { type: 'id', value: account.seedId });
      },
    };
  },
  (dispatch, { walletId }) => ({
    gotoReceive() {
      dispatch(screen.actions.gotoScreen(screen.Pages.RECEIVE, walletId));
    },
    gotoSend() {
      dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX, walletId, null, true));
    },
    gotoSign() {
      dispatch(screen.actions.gotoScreen(screen.Pages.SIGN_MESSAGE, walletId));
    },
  }),
)(WalletBalance);
