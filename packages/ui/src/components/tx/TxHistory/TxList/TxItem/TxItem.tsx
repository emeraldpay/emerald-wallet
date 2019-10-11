import { convert, fromBaseUnits, InputDataDecoder } from '@emeraldplatform/core';
import { Account as AddressAvatar } from '@emeraldplatform/ui';
import { ArrowDown } from '@emeraldplatform/ui-icons';
import { Units } from '@emeraldwallet/core';
import { abi as TokenAbi } from '@emeraldwallet/erc20';
import { TableCell, TableRow } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import BigNumber from 'bignumber.js';
import * as React from 'react';
import TxStatus from './Status';

const decoder = new InputDataDecoder(TokenAbi);

export const styles2 = {
  columnArrow: {
    paddingLeft: '0px !important',
    paddingRight: '0px !important',
    paddingTop: '15px',
    paddingBottom: '15px',
    width: '24px',
    textOverflow: 'inherit'
  },
  columnValue: {
    width: '100px',
    paddingLeft: '0',
    paddingTop: '15px',
    paddingBottom: '15px'
  },
  columnStatus: {
    width: '100px',
    cursor: 'pointer',
    paddingTop: '15px',
    paddingBottom: '15px',
    paddingLeft: '0px'
  },
  columnAddresses: {
    width: '150px',
    paddingLeft: '5px'
  },
  highlighted: {
    shortenedAddress: {
      color: '#ff0000'
    }
  }
};

interface NetworkParams {
  currentBlockHeight: number;
  requiredConfirmations: number;
}

export interface ITxItemProps {
  netParams: NetworkParams;
  amountRenderer?: (balance: any, ticker: string) => any;
  tx: any;
  openAccount: any;
  toAccount: any;
  fromAccount: any;
  openTx: any;
  classes: any;
  token?: any;
  lang?: any;
  coinTicker?: string;
}

const timeStampFormatter = (lang: any) => (timestamp: any) => {
  const timestampEvent = new Date(timestamp * 1000);
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  };
  return timestampEvent.toLocaleDateString(lang, options);
};

const defaultAmountRenderer = ((balance: Units, ticker: any) => {
  const coins = fromBaseUnits(new BigNumber(balance.amount), balance.decimals).toString();
  return (<React.Fragment>{coins} {ticker}</React.Fragment>);
});

export const TxItem = (props: ITxItemProps) => {
  const renderAmount = props.amountRenderer || defaultAmountRenderer;
  const {
    tx, openTx, openAccount, toAccount, fromAccount, netParams, token, coinTicker
  } = props;
  const { classes } = props;

  const txValue = tx.value ? new Units(tx.value.toFixed(), 18) : null;

  let symbol = coinTicker || '';
  let balance = txValue;

  if (token) {
    const decodedTxData = decoder.decodeData(tx.data);
    symbol = token.symbol;
    if (decodedTxData.inputs.length > 0) {
      const decimals = token.decimals;
      let d = 18;
      if (decimals) {
        d = convert.toNumber(decimals);
      }
      balance = new Units(decodedTxData.inputs[1].toString(), d);
    }
  }

  return (
    <TableRow>
      <TableCell className={classes.columnValue}>
        {txValue && (<div onClick={openTx}>{renderAmount(balance, symbol)}</div>)}
      </TableCell>
      <TableCell className={classes.columnArrow}>
        <ArrowDown color='secondary'/>
      </TableCell>
      <TableCell className={classes.columnAddresses}>
        <AddressAvatar
          address={tx.from}
          name={fromAccount.name}
          onClick={() => openAccount(tx.from)}
        />
        {tx.to
        && <AddressAvatar
          address={tx.to}
          name={toAccount.name}
          onClick={() => openAccount(tx.to)}
        />}
      </TableCell>
      <TableCell className={classes.columnStatus} >
        <TxStatus
          currentBlockHeight={netParams.currentBlockHeight}
          txBlockNumber={tx.blockNumber}
          txTimestamp={tx.timestamp}
          requiredConfirmations={netParams.requiredConfirmations}
          timeStampFormatter={timeStampFormatter(props.lang)}
          onClick={openTx}
        />
      </TableCell>
    </TableRow>
  );
};

const StyledTxView = withStyles(styles2)(TxItem);

export default StyledTxView;
