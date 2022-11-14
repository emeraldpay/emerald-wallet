import { EntryId, EntryIdOp } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode } from '@emeraldwallet/core';
import { screen } from '@emeraldwallet/store';
import { Button, ButtonGroup } from '@emeraldwallet/ui';
import { Box, Grid, Theme, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { connect } from 'react-redux';
import RawTx from './RawTx';
import RawTxDetails from './RawTxDetails';

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    buttonsRow: {
      paddingLeft: theme.spacing(),
      paddingTop: theme.spacing(2),
    },
  }),
);

interface OwnProps {
  blockchain: BlockchainCode;
  entryId: EntryId;
  rawTx: string;
  onConfirm(): void;
}

interface DispatchProps {
  onCancel(): void;
}

const Confirm: React.FC<OwnProps & DispatchProps> = ({ entryId, blockchain, rawTx, onCancel, onConfirm }) => {
  const styles = useStyles();

  const [showRaw, setShowRaw] = React.useState(false);

  return (
    <Grid container>
      <Grid item xs={12}>
        <RawTxDetails rawTx={rawTx} entryId={entryId} blockchain={blockchain} />
      </Grid>
      <Grid item xs={12}>
        {showRaw ? (
          <Box>
            <RawTx rawTx={rawTx} />
            <Button label="Hide Raw" variant="text" onClick={() => setShowRaw(false)} />
          </Box>
        ) : (
          <Button label="Show Raw" variant="text" onClick={() => setShowRaw(true)} />
        )}
      </Grid>
      <Grid item xs={12} className={styles.buttonsRow}>
        <ButtonGroup>
          <Button label="Cancel" onClick={onCancel} />
          <Button label="Send" primary onClick={onConfirm} />
        </ButtonGroup>
      </Grid>
    </Grid>
  );
};

export default connect<unknown, DispatchProps, OwnProps>(null, (dispatch, ownProps) => ({
  onCancel() {
    const walletId = EntryIdOp.asOp(ownProps.entryId).extractWalletId();

    dispatch(screen.actions.gotoScreen(screen.Pages.WALLET, walletId));
  },
}))(Confirm);
