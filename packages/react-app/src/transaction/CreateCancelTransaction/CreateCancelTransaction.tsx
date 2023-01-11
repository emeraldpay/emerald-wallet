import { Wei } from '@emeraldpay/bigamount-crypto';
import { DEFAULT_GAS_LIMIT, EthereumTransaction, EthereumTransactionType, amountFactory } from '@emeraldwallet/core';
import { IState, SignData, accounts, screen, transaction } from '@emeraldwallet/store';
import { Back, Button, ButtonGroup, Page, PasswordInput } from '@emeraldwallet/ui';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { connect } from 'react-redux';
import FormField from '../../form/FormField';
import FormLabel from '../../form/FormLabel';

interface DispatchProps {
  checkGlobalKey(password: string): Promise<boolean>;
  goBack(): void;
  signTransaction(tx: EthereumTransaction, accountId?: string, password?: string): Promise<void>;
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
      await signTransaction(transaction, accountId, password);
    } else {
      setPasswordError('Incorrect password');
    }
  }, [accountId, password, transaction, checkGlobalKey, signTransaction]);

  return (
    <Page title="Cancel Transaction" leftIcon={<Back onClick={goBack} />}>
      <FormField>
        <FormLabel>Password</FormLabel>
        <PasswordInput error={passwordError} onChange={setPassword} />
      </FormField>
      <FormField>
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
      </FormField>
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

      if (tx.type === EthereumTransactionType.EIP1559) {
        maxGasPrice = cancelGasPrice;
        priorityGasPrice = new Wei(tx.priorityGasPrice ?? 0);
      } else {
        gasPrice = cancelGasPrice;
      }

      const signed: SignData | undefined = await dispatch(
        transaction.actions.signTransaction(
          accountId,
          {
            ...tx,
            data: '',
            gas: DEFAULT_GAS_LIMIT,
            gasPrice: gasPrice?.number,
            maxGasPrice: maxGasPrice?.number,
            priorityGasPrice: priorityGasPrice?.number,
            value: amountFactory(tx.blockchain)(0).number,
          },
          password,
        ),
      );

      if (signed != null) {
        dispatch(
          screen.actions.gotoScreen(
            screen.Pages.BROADCAST_TX,
            {
              ...signed,
              fee: (maxGasPrice ?? gasPrice ?? Wei.ZERO).multiply(DEFAULT_GAS_LIMIT),
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
