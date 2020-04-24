import { AccountId } from '@emeraldpay/emerald-vault-core';
import { convert } from '@emeraldplatform/core';
import { Wei } from '@emeraldplatform/eth';
import { Account, ButtonGroup, Page } from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { Button, FormRow } from '@emeraldwallet/ui';
import { createStyles, withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import TxInputData from './TxInputData';
import TxStatus from './TxStatus';

export const styles = createStyles({
  value: {
    marginBottom: '5px',
    marginRight: '5px'
  },
  txData: {
    overflowX: 'auto',
    overflowWrap: 'break-word'
  },
  fieldName: {
    color: '#747474',
    fontSize: '16px',
    textAlign: 'right'
  },
  formRow: {
    display: 'flex',
    marginBottom: '19px',
    alignItems: 'center'
  },
  left: {
    flexBasis: '20%',
    marginLeft: '14.75px',
    marginRight: '14.75px'
  },
  right: {
    flexGrow: 2,
    display: 'flex',
    alignItems: 'center',
    marginLeft: '14.75px',
    marginRight: '14.75px',
    maxWidth: '580px'
  }
});

export interface ITxDetailsProps {
  fiatAmount?: string;
  fiatCurrency?: string;
  goBack?: (a?: any) => void;
  openAccount?: (a?: any) => void;
  fromAccount?: AccountId;
  toAccount?: AccountId;
  rates?: Map<string, number>;
  transaction: any;
  tokenSymbol: string;
  account?: any;
  classes?: any;
  repeatTx?: any;
  cancel?: any;
}

export function TxDetails (props: ITxDetailsProps) {

  const {
    transaction, classes, tokenSymbol, fiatCurrency, fiatAmount, goBack, fromAccount, toAccount
  } = props;

  function handleBack () {
    if (goBack) {
      goBack(props.account);
    }
  }

  function handleFromClick () {
    if (props.openAccount) {
      props.openAccount(props.fromAccount);
    }
  }

  function handleToClick () {
    if (props.openAccount) {
      props.openAccount(props.toAccount);
    }
  }

  function handleRepeatClick () {
    if (props.repeatTx) {
      props.repeatTx(transaction, toAccount, fromAccount);
    }
  }

  function handleCancelClick () {
    if (props.cancel) {
      props.cancel();
    }
  }

  const blockNumber = transaction.blockNumber;
  const txStatus = blockNumber ? 'success' : (transaction.discarded ? 'discarded' : 'queue');
  const date = transaction.timestamp ?
      transaction.timestamp :
      (transaction.since ? transaction.since : undefined);

  return (
      <Page title='Transaction Details' leftIcon={<Back onClick={handleBack} />}>
        <FormRow
          leftColumn={<div className={classes.fieldName}>Date</div>}
          rightColumn={(
            <div title={date ? date.toUTCString() : 'pending'}>
            {date ? date.toString() : 'pending'}
            </div>
          )}
        />

        <FormRow
          leftColumn={<div className={classes.fieldName}>Status</div>}
          rightColumn={<TxStatus status={txStatus} />}
        />

        <FormRow
          leftColumn={<div className={classes.fieldName}>Value</div>}
          rightColumn={(
            <div style={{ display: 'flex' }}>
              <div className={classes.value}>
                {transaction.value ? `${new Wei(transaction.value).toEther()} ${tokenSymbol}` : '--'}
              </div>
              {fiatAmount && (
                <div className={classes.value}>
                  {fiatAmount} {fiatCurrency}
                </div>
              )}
            </div>
          )}
        />

        <br />
        <br />

        <FormRow
          leftColumn={<div className={classes.fieldName}>Hash</div>}
          rightColumn={transaction.hash}
        />

        <FormRow
          leftColumn={<div className={classes.fieldName}>Nonce</div>}
          rightColumn={transaction.nonce}
        />

        <FormRow
          leftColumn={<div className={classes.fieldName}>From</div>}
          rightColumn={(
            <Account
              address={transaction.from}
              identity={true}
              identityProps={{ size: 30 }}
              onClick={handleFromClick}
            />
          )}
        />

        <FormRow
          leftColumn={<div className={classes.fieldName}>To</div>}
          rightColumn={
            transaction.to && (
              <Account
                data-testid={'to-account'}
                address={transaction.to}
                identity={true}
                identityProps={{ size: 30 }}
                onClick={handleToClick}
              />
            )
          }
        />

        <br />
        <br />

        <FormRow
          leftColumn={<div className={classes.fieldName}>Block</div>}
          rightColumn={<React.Fragment>{blockNumber ? convert.toNumber(blockNumber) : 'pending'}</React.Fragment>}
        />

        <FormRow
          leftColumn={<div className={classes.fieldName}>Input Data</div>}
          rightColumn={(
            <div className={classes.txData}>
              <TxInputData data={transaction.data} />
            </div>
          )}
        />

        <FormRow
          leftColumn={<div className={classes.fieldName}>GAS</div>}
          rightColumn={transaction.gas}
        />

        <br />

        <FormRow
          rightColumn={(
            <ButtonGroup>
              <Button onClick={handleCancelClick} label='DASHBOARD' />
              <Button primary={true} onClick={handleRepeatClick} label='REPEAT TRANSACTION' />
            </ButtonGroup>
          )}
        />
      </Page>
  );
}

export default withStyles(styles)(TxDetails);
