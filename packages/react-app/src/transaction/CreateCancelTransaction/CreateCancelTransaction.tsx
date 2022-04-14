import { Wei } from '@emeraldpay/bigamount-crypto';
import { EthereumStoredTransaction } from '@emeraldwallet/core/src/history/IStoredTransaction';
import { accounts, IState, screen, transaction } from '@emeraldwallet/store';
import { Back, Button, ButtonGroup, Page, PasswordInput } from '@emeraldwallet/ui';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { connect } from 'react-redux';
import FormFieldWrapper from '../CreateTx/FormFieldWrapper';
import FormLabel from '../CreateTx/FormLabel/FormLabel';

interface DispatchProps {
  checkGlobalKey(password: string): Promise<boolean>;
  goBack(): void;
  signTransaction(tx: EthereumStoredTransaction, password: string, accountId?: string): Promise<void>;
}

interface OwnProps {
  transaction: EthereumStoredTransaction;
}

interface StateProps {
  accountId?: string;
}

const CreateCancelTransaction: React.FC<DispatchProps & OwnProps & StateProps> = ({
  accountId,
  transaction,
  checkGlobalKey,
  goBack,
  signTransaction,
}) => {
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string>();

  const onSignTransaction = useCallback(async () => {
    setPasswordError(undefined);

    const correctPassword = await checkGlobalKey(password);

    if (correctPassword) {
      await signTransaction(transaction, password, accountId);
    } else {
      setPasswordError('Incorrect password');
    }
  }, [accountId, password, transaction]);

  return (
    <Page title="Cancel Transaction" leftIcon={<Back onClick={goBack} />}>
      <FormFieldWrapper>
        <FormLabel>Password</FormLabel>
        <PasswordInput error={passwordError} minLength={1} onChange={setPassword} />
      </FormFieldWrapper>
      <FormFieldWrapper>
        <FormLabel />
        <ButtonGroup style={{ width: '100%' }}>
          <Button label="Cancel" onClick={goBack} />
          <Button
            label="Sign Transaction"
            disabled={password.length === 0}
            primary={true}
            onClick={onSignTransaction}
          />
        </ButtonGroup>
      </FormFieldWrapper>
    </Page>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, ownProps) => {
    const { blockchain, from } = ownProps.transaction;

    const account = accounts.selectors.findAccountByAddress(state, from, blockchain);

    return { accountId: account?.id };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    checkGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
    goBack() {
      dispatch(screen.actions.goBack());
    },
    async signTransaction(tx, password, accountId) {
      if (accountId == null || tx.to == null) {
        return;
      }

      const gasPrice = new Wei(tx.gasPrice).number;

      const signed = await dispatch(
        transaction.actions.signTransaction(
          accountId,
          tx.blockchain,
          tx.from,
          password,
          tx.from,
          21000,
          new Wei(gasPrice.plus(gasPrice.multipliedBy(0.1))),
          Wei.ZERO,
          '',
          tx.nonce,
        ),
      );

      if (signed) {
        dispatch(screen.actions.gotoScreen(screen.Pages.BROADCAST_TX, signed));
      }
    },
  }),
)(CreateCancelTransaction);
