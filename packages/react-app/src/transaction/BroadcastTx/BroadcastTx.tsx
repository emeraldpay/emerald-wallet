import { Account, ButtonGroup, Page } from '@emeraldplatform/ui';
import { Blockchains, EthereumTx } from '@emeraldwallet/core';
import { decodeData } from '@emeraldwallet/erc20';
import { addresses, screen } from '@emeraldwallet/store';
import { Button, FormRow } from '@emeraldwallet/ui';
import { withStyles } from '@material-ui/styles';
import * as React from 'react';
import { connect } from 'react-redux';
import { convert } from '@emeraldplatform/eth';

interface IBroadcastTxViewProps {
  tx: any;
  signed: any;
  onSendTx?: any;
  onCancel?: any;
  classes: any;
}

export const styles = {
  fieldName: {
    color: '#747474',
    fontSize: '16px',
    textAlign: 'right'
  }
};

export class BroadcastTxView extends React.Component<IBroadcastTxViewProps> {
  public render () {
    const { tx, signed, classes } = this.props;
    const decoded = EthereumTx.fromRaw(signed, Blockchains[tx.blockchain].params.chainId);
    const txData = decoded.getData();
    let erc20Tx = null;
    if (txData.length > 0) {
      const decodedData = decodeData(txData);
      erc20Tx = {
        to: decodedData.inputs[0].toString(16),
        value: convert.toNumber('0x' + decodedData.inputs[1].toString(16)).toString()
      };
    }
    return (
      <Page title='Publish Transaction'>
        <FormRow
          rightColumn={<span>{tx.blockchain}</span>}
        />
        <FormRow
          leftColumn={<div className={classes.fieldName}>From</div>}
          rightColumn={<Account address={decoded.getSenderAddress()} />}
        />
        {(!erc20Tx) && (
          <React.Fragment>
            <FormRow
              leftColumn={<div className={classes.fieldName}>To</div>}
              rightColumn={<Account address={decoded.getRecipientAddress()} />}
            />
            <FormRow
              leftColumn={<div className={classes.fieldName}>Amount</div>}
              rightColumn={<div>{decoded.getValue()}</div>}
            />
          </React.Fragment>
        )}
        {erc20Tx && (
          <React.Fragment>
            <FormRow
              leftColumn={<div className={classes.fieldName}>To</div>}
              rightColumn={<Account address={erc20Tx.to} />}
            />
            <FormRow
              leftColumn={<div className={classes.fieldName}>Amount</div>}
              rightColumn={<div>{erc20Tx.value}</div>}
            />
          </React.Fragment>
        )}
        <FormRow
          rightColumn={<textarea readOnly={true} value={JSON.stringify(this.props.tx)}/>}
        />
        <FormRow
          leftColumn={<div className={classes.fieldName}>Raw Tx</div>}
          rightColumn={<textarea rows={8} style={{ width: '100%' }} readOnly={true} value={this.props.signed} />}
        />
        <FormRow
          rightColumn={(
              <ButtonGroup>
                <Button label={'Cancel'} onClick={this.handleCancelClick} />
                <Button label={'Send'} primary={true} onClick={this.handleSendClick} />
              </ButtonGroup>
          )}
        />
      </Page>
    );
  }
  private handleCancelClick = () => {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  }

  private handleSendClick = () => {
    if (this.props.onSendTx) {
      const { tx, signed } = this.props;
      this.props.onSendTx(tx, signed);
    }
  }
}

// @ts-ignore
const StyledView = withStyles(styles)(BroadcastTxView);

export default connect(
  (state: any, ownProps: any) => {
    return {

    };
  },

  (dispatch: any, ownProps: any) => ({
    onSendTx: (tx: any, signed: any) => {
      dispatch(addresses.actions.broadcastTx(tx.blockchain, tx, signed));
    },
    onCancel: () => {
      dispatch(screen.actions.gotoScreen('home'));
    }
  })
)(StyledView);
