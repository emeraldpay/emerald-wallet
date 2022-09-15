import { EthereumEntry, Wallet, WalletEntry, isBitcoinEntry, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import { IState, accounts } from '@emeraldwallet/store';
import { HashIcon } from '@emeraldwallet/ui';
import { Box, createStyles, makeStyles } from '@material-ui/core';
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
  }),
);

interface OwnProps {
  walletId: string;
}

interface StateProps {
  wallet?: Wallet;
}

const WalletBalance: React.FC<OwnProps & StateProps> = ({ wallet }) => {
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
    (entries: WalletEntry[]): React.ReactElement => {
      if (wallet != null) {
        const [entry] = entries;

        if (isBitcoinEntry(entry)) {
          return <BitcoinEntryItem walletId={wallet.id} entry={entry} key={entry.id} />;
        }

        const ethereumEntries = entries.filter((item): item is EthereumEntry => isEthereumEntry(item));

        if (ethereumEntries.length > 0) {
          return <EthereumEntryItem walletId={wallet.id} entries={ethereumEntries} key={entry.id} />;
        }
      }

      return <Box />;
    },
    [wallet],
  );

  return (
    <div className={styles.container}>
      <div className={styles.wallet}>
        <HashIcon className={styles.walletIcon} value={'WALLET/' + wallet?.id} size={100} />
      </div>
      <div className={styles.entries}>
        {entriesByBlockchain.map(renderEntry)}
        {receiveDisabledEntries.map((entry) => renderEntry([entry]))}
      </div>
    </div>
  );
};

export default connect<StateProps, {}, OwnProps, IState>((state, ownProps) => ({
  wallet: accounts.selectors.findWallet(state, ownProps.walletId),
}))(WalletBalance);
