import {Account, Wallet} from '@emeraldwallet/core';
import {accounts, IState, screen} from '@emeraldwallet/store';
import * as React from 'react';
import {connect} from 'react-redux';
import {makeStyles} from "@material-ui/core/styles";
import {Box, Button, createStyles, Grid, IconButton, Theme, Typography} from "@material-ui/core";
import {Dispatch} from "react";
import {Back, Pen3 as EditIcon} from "@emeraldplatform/ui-icons";
import EthereumAccountItem from "./EthereumAccountItem";
import {Page} from "@emeraldplatform/ui";
import {PageTitle} from "@emeraldplatform/ui/lib/components/Page";
import {AccountBalanceWalletOutlined as WalletIcon} from "@material-ui/icons";
import {InlineEdit} from "@emeraldwallet/ui";
import WalletMenu from "../WalletList/WalletMenu";
import {Hashicon} from "@emeraldpay/hashicon-react";

export interface IOwnProps {
  walletId: string;
}


const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    titleText: {
      // maxWidth: "700px",
      // overflow: "scroll",
      // float: "left",
    },
    walletIcon: {
      cursor: 'pointer',
      paddingLeft: "16px",
      paddingTop: "24px",
    },
    actions: {
      textAlign: "center",
      clear: "both",
      marginTop: "20px",
      paddingLeft: theme.spacing(3)
    },
    actionButton: {
      width: "150px",
      margin: "5px 10px",
    }
  })
);

/**
 *
 */
const Component = (({wallet, goBack, updateWallet, onReceive, onSend}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  const walletName = wallet.name || '';

  const [edit, setEdit] = React.useState(false);

  const handleSave = (data: any) => {
    const walletData = {
      id: data.id,
      name: data.value
    };
    updateWallet(walletData);
    setEdit(false)
  }

  function actionsMenu() {
    if (wallet.seedId) {
      return (<WalletMenu walletId={wallet.id}/>);
    }
    return null;
  }

  const renderTitle = () => (
    <PageTitle>
      <div style={{display: 'flex', alignItems: 'center'}}>
        <div style={{display: 'flex', paddingRight: '5px'}}>
          <WalletIcon/>
        </div>
        <div style={{width: '100%'}}>
          {edit && (
            <InlineEdit
              placeholder='Wallet name'
              initialValue={walletName}
              id={wallet.id}
              onSave={handleSave}
              onCancel={() => setEdit(false)}
            />
          )}
          {!edit && (
            <React.Fragment>
              <Typography className={styles.titleText}>
                {walletName}
                <IconButton onClick={() => setEdit(true)}><EditIcon/></IconButton>
              </Typography>

            </React.Fragment>
          )}
        </div>
      </div>
    </PageTitle>
  );

  return <Page
    title={renderTitle()}
    leftIcon={<Back onClick={goBack}/>}
    rightIcon={actionsMenu()}
  >
    <Grid container={true}>
      <Grid item={true} xs={2} className={styles.walletIcon}>
        <Hashicon value={"WALLET/" + wallet.id} size={100}/>
      </Grid>
      <Grid item={true} xs={7}>
        {wallet.accounts.map(
          (account: Account) => (
            <EthereumAccountItem
              walletId={wallet.id}
              account={account}
              key={account.id}
            />
          )
        )}
      </Grid>
      <Grid item={true} xs={3} className={styles.actions}>
        <Button variant={"contained"}
                onClick={onSend}
                className={styles.actionButton}
                color={"secondary"}>Send</Button>
        <Button variant={"contained"}
                onClick={onReceive}
                className={styles.actionButton}
                color={"secondary"}>Receive</Button>
      </Grid>
    </Grid>
  </Page>
})

// State Properties
interface Props {
  wallet: Wallet
}

// Actions
interface Actions {
  goBack: () => void;
  updateWallet: (data: Partial<Wallet>) => void;
  onReceive: () => void;
  onSend: () => void;
}

// Component properties
interface OwnProps {
  walletId: string;
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {
      wallet: accounts.selectors.findWallet(state, ownProps.walletId)!
    }
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {
      goBack: () => {
        dispatch(screen.actions.gotoScreen(screen.Pages.HOME));
      },
      updateWallet: (data: Partial<Wallet>) => {
        dispatch(accounts.actions.updateWallet(data.id!, data.name || '') as any);
      },
      onReceive: () => {
        dispatch(screen.actions.gotoScreen(screen.Pages.RECEIVE, ownProps.walletId))
      },
      onSend: () => {
        dispatch(screen.actions.gotoScreen(screen.Pages.CREATE_TX, ownProps.walletId))
      }
    }
  }
)((Component));
