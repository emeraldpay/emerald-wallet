import { BigAmount } from '@emeraldpay/bigamount';
import { Uuid } from '@emeraldpay/emerald-vault-core';
import { Blockchains, MAX_DISPLAY_ALLOWANCE, TokenAmount, formatAmountPartial } from '@emeraldwallet/core';
import { Allowance, AllowanceType, IState, accounts, allowance, screen } from '@emeraldwallet/store';
import { Address, Button } from '@emeraldwallet/ui';
import { ButtonGroup, Tooltip, Typography, createStyles, makeStyles } from '@material-ui/core';
import {
  AccountCircle as AccountIcon,
  Create as AllowIcon,
  RemoveCircleOutline as AllowedForIcon,
  AddCircleOutline as ApprovedByIcon,
  DeveloperBoard as ContractIcon,
} from '@material-ui/icons';
import * as React from 'react';
import { connect } from 'react-redux';
import { WalletTabs } from './WalletDetails';

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    },
    content: {
      flex: 1,
      overflowY: 'auto',
      padding: theme.spacing(4),
    },
    allowance: {
      columnGap: theme.spacing(2),
      display: 'grid',
      gridTemplateColumns: '28px 2fr 3fr 4fr 2fr',
      '& + &': {
        marginTop: theme.spacing(2),
      },
    },
    allowanceIcon: {
      verticalAlign: 'middle',
    },
    allowanceAmount: {
      textAlign: 'right',
    },
    allowanceAmountValue: {
      display: 'inline-block',
      maxWidth: 120,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      verticalAlign: 'bottom',
    },
    allowanceAddress: {
      alignItems: 'center',
      display: 'flex',
    },
    allowanceAddressIcon: {
      marginRight: 5,
    },
    allowanceActions: {
      display: 'flex',
      justifyContent: 'end',
    },
    actions: {
      display: 'flex',
      justifyContent: 'end',
      borderTop: `1px solid ${theme.palette.divider}`,
      padding: theme.spacing(2),
    },
  }),
);

interface OwnProps {
  walletId: Uuid;
}

interface StateProps {
  allowances: Allowance[];
  hasBalances: boolean;
}

interface DispatchProps {
  gotoApprove(initialAllowance?: Allowance): void;
}

const WalletAllowance: React.FC<OwnProps & StateProps & DispatchProps> = ({ allowances, hasBalances, gotoApprove }) => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {allowances.length > 0 ? (
          allowances.map((item) => {
            const { blockchain, allowance, available, spenderAddress, token, type } = item;

            const [allowanceValue, allowanceUnit] = formatAmountPartial(allowance);
            const [availableValue, availableUnit] = formatAmountPartial(available);

            return (
              <div key={`${blockchain}-${spenderAddress}-${token.address}`} className={styles.allowance}>
                <Typography color="textPrimary" variant="subtitle1">
                  {type === AllowanceType.ALLOWED_FOR ? (
                    <AllowedForIcon className={styles.allowanceIcon} />
                  ) : (
                    <ApprovedByIcon className={styles.allowanceIcon} />
                  )}
                </Typography>
                <div>
                  <Typography color="textPrimary" variant="subtitle1">
                    {token.name}
                  </Typography>
                  <Typography variant="caption">
                    {Blockchains[blockchain].getTitle()} {token.type}
                  </Typography>
                </div>
                <div className={styles.allowanceAmount}>
                  <Typography color="textPrimary" variant="subtitle1">
                    <Tooltip title={`${allowanceValue} ${allowanceUnit}`}>
                      {allowance.number.isGreaterThanOrEqualTo(MAX_DISPLAY_ALLOWANCE) ? (
                        <span>&infin; {allowanceUnit}</span>
                      ) : (
                        <span>
                          <span className={styles.allowanceAmountValue}>{allowanceValue}</span> {allowanceUnit}
                        </span>
                      )}
                    </Tooltip>
                  </Typography>
                  <Typography variant="caption">
                    <Tooltip title={`${availableValue} ${availableUnit}`}>
                      <span>
                        <span className={styles.allowanceAmountValue}>{availableValue}</span> {availableUnit}
                      </span>
                    </Tooltip>
                  </Typography>
                </div>
                <div>
                  <div className={styles.allowanceAddress}>
                    {type === AllowanceType.ALLOWED_FOR ? (
                      <>
                        <AccountIcon className={styles.allowanceAddressIcon} color="secondary" />
                        <Address address={spenderAddress} />
                      </>
                    ) : (
                      <>
                        <ContractIcon className={styles.allowanceAddressIcon} color="secondary" />
                        <Address address={token.address} />
                      </>
                    )}
                  </div>
                </div>
                <div className={styles.allowanceActions}>
                  {type === AllowanceType.ALLOWED_FOR ? (
                    <ButtonGroup>
                      <Button
                        primary
                        label="Reset"
                        onClick={() => gotoApprove({ ...item, allowance: token.getAmount(0) })}
                      />
                      <Button primary label="Change" onClick={() => gotoApprove(item)} />
                    </ButtonGroup>
                  ) : (
                    <Button primary label="Transfer" variant="outlined" />
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <Typography color="secondary" variant="body2">
            There are no allowances.
          </Typography>
        )}
      </div>
      {hasBalances && (
        <div className={styles.actions}>
          <Button
            primary
            icon={<AllowIcon />}
            label="Allow for address"
            variant="outlined"
            onClick={() => gotoApprove()}
          />
        </div>
      )}
    </div>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { walletId }) => {
    const wallet = accounts.selectors.findWallet(state, walletId);

    let balances: BigAmount[] = [];

    if (wallet != null) {
      balances = accounts.selectors.getWalletBalances(state, wallet);
    }

    const [hasBalance, hasTokenBalance] = balances.reduce(
      ([hasBalance, hasTokenBalance], balance) => {
        if (TokenAmount.is(balance)) {
          return [hasBalance, hasTokenBalance || balance.isPositive()];
        }

        return [hasBalance || balance.isPositive(), hasTokenBalance];
      },
      [false, false],
    );

    return {
      allowances: allowance.selectors.getEntriesGroupedAllowances(state, wallet?.entries ?? []),
      hasBalances: hasBalance && hasTokenBalance,
    };
  },
  (dispatch, { walletId }) => ({
    gotoApprove(initialAllowance) {
      dispatch(
        screen.actions.gotoScreen(
          screen.Pages.CREATE_TX_APPROVE,
          { initialAllowance, walletId },
          { tab: WalletTabs.ALLOWANCE },
          true,
        ),
      );
    },
  }),
)(WalletAllowance);