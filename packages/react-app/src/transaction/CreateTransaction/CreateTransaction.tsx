import { EntryId, Uuid } from '@emeraldpay/emerald-vault-core';
import { Allowance, CreateTxStage, IState, StoredTransaction, TxAction, screen, txStash } from '@emeraldwallet/store';
import { Back, Page } from '@emeraldwallet/ui';
import * as React from 'react';
import { connect } from 'react-redux';
import { BroadcastTransaction } from './BroadcastTransaction';
import { SetupTransaction } from './SetupTransaction';
import { SignTransaction } from './SignTransaction';

interface OwnProps {
  action?: TxAction;
  entryId?: EntryId;
  initialAllowance?: Allowance;
  initialAsset?: string;
  storedTx?: StoredTransaction;
  walletId?: Uuid;
}

interface StateProps {
  stage: CreateTxStage;
}

interface DispatchProps {
  goBack(): void;
  reset(): void;
}

const CreateTransaction: React.FC<OwnProps & StateProps & DispatchProps> = ({ stage, goBack, reset, ...props }) => {
  React.useEffect(
    () => {
      return () => {
        reset();
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <Page leftIcon={<Back onClick={goBack} />} title="Create Transaction">
      {stage === CreateTxStage.SETUP && <SetupTransaction {...props} onCancel={goBack} />}
      {stage === CreateTxStage.SIGN && <SignTransaction onCancel={goBack} />}
      {stage === CreateTxStage.BROADCAST && <BroadcastTransaction onCancel={goBack} />}
    </Page>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state) => ({ stage: txStash.selectors.getStage(state) }),
  (dispatch) => ({
    goBack() {
      dispatch(screen.actions.goBack());
    },
    reset() {
      dispatch(txStash.actions.reset());
    },
  }),
)(CreateTransaction);
