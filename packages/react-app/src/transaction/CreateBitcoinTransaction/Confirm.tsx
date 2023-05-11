import { EntryId, EntryIdOp } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode } from '@emeraldwallet/core';
import { screen } from '@emeraldwallet/store';
import { Button, ButtonGroup, FormLabel, FormRow } from '@emeraldwallet/ui';
import { createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { connect } from 'react-redux';
import RawTx from './RawTx';
import RawTxDetails from './RawTxDetails';

const useStyles = makeStyles(
  createStyles({
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      width: '100%',
    },
  }),
);

interface OwnProps {
  blockchain: BlockchainCode;
  disabled?: boolean;
  entryId: EntryId;
  rawTx: string;
  onConfirm(): void;
}

interface DispatchProps {
  onCancel(): void;
}

const Confirm: React.FC<OwnProps & DispatchProps> = ({
  entryId,
  blockchain,
  rawTx,
  onCancel,
  onConfirm,
  disabled = false,
}) => {
  const styles = useStyles();

  const [showRaw, setShowRaw] = React.useState(false);

  return (
    <>
      <RawTxDetails rawTx={rawTx} entryId={entryId} blockchain={blockchain} />
      {showRaw ? (
        <>
          <FormRow>
            <FormLabel top>Raw Tx</FormLabel>
            <RawTx rawTx={rawTx} />
          </FormRow>
          <FormRow>
            <FormLabel />
            <Button label="Hide Raw" variant="outlined" onClick={() => setShowRaw(false)} />
          </FormRow>
        </>
      ) : (
        <FormRow>
          <FormLabel>Raw Tx</FormLabel>
          <Button label="Show Raw" variant="outlined" onClick={() => setShowRaw(true)} />
        </FormRow>
      )}
      <FormRow last>
        <ButtonGroup classes={{ container: styles.buttons }}>
          <Button label="Cancel" onClick={onCancel} />
          <Button label="Send" primary disabled={disabled} onClick={onConfirm} />
        </ButtonGroup>
      </FormRow>
    </>
  );
};

export default connect<unknown, DispatchProps, OwnProps>(null, (dispatch, ownProps) => ({
  onCancel() {
    const walletId = EntryIdOp.asOp(ownProps.entryId).extractWalletId();

    dispatch(screen.actions.gotoScreen(screen.Pages.WALLET, walletId));
  },
}))(Confirm);
