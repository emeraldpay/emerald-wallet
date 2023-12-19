import { BigAmount } from '@emeraldpay/bigamount';
import { BitcoinEntry, Uuid } from '@emeraldpay/emerald-vault-core';
import { BlockchainCode, Blockchains, CurrencyAmount, blockchainIdToCode } from '@emeraldwallet/core';
import { IState, accounts, screen } from '@emeraldwallet/store';
import { BlockchainAvatar } from '@emeraldwallet/ui';
import { IconButton, Tooltip, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ArrowUpward as SendIcon } from '@material-ui/icons';
import * as React from 'react';
import { Dispatch } from 'react';
import { connect } from 'react-redux';
import Balance from './balance/Balance';
import FiatBalance from './balance/FiatBalance';
import entryStyles from './styles';

const useStyles = makeStyles((theme) => entryStyles(theme));

interface OwnProps {
  entry: BitcoinEntry;
  walletId: Uuid;
}

interface StateProps {
  balance: BigAmount;
  blockchainCode: BlockchainCode;
  fiatBalance: CurrencyAmount | undefined;
}

interface DispatchProps {
  gotoSend(): void;
}

const BitcoinEntryItem: React.FC<OwnProps & StateProps & DispatchProps> = ({
  balance,
  blockchainCode,
  fiatBalance,
  gotoSend,
}) => {
  const styles = useStyles();

  const blockchainTitle = Blockchains[blockchainCode].getTitle();

  const buttonClasses = { root: styles.button, disabled: styles.buttonDisabled };

  return (
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
        <Tooltip title="Send">
          <span>
            <IconButton disabled={balance.isZero()} classes={buttonClasses} size="small" onClick={gotoSend}>
              <SendIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </div>
    </div>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state, { entry }) => {
    const blockchainCode = blockchainIdToCode(entry.blockchain);

    const [{ balance, fiatBalance }] = accounts.selectors.withFiatConversion(state, [
      accounts.selectors.getBalance(state, entry.id, accounts.selectors.zeroAmountFor(blockchainCode)),
    ]);

    return { balance, blockchainCode, fiatBalance };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: Dispatch<any>, { entry, walletId }) => ({
    gotoSend() {
      dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX, { walletId, entryId: entry.id }, null, true));
    },
  }),
)(BitcoinEntryItem);
