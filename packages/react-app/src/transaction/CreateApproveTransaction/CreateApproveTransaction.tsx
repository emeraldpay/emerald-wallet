import { EthereumEntry, Uuid, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import {
  MAX_DISPLAY_ALLOWANCE,
  TokenRegistry,
  amountFactory,
  blockchainIdToCode,
  formatAmount,
  workflow,
} from '@emeraldwallet/core';
import { Allowance, IState, SignData, accounts, screen, transaction } from '@emeraldwallet/store';
import { Back, Button, ButtonGroup, FormLabel, FormRow, Page, PasswordInput } from '@emeraldwallet/ui';
import { Typography, createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';
import { connect } from 'react-redux';
import WaitLedger from '../../ledger/WaitLedger';
import SetupApproveTransaction, { EntryBalances } from './SetupApproveTransaction';

const useStyles = makeStyles(
  createStyles({
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      width: '100%',
    },
  }),
);

enum Stages {
  SETUP = 'setup',
  SIGN = 'sign',
}

interface OwnProps {
  initialAllowance?: Allowance;
  walletId: Uuid;
}

interface StateProps {
  balances: EntryBalances;
  entries: EthereumEntry[];
  tokenRegistry: TokenRegistry;
  detectHardware(entry: EthereumEntry): boolean;
}

interface DispatchProps {
  checkGlobalKey(password: string): Promise<boolean>;
  goBack(): void;
  signTx(entry: EthereumEntry, tx: workflow.CreateErc20ApproveTx, password?: string): Promise<void>;
}

const CreateApproveTransaction: React.FC<OwnProps & StateProps & DispatchProps> = ({
  balances,
  entries,
  initialAllowance,
  tokenRegistry,
  checkGlobalKey,
  detectHardware,
  goBack,
  signTx,
}) => {
  const styles = useStyles();

  const [stage, setStage] = React.useState(Stages.SETUP);

  const [approveTx, setApproveTx] = React.useState<workflow.Erc20ApproveTxDetails | undefined>();
  const [entry, setEntry] = React.useState<EthereumEntry | undefined>();

  const isHardware = React.useMemo(() => (entry == null ? false : detectHardware(entry)), [entry, detectHardware]);

  const [password, setPassword] = React.useState<string | undefined>();
  const [passwordError, setPasswordError] = React.useState<string | undefined>();

  const onCreateTx = (entry: EthereumEntry, tx: workflow.Erc20ApproveTxDetails): void => {
    setApproveTx(tx);
    setEntry(entry);

    setStage(Stages.SIGN);
  };

  const onSignTransaction = async (): Promise<void> => {
    setPasswordError(undefined);

    if (approveTx == null || entry == null) {
      return;
    }

    const tx = workflow.CreateErc20ApproveTx.fromPlain(approveTx);

    if (isHardware) {
      await signTx(entry, tx);
    } else {
      if (password == null) {
        return;
      }

      const passed = await checkGlobalKey(password);

      if (passed) {
        await signTx(entry, tx, password);
      } else {
        setPasswordError('Incorrect password');
      }
    }
  };

  const tx = approveTx == null ? undefined : workflow.CreateErc20ApproveTx.fromPlain(approveTx);

  return (
    <Page title="Create Approve Transaction" leftIcon={<Back onClick={goBack} />}>
      {entries.length > 0 ? (
        <>
          {stage === Stages.SETUP && (
            <SetupApproveTransaction
              balances={balances}
              entries={entries}
              initialAllowance={initialAllowance}
              tokenRegistry={tokenRegistry}
              goBack={goBack}
              onCreateTx={onCreateTx}
            />
          )}
          {stage === Stages.SIGN && tx != null && (
            <>
              <FormRow>
                <FormLabel />
                <Typography>
                  Allow {tx.allowFor} to use{' '}
                  {tx.amount.number.isGreaterThanOrEqualTo(MAX_DISPLAY_ALLOWANCE) ? (
                    <>&infin; {tx.amount.getOptimalUnit().code}</>
                  ) : (
                    formatAmount(tx.amount, 6)
                  )}
                  , transaction fee {formatAmount(tx.getFees(), 6)}
                </Typography>
              </FormRow>
              {isHardware ? (
                <WaitLedger fullSize blockchain={tx.blockchain} onConnected={() => onSignTransaction()} />
              ) : (
                <FormRow>
                  <FormLabel>Password</FormLabel>
                  <PasswordInput error={passwordError} onChange={setPassword} onPressEnter={onSignTransaction} />
                </FormRow>
              )}
              <FormRow last>
                <FormLabel />
                <ButtonGroup classes={{ container: styles.buttons }}>
                  <Button label="Cancel" onClick={goBack} />
                  {!isHardware && (
                    <Button
                      primary
                      disabled={(password?.length ?? 0) === 0}
                      label="Sign Transaction"
                      onClick={onSignTransaction}
                    />
                  )}
                </ButtonGroup>
              </FormRow>
            </>
          )}
        </>
      ) : (
        <Typography color="secondary" variant="body2">
          There are no entries with enough balances.
        </Typography>
      )}
    </Page>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { walletId }) => {
    const tokenRegistry = new TokenRegistry(state.application.tokens);

    let entries =
      accounts.selectors
        .findWallet(state, walletId)
        ?.entries.filter(
          (entry): entry is EthereumEntry =>
            isEthereumEntry(entry) &&
            !entry.receiveDisabled &&
            tokenRegistry.hasAnyToken(blockchainIdToCode(entry.blockchain)),
        ) ?? [];

    const balances = entries.reduce<EntryBalances>(
      (carry, entry) => ({
        ...carry,
        [entry.id]: accounts.selectors.getBalance(
          state,
          entry.id,
          amountFactory(blockchainIdToCode(entry.blockchain))(0),
        ),
      }),
      {},
    );

    entries = entries.filter((entry) => balances[entry.id].isPositive());

    return {
      balances,
      entries,
      tokenRegistry,
      detectHardware(entry) {
        const wallet = accounts.selectors.findWalletByEntryId(state, entry.id);

        if (wallet != null) {
          const [account] = wallet.reserved ?? [];

          if (account != null) {
            return accounts.selectors.isHardwareSeed(state, { type: 'id', value: account.seedId });
          }
        }

        return false;
      },
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
    async signTx(entry, tx, password) {
      if (tx.allowFor == null || tx.approveBy == null) {
        return;
      }

      const signed: SignData | undefined = await dispatch(
        transaction.actions.signTransaction(entry.id, tx.build(), password),
      );

      if (signed != null) {
        const zeroAmount = amountFactory(blockchainIdToCode(entry.blockchain))(0);

        dispatch(
          screen.actions.gotoScreen(
            screen.Pages.BROADCAST_TX,
            {
              ...signed,
              fee: (tx.maxGasPrice ?? tx.gasPrice ?? zeroAmount).multiply(tx.gas),
            },
            null,
            true,
          ),
        );
      }
    },
  }),
)(CreateApproveTransaction);
