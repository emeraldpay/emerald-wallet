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
import { ButtonGroup, Divider, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { ArrowDownward as ReceiveIcon, ArrowUpward as SendIcon, BorderColor as SignIcon } from '@mui/icons-material';
import * as React from 'react';
import { connect } from 'react-redux';
import BitcoinEntryItem from './entry/BitcoinEntryItem';
import EthereumEntryItem from './entry/EthereumEntryItem';

const useStyles = makeStyles()((theme) =>
  ({
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
    }
  }));

interface OwnProps {
  walletId: Uuid;
}

interface StateProps {
  blockchains: string | undefined;
  fiatBalance: CurrencyAmount | undefined;
  groupedEntries: WalletEntry[][];
  hasAnyBalance: boolean;
  hasEthereumEntry: boolean;
  wallet: Wallet | undefined;
  walletIcon: string | null | undefined;
  isHardware(wallet: Wallet | undefined): boolean;
}

interface DispatchProps {
  gotoReceive(): void;
  gotoSend(): void;
  gotoSign(): void;
}

const WalletBalance: React.FC<OwnProps & StateProps & DispatchProps> = ({
  blockchains,
  fiatBalance,
  groupedEntries,
  hasAnyBalance,
  hasEthereumEntry,
  wallet,
  walletIcon,
  isHardware,
  gotoSend,
  gotoSign,
  gotoReceive,
}) => {
  const { classes: styles } = useStyles();

  const renderEntries = (entries: WalletEntry[]): React.ReactNode => {
    if (wallet == null) {
      return null;
    }

    const [entry] = entries;

    if (isBitcoinEntry(entry)) {
      return (
        <div key={entry.id} className={styles.walletEntry}>
          <BitcoinEntryItem entry={entry} walletId={wallet.id} />
        </div>
      );
    }

    const ethereumEntries = entries
      .filter(({ blockchain }) => blockchain === entry.blockchain)
      .filter((item): item is EthereumEntry => isEthereumEntry(item));

    return (
      <div key={entry.id} className={styles.walletEntry}>
        <EthereumEntryItem entries={ethereumEntries} walletId={wallet.id} />
      </div>
    );
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
              {fiatBalance?.isPositive() && (
                <Typography className={styles.walletOption} variant="subtitle1">
                  {formatFiatAmount(fiatBalance)}
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
              ) : null}
            </div>
          </div>
          <ButtonGroup variant={"outlined"}>
            <Button primary variant={"outlined"} disabled={!hasAnyBalance} icon={<SendIcon />} label="Send" onClick={gotoSend} />
            <Button primary variant={"outlined"} icon={<ReceiveIcon />} label="Receive" onClick={gotoReceive} />
            <Button primary variant={"outlined"} disabled={!hasEthereumEntry} icon={<SignIcon />} label="Sign" onClick={gotoSign} />
          </ButtonGroup>
        </div>
        {groupedEntries.map(renderEntries)}
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

    const entriesByBlockchain = wallet?.entries
      .filter((entry) => !entry.receiveDisabled)
      .reduce<Record<number, WalletEntry[]>>((carry, entry) => {
        const { [entry.blockchain]: entries = [] } = carry;

        return { ...carry, [entry.blockchain]: [...entries, entry] };
      }, {});

    const groupedEntries = Object.values(entriesByBlockchain ?? {}).reduce<WalletEntry[][]>((carry, entries) => {
      const [entry] = entries;

      const addresses = entries.map(({ address }) => address?.value).filter((address) => address != null);

      const wrongEntry = wallet?.entries.find(
        ({ address, blockchain, receiveDisabled }) =>
          receiveDisabled === true && address && addresses.includes(address.value) && blockchain !== entry.blockchain,
      );

      if (wrongEntry == null) {
        return [...carry, entries];
      }

      return [...carry, entries, [wrongEntry]];
    }, []);

    return {
      groupedEntries,
      wallet,
      blockchains: wallet?.entries
        .filter(({ receiveDisabled }) => !receiveDisabled)
        .reduce<string[]>((carry, entry) => {
          const blockchainCode = blockchainIdToCode(entry.blockchain);

          if (carry.includes(blockchainCode)) {
            return carry;
          }

          return [...carry, blockchainCode];
        }, [])
        .map((blockchain) => Blockchains[blockchain].getTitle())
        .join(', '),
      fiatBalance: accounts.selectors.fiatTotalBalance(state, balances),
      hasAnyBalance: balances.some((balance) => balance.isPositive()),
      hasEthereumEntry: wallet?.entries.some((entry) => !entry.receiveDisabled && isEthereumEntry(entry)) ?? false,
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
      dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX, { walletId }, null, true));
    },
    gotoSign() {
      dispatch(screen.actions.gotoScreen(screen.Pages.SIGN_MESSAGE, walletId));
    },
  }),
)(WalletBalance);
