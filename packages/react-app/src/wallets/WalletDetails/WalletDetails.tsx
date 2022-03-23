import {accounts, IState, screen} from '@emeraldwallet/store';
import * as React from 'react';
import {connect} from 'react-redux';
import {makeStyles} from "@material-ui/core/styles";
import {Box, Button, createStyles, Grid, IconButton, Theme, Typography} from "@material-ui/core";
import {Dispatch} from "react";
import {Back, Pen3 as EditIcon} from "@emeraldwallet/ui";
import EthereumAccountItem from "./EthereumAccountItem";
import {Page, PageTitle} from "@emeraldwallet/ui";
import {AccountBalanceWalletOutlined as WalletIcon} from "@material-ui/icons";
import {InlineEdit, HashIcon} from "@emeraldwallet/ui";
import WalletMenu from "../WalletList/WalletMenu";
import {Alert} from '@material-ui/lab';
import {Wallet} from '@emeraldpay/emerald-vault-core';
import {isBitcoinEntry, isEthereumEntry, WalletEntry} from "@emeraldpay/emerald-vault-core";
import BitcoinAccountItem from "./BitcoinAccountItem";

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
const WalletDetails = (({wallet, goBack, updateWallet, onReceive, onSend}: Props & Actions & OwnProps) => {
  if (typeof wallet == "undefined") {
    console.error("Wallet is not found");
    return <Alert>
      <Typography>Wallet is not found</Typography>
    </Alert>
  }

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

  const renderEntry = (entry: WalletEntry) => {
    if (isBitcoinEntry(entry)) {
      return <BitcoinAccountItem
        walletId={wallet.id}
        account={entry}
        key={entry.id}
      />
    }

    if (isEthereumEntry(entry)) {
      return <EthereumAccountItem
        walletId={wallet.id}
        account={entry}
        key={entry.id}
      />
    }

    console.warn("Unsupported entry type: ", wallet.id);
    return <Box/>
  }

  return <Page
    title={renderTitle()}
    leftIcon={<Back onClick={goBack}/>}
    rightIcon={<WalletMenu hasHDAccount={(wallet.reserved?.length ?? 0) > 0} walletId={wallet.id}/>}
  >
    <Grid container={true}>
      <Grid item={true} xs={2} className={styles.walletIcon}>
        <HashIcon value={"WALLET/" + wallet.id} size={100}/>
      </Grid>
      <Grid item={true} xs={7}>
        {wallet.entries.map(renderEntry)}
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
    console.debug("Open wallet", ownProps.walletId);
    if (typeof ownProps.walletId != "string") {
      console.error("Invalid walletId", ownProps.walletId);
    }
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
)((WalletDetails));
