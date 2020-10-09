import {convert, InputDataDecoder} from '@emeraldplatform/core';
import {Account as AddressAvatar} from '@emeraldplatform/ui';
import {ArrowDown} from '@emeraldplatform/ui-icons';
import {
  BlockchainCode,
  tokenAmount,
  utils,
  EthereumStoredTransaction,
  IStoredTransaction,
  amountFactory, isEthereumStoredTransaction, isBitcoinStoredTransaction
} from '@emeraldwallet/core';
import {abi as TokenAbi} from '@emeraldwallet/erc20';
import {TableCell, TableRow, Typography} from '@material-ui/core';
import {withStyles} from '@material-ui/styles';
import * as React from 'react';
import TxStatus from './Status';
import {BigAmount} from "@emeraldpay/bigamount";
import {EntryId, Wallet, WalletEntry} from "@emeraldpay/emerald-vault-core";
import {Address} from '@emeraldwallet/ui';

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
  amountRenderer?: (balance: BigAmount) => any;
  tx: IStoredTransaction;
  openAccount: (blockchain: BlockchainCode, address: string) => void;
  fromWallet?: Wallet;
  toWallet?: Wallet;
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

export const TxItem = (props: ITxItemProps) => {
  const renderAmount = props.amountRenderer || defaultAmountRenderer;
  const {
    tx, openTx, openAccount, currentBlockHeight, fromWallet, toWallet, requiredConfirmations, token, coinTicker
  } = props;
  const {classes} = props;

  let symbol = coinTicker || '';
  const amountConverter = amountFactory(props.tx.blockchain);
  let balance: BigAmount = amountConverter(0);

  let from: React.ReactElement | undefined = undefined;
  let to: React.ReactElement | undefined = undefined;

  if (isEthereumStoredTransaction(tx)) {
    from = <AddressAvatar
      address={tx.from}
      onClick={openFromAccount}
    />;
    if (tx.to) {
      to = <AddressAvatar
        address={tx.to}
        onClick={openToAccount}
      />
    }
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
      balance = amountConverter(tx.value)
    }
  } else if (isBitcoinStoredTransaction(tx)) {
    const sent = tx.inputs
      .filter((it) => typeof it.entry !== "undefined")
      .map((it) => it.amount)
      .reduce((a, b) => a + b, 0);
    const received = tx.outputs
      .filter((it) => typeof it.entry !== "undefined")
      .map((it) => it.amount)
      .reduce((a, b) => a + b, 0);
    balance = amountConverter(Math.abs(received - sent));
    if (fromWallet) {
      from = <Typography>{fromWallet.name}</Typography>;
    } else {
      from = <Typography>--</Typography>;
    }
    if (toWallet) {
      to = <Typography>{toWallet.name}</Typography>;
    } else if (tx.outputs.length > 0) {
      to = <Address address={tx.outputs[0].address}/>;
    }
  }

  function openFromAccount() {
    if (isEthereumStoredTransaction(tx)) {
      openAccount(tx.blockchain, tx.from);
    }
  }

  function openToAccount() {
    if (isEthereumStoredTransaction(tx) && tx.to) {
      openAccount(tx.blockchain, tx.to);
    } else {
      console.warn("To account is not set");
    }
  }

  return (
    <TableRow>
      <TableCell className={classes.columnValue}>
        <div onClick={openTx}>{renderAmount(balance, symbol)}</div>
      </TableCell>
      <TableCell className={classes.columnArrow}>
        <ArrowDown color='secondary'/>
      </TableCell>
      <TableCell className={classes.columnAddresses}>
        {from}
        {to}
      </TableCell>
      <TableCell className={classes.columnStatus}>
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

const StyledTxView = withStyles(styles)(TxItem);

export default StyledTxView;
