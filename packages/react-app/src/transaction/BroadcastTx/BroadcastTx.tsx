import { convert, fromBaseUnits } from '@emeraldplatform/core';
import { Units as EthUnits, Wei } from '@emeraldplatform/eth';
import { Account, ButtonGroup, Page } from '@emeraldplatform/ui';
import { Blockchains, EthereumTx } from '@emeraldwallet/core';
import { decodeData, registry } from '@emeraldwallet/erc20';
import { screen, transaction } from '@emeraldwallet/store';
import { Button, FormRow } from '@emeraldwallet/ui';
import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { connect } from 'react-redux';
import ChainTitle from '../../common/ChainTitle';

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
    const currentChain = Blockchains[tx.blockchain];
    const decoded = EthereumTx.fromRaw(signed, currentChain.params.chainId);
    const txData = decoded.getData();

    // console.debug('Decoded Tx: ' + JSON.stringify(decoded));
    // console.debug('Tx has data field: ' + txData);

    let erc20Tx = null;
    let coinSymbol = currentChain.params.coinTicker;
    if (txData.length > 0) {
      const decodedData = decodeData(txData);
      erc20Tx = {
        to: decodedData.inputs[0].toString(16),
        value: convert.toNumber('0x' + decodedData.inputs[1].toString(16)).toString()
      };
      const tokenInfo = registry.byAddress(currentChain.params.code, decoded.getRecipientAddress().toString());
      if (tokenInfo) {
        coinSymbol = tokenInfo.symbol;
        erc20Tx.value = fromBaseUnits(erc20Tx.value, tokenInfo.decimals).toString(10);
      }
    }

    const wei = new Wei(convert.toNumber(decoded.getValue()));
    const etherValue = wei.toString(EthUnits.ETHER, 18);
    return (
      <Page title={<ChainTitle chain={tx.blockchain} text={'Publish Transaction'} />}>
        <FormRow
          leftColumn={<div className={classes.fieldName}>From</div>}
          rightColumn={<Account identity={true} address={decoded.getSenderAddress().toString()} />}
        />
        {(erc20Tx === null) && (
          <React.Fragment>
            <FormRow
              leftColumn={<div className={classes.fieldName}>To</div>}
              rightColumn={<Account identity={true} address={decoded.getRecipientAddress().toString()} />}
            />
            <FormRow
              leftColumn={<div className={classes.fieldName}>Amount</div>}
              rightColumn={<div data-testid='token-amount'>{etherValue} {coinSymbol}</div>}
            />
          </React.Fragment>
        )}
        {(erc20Tx !== null) && (
          <React.Fragment>
            <FormRow
              leftColumn={<div className={classes.fieldName}>To</div>}
              rightColumn={<Account identity={true} address={erc20Tx.to} />}
            />
            <FormRow
              leftColumn={<div className={classes.fieldName}>Amount</div>}
              rightColumn={<div data-testid='token-amount'>{erc20Tx.value} {coinSymbol}</div>}
            />
          </React.Fragment>
        )}
        <FormRow
          leftColumn={<div className={classes.fieldName}>Nonce</div>}
          rightColumn={<div data-testid='nonce'>{decoded.getNonce()}</div>}
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
      dispatch(transaction.actions.broadcastTx(tx.blockchain, tx, signed));
    },
    onCancel: () => {
      dispatch(screen.actions.gotoScreen(screen.Pages.HOME));
    }
  })
)(StyledView);
