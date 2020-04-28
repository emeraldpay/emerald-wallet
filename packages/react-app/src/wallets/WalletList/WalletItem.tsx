import { ButtonGroup, IdentityIcon } from '@emeraldplatform/ui';
import { Wallet } from '@emeraldwallet/core';
import { Button, CoinAvatar } from '@emeraldwallet/ui';
import { Card, CardActions, CardContent, CardHeader, Grid } from '@material-ui/core';
import { createStyles, withStyles, withTheme } from '@material-ui/core/styles';
import { AccountBalanceWalletOutlined as WalletIcon } from '@material-ui/icons';
import * as React from 'react';
import AccountBalance from '../../common/Balance';
import WalletSummary from '../WalletSummary';
import WalletMenu from './WalletMenu';

const styles = (theme: any) => ({
  // tokensDivider: {
  //   backgroundColor: '#F5F5F5',
  //   height: '2px',
  //   width: '100%',
  //   border: 'none'
  // },
  gridCard: {
    border: 'none',
    backgroundColor: 'transparent'
  },
  gridCardInner: {
    backgroundColor: theme.emeraldColors.white.main,
    margin: '10px',
    width: '100%',
    border: `1px solid ${theme.palette.divider}`
  },
  // identityIconContainer: {
  //   display: 'flex',
  //   alignItems: 'center'
  // },
  actionsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  // card: {
  //   borderRadius: '1px',
  //   boxShadow: 'none'
  // },
  // coinCard: {
  //   alignItems: 'center'
  // },
  // identityGrid: {
  //   marginTop: '40px',
  //   paddingLeft: '60px'
  // },
  // headerTitle: {
  //   fontSize: '1em'
  // },
  // headerSubtitle: {
  //   fontSize: '0.8em',
  //   opacity: '25%'
  // },
  gridActions: {
    paddingTop: '40px'
  }
});

interface IWalletItemProps {
  wallet: Wallet;
  openWallet: (wallet: Wallet) => void;
  createTx: (wallet: Wallet) => void;
  showReceiveDialog: (wallet: Wallet) => void;
  showFiat: any;
  classes: any;
  theme: any;
}

// We use CustomCard to expand card content vertically
// and make margin with border
//
const cardStyles = createStyles({
  root: {
    display: 'flex'
  }
});
const CustomCard = (props: any) => (<Card variant='outlined' {...props} />);
const StyledCustomCard = withStyles(cardStyles)(CustomCard);

export class WalletItem extends React.PureComponent<IWalletItemProps> {

  public onSendClick = () => this.props.createTx(this.props.wallet);

  public handleDepositClick = () => this.props.showReceiveDialog(this.props.wallet);

  public render () {
    const {
        wallet, theme, classes, showFiat, openWallet
      } = this.props;
    const fiatStyle = {
      fontSize: '16px',
      lineHeight: '19px',
      color: theme.palette.text.secondary
    };

    function handleDetailsClick () {
      if (openWallet) {
        openWallet(wallet);
      }
    }

    return (
      <Grid item={true} xs={6} component={StyledCustomCard} classes={{ root: classes.gridCard }}>
        <div className={classes.gridCardInner}>
          <CardHeader
            avatar={<WalletIcon color='secondary'/>}
            title={wallet.name}
            classes={{
              title: classes.headerTitle,
              subheader: classes.headerSubtitle
            }}
            action={
              <WalletMenu walletId={wallet.id}/>
            }
          />
          <CardContent>
            <Grid container={true}>
              <Grid container={true} item={true} xs={12}>
                <WalletSummary wallet={wallet}/>
              </Grid>
            </Grid>
            <Grid container={true} classes={{ root: classes.gridActions }}>
              <Grid item={true} xs={2}/>
              <Grid item={true} xs={10}>
                <div className={classes.actionsContainer}>
                  <ButtonGroup>
                    {/*<WalletActions wallet={account} />*/}
                    <Button
                      disabled={true}
                      label='Deposit'
                      // onClick={this.handleDepositClick}
                    />
                    <Button
                      disabled={true}
                      label='Send'
                      // disabled={!account.balance}
                      // onClick={this.onSendClick}
                    />
                    <Button
                      label='Details'
                      onClick={handleDetailsClick}
                    />
                  </ButtonGroup>
                </div>
              </Grid>
            </Grid>
          </CardContent>
          {/*<CardActions>*/}
          {/*  <Button*/}
          {/*    disabled={true}*/}
          {/*    label='Deposit'*/}
          {/*    // onClick={this.handleDepositClick}*/}
          {/*  />*/}
          {/*  <Button*/}
          {/*    disabled={true}*/}
          {/*    label='Send'*/}
          {/*    // disabled={!account.balance}*/}
          {/*    // onClick={this.onSendClick}*/}
          {/*  />*/}
          {/*  <Button*/}
          {/*    label='Details'*/}
          {/*    onClick={handleDetailsClick}*/}
          {/*  />*/}
          {/*</CardActions>*/}
        </div>
      </Grid>
    );
  }
}

export default withTheme(withStyles(styles)(WalletItem));
