import { Uuid } from '@emeraldpay/emerald-vault-core';
import { IState, screen, txhistory } from '@emeraldwallet/store';
import { Back } from '@emeraldwallet/ui';
import { Divider, IconButton, Paper, Tab, Toolbar, Tooltip, createStyles, makeStyles } from '@material-ui/core';
import { ArrowDownward as ReceiveIcon, ArrowUpward as SendIcon } from '@material-ui/icons';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import TxHistory from '../../transactions/TxHistory';
import Addresses from './addresses/Addresses';
import WalletBalance from './WalletBalance';
import WalletMenu from './WalletMenu';
import WalletTitle from './WalletTitle';

export enum WalletTabs {
  BALANCE = '0',
  ADDRESSES = '1',
  TRANSACTIONS = '2',
}

const useStyles = makeStyles((theme) =>
  createStyles({
    container: {
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '100%',
    },
    paper: {
      display: 'flex',
      flex: 1,
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
    },
    tabs: {
      display: 'flex',
      flex: 0,
      justifyContent: 'space-between',
      marginTop: '-10px',
      marginBottom: theme.spacing(2),
    },
    tabPanel: {
      height: '100%',
      overflowY: 'auto',
      padding: 0,
    },
    tabPanelPadding: {
      padding: theme.spacing(4),
    },
    toolbar: {
      justifyContent: 'space-between',
    },
    toolbarButtons: {
      flex: '0 0 auto',
      minWidth: 200,
    },
    toolbarButtonsLeft: {
      marginRight: theme.spacing(),
    },
    toolbarButtonsRight: {
      display: 'flex',
      marginLeft: theme.spacing(),
      justifyContent: 'right',
    },
    toolbarButton: {
      '& + &': {
        marginLeft: theme.spacing(),
      },
    },
  }),
);

interface OwnProps {
  initialTab?: WalletTabs;
  walletId: string;
}

interface StateProps {
  hasOtherWallets: boolean;
}

interface DispatchProps {
  gotoReceive(): void;
  gotoSend(): void;
  gotoWalletsScreen(): void;
  loadTransactions(walletId: Uuid, initial: boolean): Promise<void>;
}

const WalletDetails: React.FC<OwnProps & StateProps & DispatchProps> = ({
  hasOtherWallets,
  initialTab,
  walletId,
  gotoReceive,
  gotoSend,
  gotoWalletsScreen,
  loadTransactions,
}) => {
  const styles = useStyles();

  const currentWallet = React.useRef(walletId);

  const [tab, setTab] = React.useState(initialTab ?? WalletTabs.BALANCE);

  React.useEffect(() => {
    if (currentWallet.current !== walletId) {
      currentWallet.current = walletId;

      setTab(WalletTabs.BALANCE);
    }
  }, [walletId]);

  React.useEffect(() => {
    (async () => {
      await loadTransactions(walletId, true);
    })();
  }, [walletId, loadTransactions]);

  return (
    <div className={styles.container} style={{ height: tab === WalletTabs.TRANSACTIONS ? '100%' : 'auto' }}>
      <TabContext value={tab}>
        <div className={styles.tabs}>
          <TabList indicatorColor="primary" textColor="primary" onChange={(event, selected) => setTab(selected)}>
            <Tab label="Balance" value={WalletTabs.BALANCE} />
            <Tab label="Addresses" value={WalletTabs.ADDRESSES} />
            <Tab label="Transactions" value={WalletTabs.TRANSACTIONS} />
          </TabList>
          <WalletMenu walletId={walletId} />
        </div>
        <Paper classes={{ root: styles.paper }}>
          <Toolbar className={styles.toolbar}>
            <div className={classNames(styles.toolbarButtons, styles.toolbarButtonsLeft)}>
              {hasOtherWallets && (
                <IconButton className={styles.toolbarButton} onClick={gotoWalletsScreen}>
                  <Back />
                </IconButton>
              )}
            </div>
            {tab !== WalletTabs.BALANCE && <WalletTitle walletId={walletId} />}
            <div className={classNames(styles.toolbarButtons, styles.toolbarButtonsRight)}>
              {tab !== WalletTabs.BALANCE && (
                <>
                  <Tooltip title="Send">
                    <IconButton className={styles.toolbarButton} color="primary" onClick={gotoSend}>
                      <SendIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Receive">
                    <IconButton className={styles.toolbarButton} color="primary" onClick={gotoReceive}>
                      <ReceiveIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </div>
          </Toolbar>
          <Divider />
          <TabPanel className={classNames(styles.tabPanel, styles.tabPanelPadding)} value={WalletTabs.BALANCE}>
            <WalletBalance walletId={walletId} />
          </TabPanel>
          <TabPanel className={classNames(styles.tabPanel, styles.tabPanelPadding)} value={WalletTabs.ADDRESSES}>
            <Addresses walletId={walletId} />
          </TabPanel>
          <TabPanel className={styles.tabPanel} value={WalletTabs.TRANSACTIONS}>
            <TxHistory walletId={walletId} />
          </TabPanel>
        </Paper>
      </TabContext>
    </div>
  );
};

export default connect<StateProps, DispatchProps, OwnProps, IState>(
  (state) => ({ hasOtherWallets: state.accounts.wallets.length > 1 }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, { walletId }) => ({
    gotoReceive() {
      dispatch(screen.actions.gotoScreen(screen.Pages.RECEIVE, walletId));
    },
    gotoSend() {
      dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX, walletId, null, true));
    },
    gotoWalletsScreen() {
      dispatch(screen.actions.gotoWalletsScreen());
    },
    loadTransactions(walletId, initial) {
      return dispatch(txhistory.actions.loadTransactions(walletId, initial));
    },
  }),
)(WalletDetails);
