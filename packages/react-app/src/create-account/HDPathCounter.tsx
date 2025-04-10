import { HDPath } from '@emeraldwallet/core';
import { IState } from '@emeraldwallet/store';
import { Box, IconButton, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import * as React from 'react';
import { connect } from 'react-redux';

const useStyles = makeStyles()({
  root: {
    fontSize: '1.2em',
    paddingLeft: 16,
  },
  currentPath: {
    marginRight: 10,
  },
  account: {
    cursor: 'grab',
    paddingLeft: 8,
    paddingRight: 8,
  },
  accountCurrent: {
    fontSize: '1.2em',
    fontWeight: 'bold',
  },
  accountDisabled: {
    color: '#f6eff0',
    cursor: 'not-allowed',
  },
});

type AccountItem = {
  account: number;
  current: boolean;
  disabled: boolean;
};

type OwnProps = {
  base: string;
  disabled?: number[];
  max?: number;
  onChange: (value: HDPath) => void;
  start?: number;
};

type StateProps = {
  disabled: number[];
  hdpath: HDPath;
  max: number;
  start: number;
};

const MAX = Math.pow(2, 31) - 1;

const Component: React.FC<OwnProps & StateProps> = ({ disabled, hdpath, max, start, onChange }) => {
  const { classes: styles } = useStyles();

  const [account, setAccount] = React.useState(start);

  const isDisabled = React.useCallback((account: number) => disabled.indexOf(account) >= 0, [disabled]);

  const updateAccount = React.useCallback(
    (account: number) => {
      setAccount(account);

      onChange(hdpath.forAccount(account));
    },
    [hdpath, onChange],
  );

  const onDecreaseAccount = React.useCallback(() => {
    if (account <= 0) {
      return;
    }

    let newAccount = account - 1;

    while (newAccount >= 0 && isDisabled(newAccount)) {
      newAccount--;
    }

    if (newAccount >= 0) {
      updateAccount(newAccount);
    }
  }, [account, isDisabled, updateAccount]);

  const onIncreaseAccount = React.useCallback(() => {
    if (account >= MAX) {
      return;
    }

    let newAccount = account + 1;

    while (newAccount < MAX && isDisabled(newAccount)) {
      newAccount++;
    }

    if (newAccount <= MAX) {
      updateAccount(newAccount);
    }
  }, [account, isDisabled, updateAccount]);

  const onAccountClick = React.useCallback(
    (account: AccountItem) => () => {
      if (!account.disabled) {
        updateAccount(account.account);
      }
    },
    [updateAccount],
  );

  let from = account - 3;
  let to = account + 3;

  if (from < 0) {
    to += from * -1;
    from = 0;
  }

  if (to > max) {
    from -= to - max;
    to = max;
  }

  const accounts: Array<AccountItem> = [];

  for (let i = from; i < to; i++) {
    accounts.push({
      account: i,
      current: i === account,
      disabled: isDisabled(i),
    });
  }

  return (
    <Box className={styles.root}>
      <Box component="span" className={styles.currentPath}>
        <Typography variant="caption">{hdpath.forAccount(account).toString()}</Typography>
      </Box>
      <Box component="span">
        <IconButton aria-label="dec" onClick={onDecreaseAccount} disabled={account === 0}>
          <RemoveIcon />
        </IconButton>
        {accounts.map((item) => (
          <Typography
            variant="caption"
            key={item.account}
            onClick={onAccountClick(item)}
            title={item.disabled ? 'Used by another wallet' : ''}
            className={`${styles.account} ${item.current ? styles.accountCurrent : ''} ${
              item.disabled ? styles.accountDisabled : ''
            }`}
          >
            {item.account}
          </Typography>
        ))}
        <IconButton aria-label="inc" onClick={onIncreaseAccount} disabled={account === MAX}>
          <AddIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default connect(
  (state: IState, ownProps: OwnProps): StateProps => ({
    disabled: ownProps.disabled ?? [],
    hdpath: HDPath.parse(ownProps.base),
    max: ownProps.max ?? MAX,
    start: ownProps.start ?? 0,
  }),
)(Component);
