import { Wei } from '@emeraldpay/bigamount-crypto';
import { DEFAULT_GAS_LIMIT, EthereumTransaction, EthereumTransactionType, amountFactory } from '@emeraldwallet/core';
import { IState, SignData, accounts, screen, transaction } from '@emeraldwallet/store';
import { Back, Button, ButtonGroup, FormLabel, FormRow, Page, PasswordInput } from '@emeraldwallet/ui';
import { createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';
import { useCallback, useState } from 'react';
import { connect } from 'react-redux';
import WaitLedger from '../../ledger/WaitLedger';

const useStyles = makeStyles(
  createStyles({
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      width: '100%',
    },
  }),
);

interface DispatchProps {
  checkGlobalKey(password: string): Promise<boolean>;
  goBack(): void;
  signTransaction(tx: EthereumTransaction, entryId?: string, password?: string): Promise<void>;
}

interface OwnProps {
  transaction: EthereumTransaction;
}

interface StateProps {
  entryId?: string;
  isHardware: boolean;
}

const CreateCancelTransaction: React.FC<DispatchProps & OwnProps & StateProps> = ({
  entryId,
  isHardware,
  transaction,
  checkGlobalKey,
  goBack,
  signTransaction,
}) => {
  const styles = useStyles();

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string>();

  const onSignTransaction = useCallback(async () => {
    setPasswordError(undefined);

    if (isHardware) {
      await signTransaction(transaction, entryId);
    } else {
      const correctPassword = await checkGlobalKey(password);

      if (correctPassword) {
        await signTransaction(transaction, entryId, password);
      } else {
        setPasswordError('Incorrect password');
      }
    }
  }, [entryId, isHardware, password, transaction, checkGlobalKey, signTransaction]);

  return (
    <Page title="Cancel Transaction" leftIcon={<Back onClick={goBack} />}>
      {isHardware ? (
        <WaitLedger fullSize blockchain={transaction.blockchain} onConnected={() => onSignTransaction()} />
      ) : (
        <FormRow>
          <FormLabel>Password</FormLabel>
          <PasswordInput error={passwordError} onChange={setPassword} />
        </FormRow>
      )}
      <FormRow last>
        <FormLabel />
        <ButtonGroup classes={{ container: styles.buttons }}>
          <Button label="Cancel" onClick={goBack} />
          {!isHardware && (
            <Button
              label="Sign Transaction"
              disabled={password.length === 0}
              primary={true}
              onClick={onSignTransaction}
            />
          )}
        </ButtonGroup>
      </FormRow>
    </Page>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { transaction: { blockchain, from } }) => {
    const entry = accounts.selectors.findAccountByAddress(state, from, blockchain);

    let isHardware = false;

    if (entry != null) {
      const wallet = accounts.selectors.findWalletByEntryId(state, entry.id);

      if (wallet != null) {
        const [account] = wallet.reserved ?? [];

        if (account != null) {
          isHardware = accounts.selectors.isHardwareSeed(state, { type: 'id', value: account.seedId });
        }
      }
    }

    return {
      isHardware,
      entryId: entry?.id,
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any) => ({
    checkGlobalKey(password) {
      return dispatch(accounts.actions.verifyGlobalKey(password));
    },
    goBack() {
      dispatch(screen.actions.goBack());
    },
    async signTransaction(tx, password, entryId) {
      if (entryId == null || tx.to == null) {
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
          entryId,
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
