import { SignedMessage } from '@emeraldpay/emerald-vault-core';
import { IState, screen } from '@emeraldwallet/store';
import { Address, Back, Button, ButtonGroup, FormLabel, FormRow, Page } from '@emeraldwallet/ui';
import { Chip, TextField } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { clipboard } from 'electron';
import * as React from 'react';
import { connect } from 'react-redux';

const useStyles = makeStyles()({
  buttons: {
    display: 'flex',
    justifyContent: 'end',
    width: '100%',
  },
});

interface OwnProps {
  message: SignedMessage;
  text: string;
  walletId: string;
}

interface DispatchPros {
  goBack(): void;
}

const ShowMessage: React.FC<OwnProps & DispatchPros> = ({ message, text, goBack }) => {
  const { classes } = useStyles();

  const onCopySignature = (): void => {
    clipboard.writeText(message.signature);
  };

  return (
    <Page title="Sign Message" leftIcon={<Back onClick={goBack} />}>
      <FormRow>
        <FormLabel>Sign With</FormLabel>
        <Address address={message.address} />
      </FormRow>
      <FormRow>
        <FormLabel>Type</FormLabel>
        <Chip color="primary" label={message.type === 'eip712' ? 'Structured / EIP-712' : 'Unstructured / EIP-191'} />
      </FormRow>
      <FormRow>
        <FormLabel top>Message</FormLabel>
        <TextField disabled fullWidth multiline maxRows={5} minRows={5} value={text} />
      </FormRow>
      <FormRow>
        <FormLabel top>Signature</FormLabel>
        <TextField disabled fullWidth multiline maxRows={5} minRows={5} value={message.signature} />
      </FormRow>
      <FormRow last>
        <ButtonGroup classes={{ container: classes.buttons }}>
          <Button label="Copy Signature" primary={true} onClick={onCopySignature} />
        </ButtonGroup>
      </FormRow>
    </Page>
  );
};

export default connect<unknown, DispatchPros, OwnProps, IState>(null, (dispatch, ownProps) => ({
  goBack() {
    dispatch(screen.actions.gotoScreen(screen.Pages.WALLET, ownProps.walletId));
  },
}))(ShowMessage);
