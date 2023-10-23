import { AddressRole, BitcoinEntry, CurrentAddress, EntryId } from '@emeraldpay/emerald-vault-core';
import { InputUtxo, workflow } from '@emeraldwallet/core';
import { IState, accounts } from '@emeraldwallet/store';
import { Box, CircularProgress, Grid, Typography } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import * as React from 'react';
import { connect } from 'react-redux';
import { BroadcastTransaction } from './BroadcastTransaction';
import { SetupTransaction } from './SetupTransaction';
import { SignTransaction } from './SignTransaction';

enum Stage {
  SETUP = 'setup',
  SIGN = 'sign',
  BROADCAST = 'broadcast',
}

interface OwnProps {
  entry: BitcoinEntry;
  onCancel(): void;
}

interface StateProps {
  utxo: InputUtxo[];
}

interface DispatchProps {
  getXPubPositionalAddress(entryId: EntryId, xPub: string, role: AddressRole): Promise<CurrentAddress>;
}

const CreateBitcoinTransaction: React.FC<OwnProps & StateProps & DispatchProps> = ({
  entry,
  utxo,
  getXPubPositionalAddress,
  onCancel,
}) => {
  const mounted = React.useRef(true);

  const [stage, setStage] = React.useState(Stage.SETUP);

  const [creator, setCreator] = React.useState<workflow.CreateBitcoinTx | undefined>();

  const [currentTxId, setCurrentTxId] = React.useState<string | undefined>();
  const [currentSignedTx, setCurrentSignedTx] = React.useState<string | undefined>();

  const handleTransactionSign = (txId: string, signedTx: string): void => {
    setCurrentTxId(txId);
    setCurrentSignedTx(signedTx);

    setStage(Stage.BROADCAST);
  };

  React.useEffect(
    () => {
      Promise.all(
        entry.xpub
          .filter(({ role }) => role === 'change')
          .map(({ role, xpub }) => getXPubPositionalAddress(entry.id, xpub, role)),
      ).then(([{ address }]) => {
        if (mounted.current) {
          setCreator(new workflow.CreateBitcoinTx(entry, address, utxo));
        }
      });

      return () => {
        mounted.current = false;
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  if (creator == null) {
    return (
      <Box mt={2}>
        <Grid container alignItems="center" justifyContent="center">
          <Grid item>
            <Box pr={1}>
              <CircularProgress size={16} />
            </Box>
          </Grid>
          <Grid item>
            <Typography>Initializing...</Typography>
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <>
      {stage === Stage.SETUP && (
        <SetupTransaction entry={entry} creator={creator} onCancel={onCancel} onCreate={() => setStage(Stage.SIGN)} />
      )}
      {stage === Stage.SIGN && (
        <SignTransaction entry={entry} unsigned={creator.create()} onCancel={onCancel} onSign={handleTransactionSign} />
      )}
      {stage === Stage.BROADCAST &&
        (currentSignedTx == null || currentTxId == null ? (
          <Alert severity="warning">Can&apos;t broadcast unsigned transaction!</Alert>
        ) : (
          <BroadcastTransaction
            entry={entry}
            signed={currentSignedTx}
            txId={currentTxId}
            unsigned={creator.create()}
            onCancel={onCancel}
          />
        ))}
    </>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { entry }) => ({
    utxo: accounts.selectors.getUtxo(state, entry.id),
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    getXPubPositionalAddress(entryId, xPub, role) {
      return dispatch(accounts.actions.getXPubPositionalAddress(entryId, xPub, role));
    },
  }),
)(CreateBitcoinTransaction);
