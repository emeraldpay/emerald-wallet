import { StoredTransaction } from '@emeraldwallet/store';
import { Theme, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { AutoSizer, Index, List } from 'react-virtualized';
import { ScrollParams } from 'react-virtualized/dist/es/Grid';
import Transaction from './Transaction';

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    container: {
      height: '100%',
    },
    emptyList: {
      color: theme.palette.text.secondary,
      padding: theme.spacing(4),
    },
    list: {
      paddingBottom: theme.spacing(4),
      paddingTop: theme.spacing(4),
    },
  }),
);

interface OwnProps {
  cursor?: string | null;
  lastTxId: string | null;
  transactions: StoredTransaction[];
  onLoadMore(): Promise<void>;
  setLastTxId(txId: string | null): void;
}

const TransactionsList: React.FC<OwnProps> = ({ cursor, lastTxId, transactions, onLoadMore, setLastTxId }) => {
  const styles = useStyles();

  const initialTxCount = React.useRef(transactions.length);

  const [loading, setLoading] = React.useState(false);
  const [txIndex, setTxIndex] = React.useState<number | undefined>(
    transactions.findIndex((tx) => tx.txId === lastTxId),
  );

  const calculateRowHeight = React.useCallback(
    ({ index }: Index) => {
      const changeCount = transactions[index].changes.filter(
        (change) => change.wallet != null && change.amountValue.isPositive(),
      ).length;

      return changeCount > 1 ? 53 + (changeCount - 1) * 63 + 20 : 73;
    },
    [transactions],
  );

  const onScroll = React.useCallback(
    ({ clientHeight, scrollHeight, scrollTop }: ScrollParams) => {
      if (transactions.length > initialTxCount.current) {
        setTxIndex(undefined);
      }

      if (!loading && cursor !== null) {
        if (clientHeight + scrollTop >= scrollHeight - scrollHeight * 0.1) {
          setLoading(true);

          onLoadMore().then(() => setLoading(false));
        }
      }
    },
    [cursor, loading, transactions, onLoadMore],
  );

  React.useEffect(() => {
    if (transactions.length > initialTxCount.current) {
      setTxIndex(undefined);
    }
  }, [transactions]);

  return transactions.length > 0 ? (
    <div className={styles.container}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            className={styles.list}
            height={height}
            width={width}
            rowCount={transactions.length}
            rowHeight={calculateRowHeight}
            rowRenderer={({ index, key, style }) => <Transaction key={key} style={style} tx={transactions[index]} />}
            scrollToAlignment="start"
            scrollToIndex={txIndex}
            onRowsRendered={({ startIndex }) => setLastTxId(transactions[startIndex]?.txId)}
            onScroll={onScroll}
          />
        )}
      </AutoSizer>
    </div>
  ) : (
    <div className={styles.emptyList}>There are no transactions.</div>
  );
};

export default TransactionsList;
