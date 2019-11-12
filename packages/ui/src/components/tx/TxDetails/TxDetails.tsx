import { convert } from '@emeraldplatform/core';
import { Wei } from '@emeraldplatform/eth';
import { Account, ButtonGroup, Page } from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { IAccount } from '@emeraldwallet/core';
import { CSSProperties, withStyles } from '@material-ui/styles';
import * as React from 'react';
import Button from '../../common/Button';
import TxInputData from './TxInputData';
import TxStatus from './TxStatus';

export const styles = {
  value: {
    marginBottom: '5px',
    marginRight: '5px'
  },
  txData: {
    overflowX: 'auto',
    overflowWrap: 'break-word'
  } as CSSProperties,
  fieldName: {
    color: '#747474',
    fontSize: '16px',
    textAlign: 'right'
  } as CSSProperties,
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
};

export interface ITxDetailsProps {
  fiatAmount?: string;
  fiatCurrency?: string;
  goBack?: (a?: any) => void;
  openAccount?: (a?: any) => void;
  fromAccount?: IAccount;
  toAccount?: IAccount;
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
  };

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
        <div className={classes.formRow}>
          <div style={styles.left}>
            <div className={classes.fieldName}>Date</div>
          </div>
          <div style={styles.right} title={date ? date.toUTCString() : 'pending'}>
            {date ? date.toString() : 'pending'}
          </div>
        </div>
        <div className={classes.formRow}>
          <div style={styles.left}>
            <div className={classes.fieldName}>Status</div>
          </div>
          <div style={styles.right}>
            <TxStatus status={txStatus} />
          </div>
        </div>
        <div className={classes.formRow}>
          <div style={styles.left}>
            <div className={classes.fieldName}>Value</div>
          </div>
          <div style={styles.right}>
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
          </div>
        </div>
        <br />
        <br />

        <div className={classes.formRow}>
          <div style={styles.left}>
            <div className={classes.fieldName}>Hash</div>
          </div>
          <div style={styles.right}>
            {transaction.hash}
          </div>
        </div>

        <div className={classes.formRow}>
          <div style={styles.left}>
            <div className={classes.fieldName}>Nonce</div>
          </div>
          <div style={styles.right}>
            {transaction.nonce}
          </div>
        </div>

        <div className={classes.formRow}>
          <div style={styles.left}>
            <div className={classes.fieldName}>From</div>
          </div>
          <div style={{ ...styles.right, alignItems: 'center' }}>
            <Account
              address={transaction.from}
              identity={true}
              identityProps={{ size: 30 }}
              onClick={handleFromClick}
            />
          </div>
        </div>

        <div className={classes.formRow}>
          <div style={styles.left}>
            <div className={classes.fieldName}>To</div>
          </div>
          <div style={{ ...styles.right, alignItems: 'center' }}>
            {transaction.to && (
              <Account
                address={transaction.to}
                identity={true}
                identityProps={{ size: 30 }}
                onClick={handleToClick}
              />
            )}
          </div>
        </div>

        <br />
        <br />

        <div className={classes.formRow}>
          <div style={styles.left}>
            <div className={classes.fieldName}>Block</div>
          </div>
          <div style={styles.right}>
            {blockNumber ? convert.toNumber(blockNumber) : 'pending'}
          </div>
        </div>

        <div className={classes.formRow}>
          <div style={styles.left}>
            <div className={classes.fieldName}>Input Data</div>
          </div>
          <div style={styles.right}>
            <div className={classes.txData}>
              <TxInputData data={transaction.data} />
            </div>
          </div>
        </div>

        <div className={classes.formRow}>
          <div style={styles.left}>
            <div className={classes.fieldName}>GAS</div>
          </div>
          <div style={styles.right}>
            {transaction.gas}
          </div>
        </div>
        <br />

        <div className={classes.formRow}>
          <div style={styles.left}/>
          <div style={styles.right}>
            <ButtonGroup>
              <Button onClick={handleCancelClick} label='DASHBOARD' />
              <Button primary={true} onClick={handleRepeatClick} label='REPEAT TRANSACTION' />
            </ButtonGroup>
          </div>
        </div>
      </Page>
  );

}

export default withStyles(styles)(TxDetails);
