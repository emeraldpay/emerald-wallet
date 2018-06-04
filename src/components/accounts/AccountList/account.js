import React from 'react';
import PropTypes from 'prop-types';
import { CardText } from 'material-ui/Card';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { Button, IdentityIcon, Account as AddressAvatar, ButtonGroup, Card } from 'emerald-js-ui';
import muiThemeable from 'material-ui/styles/muiThemeable';
import SecondaryMenu from '../SecondaryMenu';
import AccountBalance from '../Balance';
import TokenUnits from '../../../lib/tokenUnits';

import styles from './account.scss';

export class Account extends React.Component {
    static propTypes = {
      tokensBalances: PropTypes.object.isRequired,
      account: PropTypes.object.isRequired,
      openAccount: PropTypes.func.isRequired,
      createTx: PropTypes.func,
      showReceiveDialog: PropTypes.func,
      showFiat: PropTypes.bool,
    };

    onSendClick = () => this.props.createTx(this.props.account);

    onAddressClick = () => this.props.openAccount(this.props.account);

    onAddEtcClick = () => this.props.showReceiveDialog(this.props.account);

    render() {
      const { account, muiTheme } = this.props;
      const { showFiat } = this.props;
      const fiatStyle = {
        fontSize: '16px',
        lineHeight: '19px',
        color: muiTheme.palette.secondaryTextColor,
      };

      // TODO: we convert Wei to TokenUnits here
      const balance = account.get('balance') ? new TokenUnits(account.get('balance').value(), 18) : null;

      return (
        <Card>
          <CardText>
            <Row>
              <Col xs={5}>
                <AddressAvatar
                  identity
                  addr={ account.get('id') }
                  description={ account.get('description') }
                  primary={ account.get('name') }
                  onAddressClick={ this.onAddressClick }
                />
              </Col>
              <Col xs={3}>
                <div className={ styles.identityIconContainer }>
                  <div style={{marginLeft: '10px'}}>
                    {balance && <AccountBalance
                      fiatStyle={fiatStyle}
                      balance={ balance }
                      symbol="ETC"
                      showFiat={ showFiat }
                    />}
                    {!balance && 'loading...'}
                  </div>
                </div>
              </Col>
              <Col xs={4}>
                <div className={ styles.actionsContainer }>
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
              </Col>
            </Row>
          </CardText>
        </Card>);
    }
}

export default muiThemeable()(Account);
