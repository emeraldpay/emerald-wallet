import { Account as AddressAvatar, ButtonGroup } from '@emeraldplatform/ui';
import { blockchainByName, IAccount } from '@emeraldwallet/core';
import { Button, CoinAvatar } from '@emeraldwallet/ui';
import { Card, CardContent, Grid } from '@material-ui/core';
import withTheme from '@material-ui/core/styles/withTheme';
import { withStyles } from '@material-ui/styles';
import * as React from 'react';

import AccountBalance from '../../common/Balance';
import AccountActions from '../AccountActions';

const styles = (theme: any) => ({
  tokensDivider: {
    backgroundColor: '#F5F5F5',
    height: '2px',
    width: '100%',
    border: 'none'
  },
  identityIconContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  actionsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  card: {
    borderRadius: '1px',
    boxShadow: 'none'
  },
  coinCard: {
    alignItems: 'center'
  }
});

interface IAccountProps {
  account: IAccount;
  openAccount: any;
  createTx: any;
  showReceiveDialog: any;
  showFiat: any;
  classes: any;
  theme: any;
}

export class Account extends React.Component<IAccountProps> {

  public onSendClick = () => this.props.createTx(this.props.account);

  public onAddressClick = () => this.props.openAccount(this.props.account);

  public handleDepositClick = () => this.props.showReceiveDialog(this.props.account);

  public render () {
    const {
        account, theme, classes, showFiat
      } = this.props;
    const fiatStyle = {
      fontSize: '16px',
      lineHeight: '19px',
      color: theme.palette.text.secondary
    };

    const { coinTicker } = blockchainByName(account.blockchain).params;
    const balance = account.balance;

    return (
        <Card className={classes.card}>
          <CardContent>
            <Grid container={true}>
              <Grid container={true} item={true} xs={1} className={classes.coinCard}>
                <CoinAvatar chain={account.blockchain} />
              </Grid>
              <Grid container={true} item={true} xs={6}>
                { account.id && <AddressAvatar
                  identity={true}
                  address={account.id}
                  name={account.name}
                  onClick={this.onAddressClick}
                /> }
              </Grid>
              <Grid container={true} item={true} xs={2}>
                <div className={classes.identityIconContainer}>
                  <div style={{ marginLeft: '10px' }}>
                    {balance && (
                      <AccountBalance
                        fiatStyle={fiatStyle}
                        balance={balance}
                        decimals={6}
                        symbol={coinTicker}
                        showFiat={showFiat}
                      />
                      )}
                    {!balance && 'loading...'}
                  </div>
                </div>
              </Grid>
              <Grid item={true} xs={3}>
                <div className={classes.actionsContainer}>
                  <ButtonGroup>
                    <AccountActions account={account} />
                    <Button
                      label='Deposit'
                      onClick={this.handleDepositClick}
                    />
                    <Button
                      label='Send'
                      disabled={!account.balance}
                      onClick={this.onSendClick}
                    />
                  </ButtonGroup>
                </div>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
    );
  }
}

export default withTheme(withStyles(styles)(Account));
