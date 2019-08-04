import React from 'react';
import { withStyles } from '@material-ui/styles';
import withTheme from '@material-ui/core/styles/withTheme';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import PropTypes from 'prop-types';
import { Account as AddressAvatar, ButtonGroup } from '@emeraldplatform/ui';
import { Button, CoinAvatar } from '@emeraldwallet/ui';
import { blockchainByName } from '@emeraldwallet/core';
import { AccountActions } from '@emeraldwallet/react-app';
import AccountBalance from '../Balance';

const styles = (theme) => ({
  tokensDivider: {
    backgroundColor: '#F5F5F5',
    height: '2px',
    width: '100%',
    border: 'none',
  },
  identityIconContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  actionsContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  card: {
    borderRadius: '1px',
    boxShadow: 'none',
  },
  coinCard: {
    alignItems: 'center',
  },
});

export class Account extends React.Component {
    static propTypes = {
      account: PropTypes.object.isRequired,
      openAccount: PropTypes.func.isRequired,
      createTx: PropTypes.func,
      showReceiveDialog: PropTypes.func,
      showFiat: PropTypes.bool,
      classes: PropTypes.object,
    };

    onSendClick = () => this.props.createTx(this.props.account);

    onAddressClick = () => this.props.openAccount(this.props.account);

    handleDepositClick = () => this.props.showReceiveDialog(this.props.account);

    render() {
      const {
        account, theme, classes, showFiat,
      } = this.props;
      const fiatStyle = {
        fontSize: '16px',
        lineHeight: '19px',
        color: theme.palette.text.secondary,
      };

      const { coinTicker } = blockchainByName(account.get('blockchain')).params;

      const balance = account.get('balance');
      const accId = account.get('id');
      return (
        <Card className={classes.card}>
          <CardContent>
            <Grid container>
              <Grid container item xs={1} className={classes.coinCard}>
                <CoinAvatar chain={account.get('blockchain')} />
              </Grid>
              <Grid container item xs={6}>
                { accId && <AddressAvatar
                  identity
                  address={ accId }
                  description={ account.get('description') }
                  name={ account.get('name') }
                  onClick={ this.onAddressClick }
                /> }
              </Grid>
              <Grid container item xs={2}>
                <div className={ classes.identityIconContainer }>
                  <div style={{marginLeft: '10px'}}>
                    {balance && <AccountBalance
                      fiatStyle={fiatStyle}
                      balance={ balance }
                      decimals={ 18 }
                      symbol={ coinTicker }
                      showFiat={ showFiat }
                    />}
                    {!balance && 'loading...'}
                  </div>
                </div>
              </Grid>
              <Grid item xs={3}>
                <div className={ classes.actionsContainer }>
                  <ButtonGroup>
                    <AccountActions account={account} />
                    <Button
                      label="Deposit"
                      onClick={ this.handleDepositClick }
                    />
                    <Button
                      label="Send"
                      disabled={ !account.get('balance') }
                      onClick={ this.onSendClick }
                    />
                  </ButtonGroup>
                </div>
              </Grid>
            </Grid>
          </CardContent>
        </Card>);
    }
}

export default withTheme((withStyles(styles)(Account)));
