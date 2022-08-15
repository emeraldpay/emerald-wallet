import { BigAmount } from '@emeraldpay/bigamount';
import { Wei } from '@emeraldpay/bigamount-crypto';
import { EthereumEntry, WalletEntry } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, Blockchains, blockchainIdToCode, formatAmount } from '@emeraldwallet/core';
import { IState, accounts, screen, tokens } from '@emeraldwallet/store';
import { CoinAvatar } from '@emeraldwallet/ui';
import { Button, Grid, Theme, Typography, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Alert } from '@material-ui/lab';
import * as React from 'react';
import { Dispatch } from 'react';
import { connect } from 'react-redux';
import AccountBalance from '../../common/Balance';

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    alert: {
      marginBottom: 15,
    },
    alertTitle: {
      fontWeight: 'bold',
      marginBottom: 10,
    },
    container: {
      border: `0px solid ${theme.palette.divider}`,
      marginBottom: '10px',
    },
    balance: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'end',
    },
    balanceValue: {
      textAlign: 'right',
    },
    balanceSymbol: {
      width: '90px',
      display: 'inline-block',
      textAlign: 'left',
      paddingLeft: '16px',
      opacity: '50%',
    },
  }),
);

interface OwnProps {
  entries: EthereumEntry[];
  walletId: string;
}

interface StateProps {
  balance: Wei;
  blockchainCode: BlockchainCode;
  tokensBalances: BigAmount[];
}

interface DispatchProps {
  gotoConvert(entry: WalletEntry): void;
  gotoRecover(entry: WalletEntry): void;
}

const Component: React.FC<DispatchProps & OwnProps & StateProps> = ({
  entries,
  balance,
  blockchainCode,
  tokensBalances,
  gotoConvert,
  gotoRecover,
}) => {
  const styles = useStyles();

  const accountClasses = {
    root: styles.balance,
    coins: styles.balanceValue,
    coinSymbol: styles.balanceSymbol,
  };

  const [entry] = entries;
  const blockchain = Blockchains[blockchainCode];

  const receiveDisabledTokens = React.useMemo(
    () => tokensBalances.filter((item) => item.isPositive()),
    [tokensBalances],
  );

  return entry.receiveDisabled ? (
    <>
      {(balance.isPositive() || receiveDisabledTokens.length > 0) && (
        <div className={styles.container}>
          <Alert
            action={
              <Button color="inherit" onClick={() => gotoRecover(entry)}>
                Recover
              </Button>
            }
            className={styles.alert}
            severity="warning"
          >
            <div className={styles.alertTitle}>Coins on wrong blockchain</div>
            You have {formatAmount(balance)}
            {receiveDisabledTokens.reduce(
              (carry, item, index, array) =>
                `${carry}${array.length === index + 1 ? ' and ' : ', '}${formatAmount(item)}`,
              '',
            )}{' '}
            on {blockchain.getTitle()} blockchain
          </Alert>
        </div>
      )}
    </>
  ) : (
    <div className={styles.container}>
      <Grid container={true}>
        <Grid container={true}>
          <Grid item={true} xs={1}>
            <CoinAvatar chain={blockchainCode} />
          </Grid>
          <Grid item={true} xs={6}>
            <Typography>{blockchain.getTitle()}</Typography>
          </Grid>
          <Grid item={true} xs={5}>
            <AccountBalance key="main" classes={accountClasses} balance={balance} />
            {tokensBalances.map((token) => (
              <AccountBalance
                key={'token-' + token.units.top.code}
                classes={accountClasses}
                balance={token}
                onConvert={token.units.top.code === 'WETH' ? () => gotoConvert(entry) : undefined}
              />
            ))}
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, ownProps) => {
    const { entries } = ownProps;
    const [entry] = entries;

    const blockchainCode = blockchainIdToCode(entry.blockchain);
    const zeroAmount = accounts.selectors.zeroAmountFor<Wei>(blockchainCode);

    const balance = entries.reduce(
      (carry, item) => carry.plus(accounts.selectors.getBalance(state, item.id, zeroAmount) ?? zeroAmount),
      zeroAmount,
    );

    const tokensBalances = entries.reduce<Array<BigAmount>>((carry, item) => {
      if (item.address == null) {
        return carry;
      }

      const balances = tokens.selectors.selectBalances(state, item.address.value, blockchainCode) ?? [];

      if (carry.length === 0) {
        return balances;
      }

      return carry.map((balance) => {
        const tokenBalance = balances.find((balanceItem) => balanceItem.units.equals(balance.units));

        if (tokenBalance == null) {
          return balance;
        }

        return balance.plus(tokenBalance);
      });
    }, []);

    return {
      balance,
      blockchainCode,
      tokensBalances,
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: Dispatch<any>) => ({
    gotoConvert(entry) {
      dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX_CONVERT, entry));
    },
    gotoRecover(entry) {
      dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX_RECOVER, entry));
    },
  }),
)(Component);
