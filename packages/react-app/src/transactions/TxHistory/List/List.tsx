import { Uuid } from '@emeraldpay/emerald-vault-core';
import { StoredTransaction } from '@emeraldwallet/store';
import { Theme, Typography, createStyles } from '@material-ui/core';
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
    list: {
      paddingBottom: theme.spacing(4),
      paddingTop: theme.spacing(4),
    },
    empty: {
      padding: theme.spacing(4),
    },
  }),
);

interface OwnProps {
  cursor?: string | null;
  lastTxId: string | null;
  transactions: StoredTransaction[];
  walletId: Uuid;
  onLoadMore(): Promise<void>;
  setLastTxId(txId: string | null): void;
}

const TxList: React.FC<OwnProps> = ({ cursor, lastTxId, transactions, walletId, onLoadMore, setLastTxId }) => {
  const styles = useStyles();

  const listElement = React.useRef<List | null>(null);
  const initialTxCount = React.useRef(transactions.length);

  const [loading, setLoading] = React.useState(false);

  const [txIndex, setTxIndex] = React.useState<number | undefined>(
    transactions.findIndex((tx) => tx.txId === lastTxId),
  );

  const calculateRowHeight = ({ index }: Index): number => {
    const changeCount = Math.max(1, transactions[index].changes.filter((change) => change.wallet != null).length);

    return 53 + (changeCount - 1) * 63 + 20;
  };

  const onScroll = ({ clientHeight, scrollHeight, scrollTop }: ScrollParams): void => {
    if (transactions.length > initialTxCount.current) {
      setTxIndex(undefined);
    }

    if (!loading && cursor !== null) {
      if (clientHeight + scrollTop >= scrollHeight - scrollHeight * 0.1) {
        setLoading(true);

        onLoadMore().then(() => setLoading(false));
      }
    }
  };

  React.useEffect(() => {
    const { current: list } = listElement;

    if (list != null) {
      Array.from({ length: transactions.length }).forEach((item, index) => list.recomputeRowHeights(index));
    }
  }, [transactions]);

  React.useEffect(() => {
    if (transactions.length > initialTxCount.current) {
      setTxIndex(undefined);
    }
  }, [transactions.length]);

  return transactions.length > 0 ? (
    <div className={styles.container}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            className={styles.list}
            height={height}
            width={width}
            ref={listElement}
            rowCount={transactions.length}
            rowHeight={calculateRowHeight}
            rowRenderer={({ index, key, style }) => (
              <Transaction key={key} style={style} tx={transactions[index]} walletId={walletId} />
            )}
            scrollToAlignment="start"
            scrollToIndex={txIndex}
            onRowsRendered={({ startIndex }) => setLastTxId(transactions[startIndex]?.txId)}
            onScroll={onScroll}
          />
        )}
      </AutoSizer>
    </div>
  ) : (
    <div className={styles.empty}>
      <Typography color="secondary" variant="body2">
        There are no transactions.
      </Typography>
    </div>
  );
};

export default TxList;
