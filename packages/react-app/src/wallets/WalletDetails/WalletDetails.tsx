import { screen } from '@emeraldwallet/store';
import { Back } from '@emeraldwallet/ui';
import { Button, Divider, IconButton, Paper, Tab, Toolbar, createStyles, makeStyles } from '@material-ui/core';
import { TabContext, TabList, TabPanel } from '@material-ui/lab';
import classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import Addresses from './Addresses';
import WalletBalance from './WalletBalance';
import WalletMenu from './WalletMenu';
import WalletTitle from './WalletTitle';
import TxHistory from '../../transactions/TxHistory';

const useStyles = makeStyles((theme) =>
  createStyles({
    tabs: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: theme.spacing(2),
    },
    tabPanel: {
      padding: theme.spacing(4),
    },
    toolbar: {
      height: theme.spacing(10),
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
  walletId: string;
}

interface DispatchProps {
  gotoReceive(): void;
  gotoSend(): void;
  gotoWalletsScreen(): void;
}

enum WalletTabs {
  BALANCE = '0',
  ADDRESSES = '1',
  TRANSACTIONS = '2',
}

const WalletDetails: React.FC<OwnProps & DispatchProps> = ({ walletId, gotoReceive, gotoSend, gotoWalletsScreen }) => {
  const styles = useStyles();

  const [tab, setTab] = React.useState(WalletTabs.BALANCE);

  return (
    <TabContext value={tab}>
      <div className={styles.tabs}>
        <TabList indicatorColor="primary" textColor="primary" onChange={(event, selected) => setTab(selected)}>
          <Tab label="Balance" value={WalletTabs.BALANCE} />
          <Tab label="Addresses" value={WalletTabs.ADDRESSES} />
          <Tab label="Transactions" value={WalletTabs.TRANSACTIONS} />
        </TabList>
        <IconButton>
          <WalletMenu walletId={walletId} />
        </IconButton>
      </div>
      <Paper>
        <Toolbar className={styles.toolbar}>
          <div className={classNames(styles.toolbarButtons, styles.toolbarButtonsLeft)}>
            <IconButton className={styles.toolbarButton} onClick={gotoWalletsScreen}>
              <Back />
            </IconButton>
          </div>
          <WalletTitle walletId={walletId} />
          <div className={classNames(styles.toolbarButtons, styles.toolbarButtonsRight)}>
            <Button className={styles.toolbarButton} color="primary" variant="outlined" onClick={gotoSend}>
              Send
            </Button>
            <Button className={styles.toolbarButton} color="primary" variant="outlined" onClick={gotoReceive}>
              Receive
            </Button>
          </div>
        </Toolbar>
        <Divider />
        <TabPanel className={styles.tabPanel} value={WalletTabs.BALANCE}>
          <WalletBalance walletId={walletId} />
        </TabPanel>
        <TabPanel className={styles.tabPanel} value={WalletTabs.ADDRESSES}>
          <Addresses walletId={walletId} />
        </TabPanel>
        <TabPanel className={styles.tabPanel} value={WalletTabs.TRANSACTIONS}>
          <TxHistory walletId={walletId} />
        </TabPanel>
      </Paper>
    </TabContext>
  );
};

export default connect<{}, DispatchProps, OwnProps>(
  null,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (dispatch: any, ownProps) => ({
    gotoReceive() {
      dispatch(screen.actions.gotoScreen(screen.Pages.RECEIVE, ownProps.walletId));
    },
    gotoSend() {
      dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX, ownProps.walletId));
    },
    gotoWalletsScreen() {
      dispatch(screen.actions.gotoWalletsScreen());
    },
  }),
)(WalletDetails);
