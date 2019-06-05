import React from 'react';
import { withStyles } from '@material-ui/styles';
import withTheme from '@material-ui/core/styles/withTheme';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import PropTypes from 'prop-types';
import { Account as AddressAvatar, ButtonGroup } from '@emeraldplatform/ui';
import { Button } from '@emeraldwallet/ui';
import { Blockchains } from '@emeraldwallet/core';
import SecondaryMenu from '../SecondaryMenu';
import AccountBalance from '../Balance';
import TokenUnits from '../../../lib/tokenUnits';

const styles2 = (theme) => ({
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

    onAddEtcClick = () => this.props.showReceiveDialog(this.props.account);

    render() {
      const {
        account, theme, classes, showFiat,
      } = this.props;
      const fiatStyle = {
        fontSize: '16px',
        lineHeight: '19px',
        color: theme.palette.text.secondary,
      };

      const { coinTicker } = Blockchains[account.get('blockchain')].params;

      // TODO: we convert Wei to TokenUnits here
      const balance = account.get('balance') ? new TokenUnits(account.get('balance').toWei(), 18) : null;
      const accId = account.get('id');
      return (
        <Card className={classes.card}>
          <CardContent>
            <Grid container>
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
                      symbol={ coinTicker }
                      showFiat={ showFiat }
                    />}
                    {!balance && 'loading...'}
                  </div>
                </div>
              </Grid>
              <Grid item xs={4}>
                <div className={ classes.actionsContainer }>
                  <ButtonGroup>
                    <SecondaryMenu account={account} />
                    <Button
                      label="Deposit"
                      onClick={ this.onAddEtcClick }
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

export default withTheme((withStyles(styles2)(Account)));
