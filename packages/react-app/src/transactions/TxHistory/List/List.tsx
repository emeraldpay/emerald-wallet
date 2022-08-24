import { StoredTransaction } from '@emeraldwallet/store';
import { Theme, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import List from 'rc-virtual-list';
import * as React from 'react';
import Transaction from './Transaction';

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    emptyList: {
      color: theme.palette.text.secondary,
    },
    list: {
      paddingRight: 18,
    },
  }),
);

interface OwnProps {
  cursor?: string | null;
  transactions: StoredTransaction[];
  onLoadMore(): void;
}

const TransactionsList: React.FC<OwnProps> = ({ cursor, transactions, onLoadMore }) => {
  const styles = useStyles();

  const onScroll = React.useCallback(
    (event: React.UIEvent<HTMLElement, UIEvent>) => {
      if (cursor != null) {
        const { offsetHeight, scrollHeight, scrollTop } = event.currentTarget;

        if (offsetHeight + scrollTop >= scrollHeight - scrollHeight * 0.1) {
          onLoadMore();
        }
      }
    },
    [cursor, onLoadMore],
  );

  return transactions.length > 0 ? (
    <List prefixCls={styles.list} data={transactions} itemHeight={73} itemKey="txId" height={500} onScroll={onScroll}>
      {(tx) => <Transaction tx={tx} />}
    </List>
  ) : (
    <div className={styles.emptyList}>There are no transactions.</div>
  );
};

export default TransactionsList;
