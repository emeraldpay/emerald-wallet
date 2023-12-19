import { WeiAny } from '@emeraldpay/bigamount-crypto';
import { EthereumEntry, Uuid } from '@emeraldpay/emerald-vault-core';
import {
  BlockchainCode,
  Blockchains,
  CurrencyAmount,
  TokenAmount,
  blockchainIdToCode,
  formatAmount,
  isWrappedToken,
} from '@emeraldwallet/core';
import { ConvertedBalance, IState, TxAction, accounts, screen, tokens } from '@emeraldwallet/store';
import { BlockchainAvatar } from '@emeraldwallet/ui';
import { Button, IconButton, Tooltip, Typography, createStyles, makeStyles } from '@material-ui/core';
import { ImportExport as ConvertIcon, ArrowUpward as SendIcon } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import classNames from 'classnames';
import * as React from 'react';
import { Dispatch } from 'react';
import { connect } from 'react-redux';
import { AssetIcon } from '../../../common/AssetIcon';
import Balance from './balance/Balance';
import FiatBalance from './balance/FiatBalance';
import entryStyles from './styles';

const useStyles = makeStyles((theme) =>
  createStyles({
    ...entryStyles(theme),
    alert: {
      marginLeft: theme.spacing(8),
      marginTop: theme.spacing(2),
    },
    alertTitle: {
      fontWeight: 'bold',
      marginBottom: theme.spacing(),
    },
    entryWrapped: {
      marginTop: theme.spacing(),
    },
    entryToken: {
      marginTop: theme.spacing(2),
    },
  }),
);

type TokenBalances = ConvertedBalance<TokenAmount>[];

interface TokenSeparateBalances {
  commonBalances: TokenBalances;
  wrappedBalances: TokenBalances;
}

interface OwnProps {
  entries: EthereumEntry[];
  walletId: Uuid;
}

interface StateProps {
  balance: WeiAny;
  fiatBalance: CurrencyAmount | undefined;
  blockchainCode: BlockchainCode;
  tokenBalances: TokenBalances;
}

interface DispatchProps {
  gotoConvert(): void;
  gotoRecover(): void;
  gotoSend(asset?: string): void;
}

const EthereumEntryItem: React.FC<DispatchProps & OwnProps & StateProps> = ({
  balance,
  blockchainCode,
  fiatBalance,
  tokenBalances,
  entries: [entry],
  gotoConvert,
  gotoRecover,
  gotoSend,
}) => {
  const styles = useStyles();

  const blockchainTitle = Blockchains[blockchainCode].getTitle();

  const receiveDisabledTokens = React.useMemo(
    () => tokenBalances.filter(({ balance }) => balance.isPositive()),
    [tokenBalances],
  );

  if (entry.receiveDisabled) {
    if (balance.isZero() || receiveDisabledTokens.length === 0) {
      return null;
    }

    return (
      <Alert
        action={
          <Button color="inherit" disabled={balance.isZero()} onClick={gotoRecover}>
            Recover
          </Button>
        }
        className={styles.alert}
        severity="warning"
      >
        <div className={styles.alertTitle}>Coins on wrong blockchain</div>
        You have {formatAmount(balance)}
        {receiveDisabledTokens.reduce(
          (carry, { balance }, index, array) =>
            `${carry}${array.length === index + 1 ? ' and ' : ', '}${formatAmount(balance)}`,
          '',
        )}{' '}
        on {blockchainTitle} blockchain.
        {balance.isZero() ? " Unfortunately you can't recovery them without positive balance." : null}
      </Alert>
    );
  }

  const { commonBalances: tokenCommonBalances, wrappedBalances: tokenWrappedBalances } =
    tokenBalances.reduce<TokenSeparateBalances>(
      (carry, tokenBalance) => {
        if (isWrappedToken(tokenBalance.balance.token)) {
          carry.wrappedBalances.push(tokenBalance);
        } else if (tokenBalance.balance.isPositive()) {
          carry.commonBalances.push(tokenBalance);
        }

        return carry;
      },
      {
        commonBalances: [],
        wrappedBalances: [],
      },
    );

  const buttonClasses = { root: styles.button, disabled: styles.buttonDisabled };

  return (
    <>
      <div className={styles.entry}>
        <div className={styles.entryIcon}>
          <BlockchainAvatar blockchain={blockchainCode} />
        </div>
        <div>
          <Typography color="textPrimary" variant="subtitle1">
            {balance.units.top.name}
          </Typography>
          <Typography variant="caption">On {blockchainTitle}</Typography>
        </div>
        <div>
          <Balance balance={balance} />
          {fiatBalance?.isPositive() && <FiatBalance balance={fiatBalance} />}
        </div>
        <div className={styles.entryActions}>
          {tokenWrappedBalances.map(({ balance: wrappedBalance }) => (
            <Tooltip
              key={`convert-${wrappedBalance.token.address}`}
              title={`Convert between ${balance.units.top.name} and ${wrappedBalance.token.name}`}
            >
              <span>
                <IconButton
                  classes={buttonClasses}
                  disabled={balance.isZero()}
                  size="small"
                  onClick={() => gotoConvert()}
                >
                  <ConvertIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          ))}
          <Tooltip title="Send">
            <span>
              <IconButton classes={buttonClasses} disabled={balance.isZero()} size="small" onClick={() => gotoSend()}>
                <SendIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </div>
      </div>
      {tokenWrappedBalances.map(({ balance, fiatBalance }) => {
        const { address } = balance.token;

        return (
          <div key={`balance-${address}`} className={classNames(styles.entry, styles.entryWrapped)}>
            <div />
            <div />
            <div>
              <Balance balance={balance} />
              {fiatBalance?.isPositive() && <FiatBalance balance={fiatBalance} />}
            </div>
            <div />
          </div>
        );
      })}
      {tokenCommonBalances.map(({ balance, fiatBalance }) => {
        const { address } = balance.token;

        return (
          <div key={`balance-${address}`} className={classNames(styles.entry, styles.entryToken)}>
            <AssetIcon asset={address} blockchain={blockchainCode} />
            <div>
              <Typography color="textPrimary" variant="subtitle1">
                {balance.token.name}
              </Typography>
              <Typography variant="caption">On {blockchainTitle}</Typography>
            </div>
            <div>
              <Balance balance={balance} />
              {fiatBalance?.isPositive() && <FiatBalance balance={fiatBalance} />}
            </div>
            <div className={styles.entryActions}>
              <Tooltip title="Send">
                <span>
                  <IconButton
                    classes={buttonClasses}
                    disabled={balance.isZero()}
                    size="small"
                    onClick={() => gotoSend(address)}
                  >
                    <SendIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </div>
          </div>
        );
      })}
    </>
  );
};

function aggregateBalances(balances: TokenAmount[]): TokenAmount[] {
  return balances.reduce<TokenAmount[]>((carry, balance) => {
    const index = carry.findIndex(
      ({ token: { address } }) => address.toLowerCase() === balance.token.address.toLowerCase(),
    );

    if (index > -1) {
      carry[index] = carry[index].plus(balance);
    } else {
      carry.push(balance);
    }

    return carry;
  }, []);
}

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { entries }) => {
    const [entry] = entries;

    const blockchainCode = blockchainIdToCode(entry.blockchain);
    const zeroAmount = accounts.selectors.zeroAmountFor<WeiAny>(blockchainCode);

    const [{ balance, fiatBalance }] = accounts.selectors.withFiatConversion(state, [
      entries.reduce(
        (carry, item) => carry.plus(accounts.selectors.getBalance(state, item.id, zeroAmount)),
        zeroAmount,
      ),
    ]);

    const tokenBalances = accounts.selectors.withFiatConversion(
      state,
      entries.reduce<TokenAmount[]>((carry, { address }) => {
        if (address == null) {
          return carry;
        }

        const balances = tokens.selectors.selectBalances(state, blockchainCode, address.value);

        return aggregateBalances([...carry, ...balances]);
      }, []),
    );

    return { balance, blockchainCode, fiatBalance, tokenBalances };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: Dispatch<any>, { walletId, entries: [entry] }) => ({
    gotoConvert() {
      dispatch(
        screen.actions.gotoScreen(
          screen.Pages.CREATE_TX,
          {
            walletId,
            action: TxAction.CONVERT,
            entry: entry.id,
          },
          null,
          true,
        ),
      );
    },
    gotoRecover() {
      dispatch(
        screen.actions.gotoScreen(
          screen.Pages.CREATE_TX,
          {
            walletId,
            action: TxAction.RECOVERY,
            entryId: entry.id,
          },
          null,
          true,
        ),
      );
    },
    gotoSend(asset) {
      dispatch(
        screen.actions.gotoScreen(
          screen.Pages.CREATE_TX,
          {
            walletId,
            entryId: entry.id,
            initialAsset: asset,
          },
          null,
          true,
        ),
      );
    },
  }),
)(EthereumEntryItem);
