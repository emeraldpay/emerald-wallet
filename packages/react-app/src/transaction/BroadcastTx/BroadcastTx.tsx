import { Wei } from '@emeraldpay/bigamount-crypto';
import { Blockchains, EthereumTx, TokenRegistry, decodeData, toNumber } from '@emeraldwallet/core';
import { BroadcastData, IState, screen, transaction } from '@emeraldwallet/store';
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

interface StateProps {
  tokenRegistry: TokenRegistry;
}

interface DispatchProps {
  onCancel(): void;
  onSendTx(data: BroadcastData): void;
}

interface StylesProps {
  classes: Record<keyof typeof styles, string>;
}

class BroadcastTx extends React.Component<OwnProps & StateProps & DispatchProps & StylesProps> {
  public render(): React.ReactElement {
    const {
      classes,
      data: { blockchain, signed },
      tokenRegistry,
    } = this.props;

    const chain = Blockchains[blockchain];
    const decoded = EthereumTx.fromRaw(signed, chain.params.chainId);
    const data = decoded.getData();

    let coinSymbol: string = chain.params.coinTicker;

    let txTo: string | null = null;
    let txValue: string | null = null;

    if (data.length > 0) {
      const decodedData = decodeData(data);

      if (decodedData.inputs.length > 1) {
        const tokenData = tokenRegistry.byAddress(chain.params.code, decoded.getRecipientAddress().toString());
        const tokenUnit = tokenData.getUnits().top;

        coinSymbol = tokenUnit.code;

        const [to, amount] = decodedData.inputs;

        txTo = to.toString(16);
        txValue = tokenData.getAmount(amount).getNumberByUnit(tokenUnit).toString();
      }
    }

    const wei = new Wei(toNumber(decoded.getValue()));

    return (
      <Page title={<ChainTitle chain={blockchain} text="Publish Transaction" />}>
        <FormRow
          leftColumn={<div className={classes.fieldName}>From</div>}
          rightColumn={<Account identity={true} address={decoded.getSenderAddress().toString()} />}
        />
        {txTo === null ? (
          <React.Fragment>
            <FormRow
              leftColumn={<div className={classes.fieldName}>To</div>}
              rightColumn={<Account identity={true} address={decoded.getRecipientAddress().toString()} />}
            />
            <FormRow
              leftColumn={<div className={classes.fieldName}>Amount</div>}
              rightColumn={
                <div data-testid="token-amount">
                  {wei.toEther()} {coinSymbol}
                </div>
              }
            />
          </React.Fragment>
        ) : (
          <React.Fragment>
            <FormRow
              leftColumn={<div className={classes.fieldName}>To</div>}
              rightColumn={<Account identity={true} address={txTo} />}
            />
            <FormRow
              leftColumn={<div className={classes.fieldName}>Amount</div>}
              rightColumn={
                <div data-testid="token-amount">
                  {txValue} {coinSymbol}
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

export default connect<StateProps, DispatchProps, unknown, IState>(
  (state) => ({
    tokenRegistry: new TokenRegistry(state.application.tokens),
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    onCancel() {
      dispatch(screen.actions.gotoWalletsScreen());
    },
    onSendTx(data) {
      dispatch(transaction.actions.broadcastTx(data));
    },
  }),
)(withStyles(styles)(BroadcastTx));
