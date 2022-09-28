import { Wei } from '@emeraldpay/bigamount-crypto';
import { Blockchains, EthereumTx, fromBaseUnits, toNumber } from '@emeraldwallet/core';
import { decodeData, registry } from '@emeraldwallet/erc20';
import { screen, transaction } from '@emeraldwallet/store';
import { BroadcastData } from '@emeraldwallet/store/lib/transaction/actions';
import { Account, Button, ButtonGroup, FormRow, Page } from '@emeraldwallet/ui';
import { createStyles } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { connect } from 'react-redux';
import ChainTitle from '../../common/ChainTitle';

export const styles = createStyles({
  fieldName: {
    color: '#747474',
    fontSize: '16px',
    textAlign: 'right',
  },
});

interface OwnProps {
  data: BroadcastData;
}

interface DispatchProps {
  onCancel(): void;
  onSendTx(data: BroadcastData): void;
}

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

export class BroadcastTxView extends React.Component<OwnProps & DispatchProps & StylesProps> {
  public render(): JSX.Element {
    const {
      classes,
      data: { blockchain, signed },
    } = this.props;

    const currentChain = Blockchains[blockchain];
    const decoded = EthereumTx.fromRaw(signed, currentChain.params.chainId);
    const txData = decoded.getData();

    let erc20Tx = null;
    let coinSymbol = currentChain.params.coinTicker;

    if (txData.length > 0) {
      const decodedData = decodeData(txData);

      if (decodedData.inputs.length > 0) {
        erc20Tx = {
          to: decodedData.inputs[0].toString(16),
          value: toNumber('0x' + decodedData.inputs[1].toString(16)).toString(),
        };

        const tokenInfo = registry.byAddress(currentChain.params.code, decoded.getRecipientAddress().toString());

        if (tokenInfo) {
          coinSymbol = tokenInfo.symbol;
          erc20Tx.value = fromBaseUnits(erc20Tx.value, tokenInfo.decimals).toString(10);
        }
      }
    }

    const wei = new Wei(toNumber(decoded.getValue()));
    const etherValue = wei.toEther();

    return (
      <Page title={<ChainTitle chain={blockchain} text={'Publish Transaction'} />}>
        <FormRow
          leftColumn={<div className={classes.fieldName}>From</div>}
          rightColumn={<Account identity={true} address={decoded.getSenderAddress().toString()} />}
        />
        {erc20Tx === null && (
          <React.Fragment>
            <FormRow
              leftColumn={<div className={classes.fieldName}>To</div>}
              rightColumn={<Account identity={true} address={decoded.getRecipientAddress().toString()} />}
            />
            <FormRow
              leftColumn={<div className={classes.fieldName}>Amount</div>}
              rightColumn={
                <div data-testid="token-amount">
                  {etherValue} {coinSymbol}
                </div>
              }
            />
          </React.Fragment>
        )}
        {erc20Tx !== null && (
          <React.Fragment>
            <FormRow
              leftColumn={<div className={classes.fieldName}>To</div>}
              rightColumn={<Account identity={true} address={erc20Tx.to} />}
            />
            <FormRow
              leftColumn={<div className={classes.fieldName}>Amount</div>}
              rightColumn={
                <div data-testid="token-amount">
                  {erc20Tx.value} {coinSymbol}
                </div>
              }
            />
          </React.Fragment>
        )}
        <FormRow
          leftColumn={<div className={classes.fieldName}>Nonce</div>}
          rightColumn={<div data-testid="nonce">{decoded.getNonce()}</div>}
        />
        <FormRow
          leftColumn={<div className={classes.fieldName}>Raw Tx</div>}
          rightColumn={<textarea rows={8} style={{ width: '100%' }} readOnly={true} value={signed} />}
        />
        <FormRow
          rightColumn={
            <ButtonGroup>
              <Button label={'Cancel'} onClick={this.handleCancelClick} />
              <Button label={'Send'} primary={true} onClick={this.handleSendClick} />
            </ButtonGroup>
          }
        />
      </Page>
    );
  }

  private handleCancelClick = (): void => {
    this.props.onCancel();
  };

  private handleSendClick = (): void => {
    this.props.onSendTx(this.props.data);
  };
}

export default connect<{}, DispatchProps>(
  null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    onCancel() {
      dispatch(screen.actions.gotoWalletsScreen());
    },
    onSendTx(data) {
      dispatch(transaction.actions.broadcastTx(data));
    },
  }),
)(withStyles(styles)(BroadcastTxView));
