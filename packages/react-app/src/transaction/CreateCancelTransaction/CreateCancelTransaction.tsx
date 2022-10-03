import { Wei } from '@emeraldpay/bigamount-crypto';
import { EthereumTransaction } from '@emeraldwallet/core';
import { accounts, IState, screen, transaction } from '@emeraldwallet/store';
import { SignData } from '@emeraldwallet/store/lib/transaction/actions';
import { Back, Button, ButtonGroup, Page, PasswordInput } from '@emeraldwallet/ui';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { connect } from 'react-redux';
import FormFieldWrapper from '../CreateTx/FormFieldWrapper';
import FormLabel from '../CreateTx/FormLabel/FormLabel';

interface DispatchProps {
  checkGlobalKey(password: string): Promise<boolean>;
  goBack(): void;
  signTransaction(tx: EthereumTransaction, password: string, accountId?: string): Promise<void>;
}

interface OwnProps {
  transaction: EthereumTransaction;
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
        <PasswordInput error={passwordError} onChange={setPassword} />
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

      const oldGasPrice = new Wei(tx.maxGasPrice ?? tx.gasPrice ?? 0).number;
      const cancelGasPrice = new Wei(oldGasPrice.plus(oldGasPrice.multipliedBy(0.1)));

      let gasPrice: Wei | undefined;
      let maxGasPrice: Wei | undefined;
      let priorityGasPrice: Wei | undefined;

      if (tx.gasPrice == null) {
        maxGasPrice = cancelGasPrice;
        priorityGasPrice = new Wei(tx.priorityGasPrice ?? 0);
      } else {
        gasPrice = cancelGasPrice;
      }

      const signed: SignData | undefined = await dispatch(
        transaction.actions.signTransaction(
          accountId,
          tx.blockchain,
          tx.from,
          password,
          tx.from,
          21000,
          Wei.ZERO,
          '',
          gasPrice,
          maxGasPrice,
          priorityGasPrice,
          tx.nonce,
        ),
      );

      if (signed != null) {
        dispatch(
          screen.actions.gotoScreen(
            screen.Pages.BROADCAST_TX,
            {
              ...signed,
              fee: (maxGasPrice ?? gasPrice ?? Wei.ZERO).multiply(21000),
              originalAmount: Wei.ZERO,
            },
            null,
            true,
          ),
        );
      }
    },
  }),
)(CreateCancelTransaction);
