import { SignedMessage } from '@emeraldpay/emerald-vault-core';
import { IState, screen } from '@emeraldwallet/store';
import { Address, Back, Button, ButtonGroup, Page } from '@emeraldwallet/ui';
import { Chip, TextField, createStyles, makeStyles } from '@material-ui/core';
import { clipboard } from 'electron';
import * as React from 'react';
import { connect } from 'react-redux';
import FormField from '../form/FormField';
import FormLabel from '../form/FormLabel';

const useStyles = makeStyles(() =>
  createStyles({
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      width: '100%',
    },
  }),
);

interface OwnProps {
  message: SignedMessage;
  text: string;
  walletId: string;
}

interface DispatchPros {
  goBack(): void;
}

const ShowMessage: React.FC<OwnProps & DispatchPros> = ({ message, text, goBack }) => {
  const styles = useStyles();

  const onCopySignature = (): void => {
    clipboard.writeText(message.signature);
  };

  return (
    <Page title="Sign Message" leftIcon={<Back onClick={goBack} />}>
      <FormField>
        <FormLabel>Sign With</FormLabel>
        <Address address={message.address} />
      </FormField>
      <FormField>
        <FormLabel>Type</FormLabel>
        <Chip color="primary" label={message.type === 'eip712' ? 'Structured / EIP-712' : 'Unstructured / EIP-191'} />
      </FormField>
      <FormField>
        <FormLabel top>Message</FormLabel>
        <TextField disabled fullWidth multiline maxRows={5} minRows={5} value={text} />
      </FormField>
      <FormField>
        <FormLabel top>Signature</FormLabel>
        <TextField disabled fullWidth multiline maxRows={5} minRows={5} value={message.signature} />
      </FormField>
      <FormField last>
        <FormLabel />
        <ButtonGroup classes={{ container: styles.buttons }}>
          <Button label="Copy Signature" primary={true} onClick={onCopySignature} />
        </ButtonGroup>
      </FormField>
    </Page>
  );
};

export default connect<unknown, DispatchPros, OwnProps, IState>(null, (dispatch, ownProps) => ({
  goBack() {
    dispatch(screen.actions.gotoScreen(screen.Pages.WALLET, ownProps.walletId));
  },
}))(ShowMessage);
