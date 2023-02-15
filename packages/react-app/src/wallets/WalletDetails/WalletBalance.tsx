import { EthereumEntry, Wallet, WalletEntry, isBitcoinEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import { IState, accounts } from '@emeraldwallet/store';
import { HashIcon } from '@emeraldwallet/ui';
import { createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import BitcoinEntryItem from './BitcoinEntryItem';
import EthereumEntryItem from './EthereumEntryItem';

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      display: 'flex',
    },
    entries: {
      flex: '1 1 auto',
    },
    wallet: {
      flex: '0 0 auto',
      marginRight: theme.spacing(4),
    },
    walletIcon: {
      cursor: 'pointer',
      userSelect: 'none',
    },
    walletIconImage: {
      display: 'inline-block',
      height: 100,
      width: 100,
    },
  }),
);

interface OwnProps {
  walletId: string;
}

interface StateProps {
  wallet?: Wallet;
  walletIcon?: string | null;
}

const WalletBalance: React.FC<OwnProps & StateProps> = ({ wallet, walletIcon }) => {
  const styles = useStyles();

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

  const renderEntry = React.useCallback(
    (entries: WalletEntry[], index: number): React.ReactElement => {
      if (wallet != null) {
        const [entry] = entries;

        if (isBitcoinEntry(entry)) {
          return <BitcoinEntryItem key={entry.id} entry={entry} firstItem={index === 0} walletId={wallet.id} />;
        }

        const ethereumEntries = entries.filter((item): item is EthereumEntry => isEthereumEntry(item));

        if (ethereumEntries.length > 0) {
          return (
            <EthereumEntryItem key={entry.id} entries={ethereumEntries} firstItem={index === 0} walletId={wallet.id} />
          );
        }
      }

      return <></>;
    },
    [wallet],
  );

  return (
    <div className={styles.container}>
      <div className={styles.wallet}>
        {walletIcon == null ? (
          <HashIcon className={styles.walletIcon} value={`WALLET/${wallet?.id}`} size={100} />
        ) : (
          <img alt="Wallet Icon" className={styles.walletIconImage} src={`data:image/png;base64,${walletIcon}`} />
        )}
      </div>
      <div className={styles.entries}>
        {entriesByBlockchain.map(renderEntry)}
        {receiveDisabledEntries.map((entry, index) => renderEntry([entry], index))}
      </div>
    </div>
  );
};

export default connect<StateProps, unknown, OwnProps, IState>((state, { walletId }) => ({
  wallet: accounts.selectors.findWallet(state, walletId),
  walletIcon: state.accounts.icons[walletId],
}))(WalletBalance);
