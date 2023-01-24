import { UnsignedBitcoinTx, Uuid } from '@emeraldpay/emerald-vault-core/lib/types';
import { BlockchainCode } from '@emeraldwallet/core';
import { IState, accounts, hwkey, screen, transaction } from '@emeraldwallet/store';
import { Grid, Theme, Typography, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { connect } from 'react-redux';
import TxSummary from './TxSummary';
import { EmeraldDialogs } from '../../app/screen/Dialog';
import UnlockSeed from '../../create-account/UnlockSeed';

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    unlockRow: {
      paddingTop: theme.spacing(2),
    },
  }),
);

interface OwnProps {
  blockchain: BlockchainCode;
  entryId: Uuid;
  seedId: Uuid;
  tx: UnsignedBitcoinTx;
  onSign(txId: string, raw: string): void;
}

interface StateProps {
  isHardware: boolean;
}

interface DispatchProps {
  sign(password: string): void;
  signHardware(): void;
}

const Sign: React.FC<OwnProps & StateProps & DispatchProps> = ({
  blockchain,
  isHardware,
  seedId,
  tx,
  sign,
  signHardware,
}) => {
  const styles = useStyles();

  React.useEffect(() => {
    if (isHardware) {
      signHardware();
    }
  }, [isHardware]);

  return (
    <Grid container>
      <Grid item xs={12}>
        <TxSummary tx={tx} blockchain={blockchain} />
      </Grid>
      <Grid item xs={1} />
      <Grid item xs={11} className={styles.unlockRow}>
        {isHardware ? (
          <Typography>Please connect and sign with your Ledger Nano X or Nano S.</Typography>
        ) : (
          <UnlockSeed seedId={seedId} onUnlock={sign} />
        )}
      </Grid>
    </Grid>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, ownProps) => ({
    isHardware: accounts.selectors.isHardwareSeed(state, { type: 'id', value: ownProps.seedId }),
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, ownProps) => {
    const onSigned = (txId: string | null, raw: string | null, error?: string): void => {
      if (txId != null && raw != null) {
        ownProps.onSign(txId, raw);
      } else if (error != null) {
        console.error(error);
      } else {
        console.error('Unknown error');
      }

      dispatch(screen.actions.closeDialog());
    };

    return {
      sign(password: string) {
        dispatch(transaction.actions.signBitcoinTransaction(ownProps.entryId, ownProps.tx, password, onSigned));
      },
      signHardware() {
        dispatch(hwkey.actions.setWatch(true));
        dispatch(screen.actions.showDialog(EmeraldDialogs.SIGN_TX));

        const connectHandler = (state: IState): void => {
          if (hwkey.selectors.isWatching(state.hwkey)) {
            if (hwkey.selectors.isBlockchainOpen(state, ownProps.blockchain)) {
              dispatch(hwkey.actions.setWatch(false));
              dispatch(transaction.actions.signBitcoinTransaction(ownProps.entryId, ownProps.tx, 'none', onSigned));
            } else {
              hwkey.triggers.onConnect(connectHandler);
            }
          }
        };

        hwkey.triggers.onConnect(connectHandler);
      },
    };
  },
)(Sign);
