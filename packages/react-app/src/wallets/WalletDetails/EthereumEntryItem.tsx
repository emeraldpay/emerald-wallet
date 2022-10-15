import { BigAmount } from '@emeraldpay/bigamount';
import { Wei } from '@emeraldpay/bigamount-crypto';
import { EthereumEntry, WalletEntry } from '@emeraldpay/emerald-vault-core';
import {
  BlockchainCode,
  Blockchains,
  ConvertableTokenCode,
  blockchainIdToCode,
  formatAmount,
  isConvertableToken,
} from '@emeraldwallet/core';
import { IState, accounts, screen, tokens } from '@emeraldwallet/store';
import { CoinAvatar } from '@emeraldwallet/ui';
import { Button, Typography, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Alert } from '@material-ui/lab';
import * as React from 'react';
import { Dispatch } from 'react';
import { connect } from 'react-redux';
import AccountBalance from '../../common/Balance';

const useStyles = makeStyles((theme) =>
  createStyles({
    alert: {
      marginBottom: theme.spacing(2),
    },
    alertTitle: {
      fontWeight: 'bold',
      marginBottom: theme.spacing(),
    },
    container: {
      alignItems: 'start',
      display: 'flex',
      marginBottom: theme.spacing(2),
    },
    icon: {
      marginRight: theme.spacing(),
    },
    title: {
      alignItems: 'center',
      display: 'flex',
      flex: '1 1 auto',
      height: theme.spacing(4),
    },
    balances: {
      marginLeft: theme.spacing(),
    },
    balance: {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'end',
    },
    balanceValue: {
      textAlign: 'right',
    },
    balanceSymbol: {
      display: 'inline-block',
      opacity: '50%',
      paddingLeft: 16,
      textAlign: 'left',
      width: 100,
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
  gotoConvert(entry: WalletEntry, token: ConvertableTokenCode): void;
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

  const classes = {
    coins: styles.balanceValue,
    coinSymbol: styles.balanceSymbol,
    root: styles.balance,
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
      <div className={styles.icon}>
        <CoinAvatar blockchain={blockchainCode} />
      </div>
      <div className={styles.title}>
        <Typography>{blockchain.getTitle()}</Typography>
      </div>
      <div className={styles.balances}>
        <AccountBalance key="main" classes={classes} balance={balance} />
        {tokensBalances.map((token) => {
          const { code } = token.units.top;

          return (
            <AccountBalance
              key={'token-' + token.units.top.code}
              classes={classes}
              balance={token}
              onConvert={isConvertableToken(code) ? () => gotoConvert(entry, code) : undefined}
            />
          );
        })}
      </div>
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

      const balances = tokens.selectors.selectBalances(state, blockchainCode, item.address.value) ?? [];

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
    gotoConvert(entry, token) {
      dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX_CONVERT, { entry, token }, null, true));
    },
    gotoRecover(entry) {
      dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX_RECOVER, entry, null, true));
    },
  }),
)(Component);
