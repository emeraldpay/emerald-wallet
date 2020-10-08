import {convert, InputDataDecoder} from '@emeraldplatform/core';
import {Account as AddressAvatar} from '@emeraldplatform/ui';
import {ArrowDown} from '@emeraldplatform/ui-icons';
import {BlockchainCode, tokenAmount, utils, EthereumStoredTransaction} from '@emeraldwallet/core';
import {abi as TokenAbi} from '@emeraldwallet/erc20';
import {TableCell, TableRow} from '@material-ui/core';
import {withStyles} from '@material-ui/styles';
import * as React from 'react';
import TxStatus from './Status';
import {BigAmount} from "@emeraldpay/bigamount";
import {Wei} from '@emeraldpay/bigamount-crypto';
import {EntryId} from "@emeraldpay/emerald-vault-core/lib/types";

const decoder = new InputDataDecoder(TokenAbi);

const styles = {
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

export interface ITxItemProps {
  currentBlockHeight: number;
  requiredConfirmations: number;
  amountRenderer?: (balance: any, ticker: string) => any;
  tx: EthereumStoredTransaction;
  openAccount: (blockchain: BlockchainCode, address: string) => void;
  toAccount?: EntryId;
  fromAccount?: EntryId;
  openTx: () => void;
  classes: any;
  token?: any;
  lang?: any;
  coinTicker?: string;
}

const timeStampFormatter = (lang: any) => (timestamp: any) => {
  const timestampEvent = utils.parseDate(timestamp);
  if (typeof timestampEvent === 'undefined' || timestampEvent == null) {
    return '?';
  }
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  };
  return timestampEvent.toLocaleDateString(lang, options);
};

const defaultAmountRenderer = ((amount: BigAmount, ticker: any) => {
  return (<React.Fragment>{amount.toString()} {ticker}</React.Fragment>);
});

export const EthereumTxItem = (props: ITxItemProps) => {
  const renderAmount = props.amountRenderer || defaultAmountRenderer;
  const {
    tx, openTx, openAccount, toAccount, fromAccount, currentBlockHeight, requiredConfirmations, token, coinTicker
  } = props;
  const {classes} = props;

  let symbol = coinTicker || '';
  let balance: BigAmount;

  if (token) {
    const decodedTxData = decoder.decodeData(tx.data || '');
    symbol = token.symbol;
    if (decodedTxData.inputs.length > 0) {
      const decimals = token.decimals;
      let d = 18;
      if (decimals) {
        d = convert.toNumber(decimals);
      }
      balance = tokenAmount(decodedTxData.inputs[1].toString(), token.symbol);
    } else {
      balance = tokenAmount(0, token.symbol);
    }
  } else {
    balance = new Wei(tx.value)
  }

  function openFromAccount () {
    openAccount(tx.blockchain, tx.from);
  }

  function openToAccount () {
    if (tx.to) {
      openAccount(tx.blockchain, tx.to);
    } else {
      console.warn("To account is not set");
    }
  }

  return (
    <TableRow>
      <TableCell className={classes.columnValue}>
        {balance && (<div onClick={openTx}>{renderAmount(balance, symbol)}</div>)}
      </TableCell>
      <TableCell className={classes.columnArrow}>
        <ArrowDown color='secondary'/>
      </TableCell>
      <TableCell className={classes.columnAddresses}>
        <AddressAvatar
          address={tx.from}
          onClick={openFromAccount}
        />
        {tx.to && (
          <AddressAvatar
            address={tx.to}
            onClick={openToAccount}
          />
          )}
      </TableCell>
      <TableCell className={classes.columnStatus} >
        <TxStatus
          currentBlockHeight={currentBlockHeight}
          txBlockNumber={parseInt(tx.blockNumber?.toString() || "0")}
          txTimestamp={tx.timestamp}
          txSince={
            typeof tx.since == "string" ? new Date(tx.since) :
              tx.since || new Date(0)
          }
          txDiscarded={tx.discarded || false}
          requiredConfirmations={requiredConfirmations}
          timeStampFormatter={timeStampFormatter(props.lang)}
          onClick={openTx}
        />
      </TableCell>
    </TableRow>
  );
};

const StyledTxView = withStyles(styles)(EthereumTxItem);

export default StyledTxView;
