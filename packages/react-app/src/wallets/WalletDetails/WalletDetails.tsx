import { BigAmount } from '@emeraldpay/bigamount';
import { Uuid, isEthereumEntry } from '@emeraldpay/emerald-vault-core';
import { IState, accounts, screen, txhistory } from '@emeraldwallet/store';
import { Back } from '@emeraldwallet/ui';
import { Divider, IconButton, Paper, Tab, Toolbar, Tooltip } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { ArrowDownward as ReceiveIcon, ArrowUpward as SendIcon } from '@mui/icons-material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import * as React from 'react';
import { connect } from 'react-redux';
import TxHistory from '../../transactions/TxHistory';
import Addresses from './addresses/Addresses';
import WalletAllowance from './WalletAllowance';
import WalletBalance from './WalletBalance';
import WalletMenu from './WalletMenu';
import WalletTitle from './WalletTitle';

export enum WalletTabs {
  BALANCE = '0',
  ALLOWANCES = '1',
  ADDRESSES = '2',
  TRANSACTIONS = '3',
}

const useStyles = makeStyles()((theme) =>
  ({
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
    }
  }));

interface OwnProps {
  initialTab?: WalletTabs;
  walletId: Uuid;
}

interface StateProps {
  hasAnyBalance: boolean;
  hasEthereumEntry: boolean;
  hasOtherWallets: boolean;
}

interface DispatchProps {
  gotoReceive(): void;
  gotoSend(): void;
  gotoWalletsScreen(): void;
  loadTransactions(walletId: Uuid, initial: boolean): Promise<void>;
}

const WalletDetails: React.FC<OwnProps & StateProps & DispatchProps> = ({
  hasAnyBalance,
  hasEthereumEntry,
  hasOtherWallets,
  initialTab,
  walletId,
  gotoReceive,
  gotoSend,
  gotoWalletsScreen,
  loadTransactions,
}) => {
  const { classes: styles, cx } = useStyles();

  const currentWallet = React.useRef(walletId);

  const [tab, setTab] = React.useState(initialTab ?? WalletTabs.BALANCE);

  const renderTabs = (): React.ReactNode => {
    const tabs = [<Tab key={WalletTabs.BALANCE} label="Balance" value={WalletTabs.BALANCE} />];

    if (hasEthereumEntry) {
      tabs.push(<Tab key={WalletTabs.ALLOWANCES} label="Allowances" value={WalletTabs.ALLOWANCES} />);
    }

    return [
      ...tabs,
      <Tab key={WalletTabs.ADDRESSES} label="Addresses" value={WalletTabs.ADDRESSES} />,
      <Tab key={WalletTabs.TRANSACTIONS} label="Transactions" value={WalletTabs.TRANSACTIONS} />,
    ];
  };

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
    <div
      className={styles.container}
      style={{ height: [WalletTabs.ALLOWANCES, WalletTabs.TRANSACTIONS].includes(tab) ? '100%' : 'auto' }}
    >
      <TabContext value={tab}>
        <div className={styles.tabs}>
          <TabList indicatorColor="primary" textColor="primary" onChange={(_event, selected) => setTab(selected)}>
            {renderTabs()}
          </TabList>
          <WalletMenu walletId={walletId} />
        </div>
        <Paper classes={{ root: styles.paper }}>
          <Toolbar className={styles.toolbar}>
            <div className={cx(styles.toolbarButtons, styles.toolbarButtonsLeft)}>
              {hasOtherWallets && (
                <IconButton className={styles.toolbarButton} onClick={gotoWalletsScreen}>
                  <Back />
                </IconButton>
              )}
            </div>
            {tab !== WalletTabs.BALANCE && <WalletTitle walletId={walletId} />}
            <div className={cx(styles.toolbarButtons, styles.toolbarButtonsRight)}>
              {tab !== WalletTabs.BALANCE && (
                <>
                  <Tooltip title="Send">
                    <span>
                      <IconButton
                        className={styles.toolbarButton}
                        color="primary"
                        disabled={!hasAnyBalance}
                        onClick={gotoSend}
                      >
                        <SendIcon />
                      </IconButton>
                    </span>
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
          <TabPanel className={cx(styles.tabPanel, styles.tabPanelPadding)} value={WalletTabs.BALANCE}>
            <WalletBalance walletId={walletId} />
          </TabPanel>
          {hasEthereumEntry && (
            <TabPanel className={styles.tabPanel} value={WalletTabs.ALLOWANCES}>
              <WalletAllowance walletId={walletId} />
            </TabPanel>
          )}
          <TabPanel className={cx(styles.tabPanel, styles.tabPanelPadding)} value={WalletTabs.ADDRESSES}>
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
  (state, { walletId }) => {
    const wallet = accounts.selectors.findWallet(state, walletId);

    let balances: BigAmount[] = [];

    if (wallet != null) {
      balances = accounts.selectors.getWalletBalances(state, wallet);
    }

    return {
      hasAnyBalance: balances.some((balance) => balance.isPositive()),
      hasEthereumEntry: wallet?.entries.some((entry) => !entry.receiveDisabled && isEthereumEntry(entry)) ?? false,
      hasOtherWallets: state.accounts.wallets.length > 1,
    };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, { walletId }) => ({
    gotoReceive() {
      dispatch(screen.actions.gotoScreen(screen.Pages.RECEIVE, walletId));
    },
    gotoSend() {
      dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX, { walletId }, null, true));
    },
    gotoWalletsScreen() {
      dispatch(screen.actions.gotoWalletsScreen());
    },
    loadTransactions(walletId, initial) {
      return dispatch(txhistory.actions.loadTransactions(walletId, initial));
    },
  }),
)(WalletDetails);
