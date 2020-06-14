import {connect} from "react-redux";
import {Dispatch} from "react";
import * as React from 'react';
import {Box, createStyles, IconButton} from "@material-ui/core";
import {IState} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import {HDPath} from "@emeraldwallet/core";
import RemoveIcon from '@material-ui/icons/Remove';
import AddIcon from '@material-ui/icons/Add';

const useStyles = makeStyles(
  createStyles({
    root: {
      fontSize: "1.2em",
    },
    currentPath: {
      marginRight: "10px"
    },
    account: {
      paddingLeft: "5px",
      paddingRight: "5px",
      cursor: "grab"
    },
    accountCurrent: {
      fontWeight: "bold",
      fontSize: "1.2em"
    },
    accountDisabled: {
      color: "#aaa",
      cursor: "not-allowed"
    }
  })
);

const MAX = Math.pow(2, 31) - 1;

/**
 *
 */
const Component = (({start, hdpath, max, disabled, onChange}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  const [account, setAccount] = React.useState(start)
  let from = account - 3;
  let to = account + 3;
  if (from < 0) {
    to += from * -1;
    from = 0;
  }
  if (to > max) {
    from -= (to - max);
    to = max;
  }

  function isDisabled(account: number) {
    return disabled.indexOf(account) >= 0;
  }

  const accounts = [];
  for (let i = from; i < to; i++) {
    accounts.push({
      account: i,
      disabled: isDisabled(i),
      current: i == account
    });
  }

  function update(account: number) {
    setAccount(account);
    onChange(hdpath.forAccount(account));
  }

  function dec() {
    if (account <= 0) {
      return;
    }
    let x = account - 1;
    while (x >= 0 && isDisabled(x)) {
      x--;
    }
    if (x >= 0) {
      update(x)
    }
  }

  function inc() {
    if (account >= MAX) {
      return;
    }
    let x = account + 1;
    while (x < MAX && isDisabled(x)) {
      x++;
    }
    if (x <= MAX) {
      update(x)
    }
  }


  return <Box className={styles.root}>
    <Box component={"span"} className={styles.currentPath}>{hdpath.forAccount(account).toString()}</Box>
    <Box component={'span'}>
      <IconButton aria-label="dec" onClick={dec} disabled={account == 0}>
        <RemoveIcon/>
      </IconButton>
      {accounts.map((acc) => (
        <Box component={'span'}
             key={acc.account}
             onClick={() => {
               if (!acc.disabled) {
                 update(acc.account)
               }
             }}
             title={acc.disabled ? "Used by another wallet" : ""}
             className={
               styles.account +
               " " + (acc.current ? styles.accountCurrent : "") +
               " " + (acc.disabled ? styles.accountDisabled : "")
             }>
          {acc.account}
        </Box>
      ))}
      <IconButton aria-label="inc" onClick={inc} disabled={account == MAX}>
        <AddIcon/>
      </IconButton>
    </Box>
  </Box>
})

// State Properties
type Props = {
  start: number,
  max: number,
  disabled: number[],
  hdpath: HDPath
}
// Actions
type Actions = {}

// Component properties
type OwnProps = {
  base: string,
  start?: number,
  max?: number,
  disabled?: number[],
  onChange: (value: HDPath) => void;
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {
      start: ownProps.start || 0,
      max: ownProps.max || MAX,
      disabled: ownProps.disabled || [],
      hdpath: HDPath.parse(ownProps.base)
    }
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {}
  }
)((Component));