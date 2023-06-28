import { Wei } from '@emeraldpay/bigamount-crypto';
import { Blockchains, EthereumTx, TokenRegistry, decodeData, toNumber } from '@emeraldwallet/core';
import { BroadcastData, IState, screen, transaction } from '@emeraldwallet/store';
import { Account, Button, ButtonGroup, FormLabel, FormRow, Page } from '@emeraldwallet/ui';
import { TextField, Typography, WithStyles, createStyles } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { connect } from 'react-redux';
import ChainTitle from '../../common/ChainTitle';

export const styles = createStyles({
  buttons: {
    display: 'flex',
    justifyContent: 'end',
    width: '100%',
  },
  label: {
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

class BroadcastTx extends React.Component<OwnProps & StateProps & DispatchProps & WithStyles<typeof styles>> {
  public render(): React.ReactElement {
    const {
      classes,
      data: { blockchain, signed },
      tokenRegistry,
    } = this.props;

    const { chainId, code, coinTicker } = Blockchains[blockchain].params;
    const decoded = EthereumTx.fromRaw(signed, chainId);
    const data = decoded.getData();

    let coinSymbol: string = coinTicker;

    let txTo: string | null = null;
    let txValue: string | null = null;

    const address = decoded.getRecipientAddress().toString();

    if (data.length > 0) {
      const decodedData = decodeData(data);

      if (decodedData.inputs.length > 1 && tokenRegistry.hasAddress(code, address)) {
        const tokenData = tokenRegistry.byAddress(code, address);
        const tokenUnit = tokenData.getUnits().top;

        coinSymbol = tokenUnit.code;

        const [to, amount] = decodedData.inputs;

        txTo = to.toString(16);
        txValue = tokenData.getAmount(amount).getNumberByUnit(tokenUnit).toString();
      }
    }

    const amount = new Wei(toNumber(decoded.getValue()));

    return (
      <Page title={<ChainTitle blockchain={blockchain} title="Publish Transaction" />}>
        <FormRow>
          <FormLabel>From</FormLabel>
          <Account identity={true} address={decoded.getSenderAddress().toString()} />
        </FormRow>
        {txTo === null ? (
          <>
            <FormRow>
              <FormLabel>To</FormLabel>
              <Account identity={true} address={address} />
            </FormRow>
            <FormRow>
              <FormLabel>Amount</FormLabel>
              <Typography>
                <span data-testid="amount">
                  {amount.toEther()} {coinSymbol}
                </span>
              </Typography>
            </FormRow>
          </>
        ) : (
          <>
            <FormRow>
              <FormLabel>To</FormLabel>
              <Account identity={true} address={txTo} />
            </FormRow>
            <FormRow>
              <FormLabel>Amount</FormLabel>
              <Typography>
                <span data-testid="amount">
                  {txValue} {coinSymbol}
                </span>
              </Typography>
            </FormRow>
          </>
        )}
        <FormRow>
          <FormLabel>Nonce</FormLabel>
          <Typography>
            <span data-testid="nonce">{decoded.getNonce()}</span>
          </Typography>
        </FormRow>
        <FormRow>
          <FormLabel top>Raw Tx</FormLabel>
          <TextField disabled fullWidth multiline maxRows={7} minRows={7} value={signed} />
        </FormRow>
        <FormRow last>
          <ButtonGroup classes={{ container: classes.buttons }}>
            <Button label="Cancel" onClick={this.handleCancelClick} />
            <Button primary label="Send" onClick={this.handleSendClick} />
          </ButtonGroup>
        </FormRow>
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
