import { accounts, IState, screen } from '@emeraldwallet/store';
import { Pages } from '@emeraldwallet/store/lib/screen';
import { createStyles, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { connect } from 'react-redux';

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    root: {
      cursor: 'pointer',
      flexGrow: 1,
      fontSize: '16px',
    },
    brandPart: {
      color: theme.palette.primary.main,
      marginRight: '4px',
    },
    productPart: {
      color: theme.palette.secondary.main,
    },
  }),
);

interface Actions {
  checkGlobalKeyIsSet(): Promise<boolean>;
  createWallet(): void;
  goHome(): void;
  goSetGlobalKey(): void;
}

interface StateProps {
  hasWallets: boolean;
}

const Component: React.FC<Actions & StateProps> = ({
  hasWallets,
  checkGlobalKeyIsSet,
  createWallet,
  goHome,
  goSetGlobalKey,
}) => {
  const styles = useStyles();

  const [hasGlobalKey, setHasGlobalKey] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      const globalKeyIsSet = await checkGlobalKeyIsSet();

      setHasGlobalKey(globalKeyIsSet);
    })();
  }, []);

  return (
    <div className={styles.root} onClick={hasGlobalKey ? (hasWallets ? goHome : createWallet) : goSetGlobalKey}>
      <span className={styles.brandPart}>Emerald</span>
      <span className={styles.productPart}>Wallet</span>
    </div>
  );
};

export default connect(
  (state: IState): StateProps => ({
    hasWallets: state.accounts.wallets.length > 0,
  }),
  (dispatch: any): Actions => {
    return {
      checkGlobalKeyIsSet() {
        return dispatch(accounts.actions.isGlobalKeySet());
      },
      createWallet() {
        dispatch(screen.actions.gotoScreen(Pages.CREATE_WALLET));
      },
      goHome() {
        dispatch(screen.actions.gotoScreen(Pages.HOME));
      },
      goSetGlobalKey() {
        dispatch(screen.actions.gotoScreen(Pages.GLOBAL_KEY));
      },
    };
  },
)(Component);
