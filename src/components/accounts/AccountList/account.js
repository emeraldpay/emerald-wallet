import React from 'react';
import PropTypes from 'prop-types';
import { CardText } from 'material-ui/Card';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { Button, IdentityIcon, Account as AddressAvatar, ButtonGroup } from 'emerald-js-ui';
import { QrCode as QrCodeIcon } from 'emerald-js-ui/lib/icons2';
import { connect } from 'react-redux';
import Immutable from 'immutable';

import Card from 'elements/Card';
import SecondaryMenu from '../SecondaryMenu';
import AccountBalance from '../Balance';
import TokenBalances from '../TokenBalances';

import styles from './account.scss';
import TokenUnits from '../../../lib/tokenUnits';

const qrIconStyle = {
  width: '14px',
  height: '14px',
};

export class Account extends React.Component {
    static propTypes = {
      tokens: PropTypes.object.isRequired,
      account: PropTypes.object.isRequired,
      openAccount: PropTypes.func.isRequired,
      createTx: PropTypes.func,
      showReceiveDialog: PropTypes.func,
      showFiat: PropTypes.bool,
    };

    constructor(props) {
      super(props);
      this.state = {
        showTokens: false,
      };
    }

    switchDetails = () => {
      this.setState((prevState) => ({
        showTokens: !prevState.showTokens,
      }));
    }

    onSendClick = () => this.props.createTx(this.props.account);

    onAddressClick = () => this.props.openAccount(this.props.account);

    onAddEtcClick = () => this.props.showReceiveDialog(this.props.account);

    render() {
      const { account, tokens } = this.props;
      const { showFiat } = this.props;
      const { showTokens } = this.state;

      // TODO: we convert Wei to TokenUnits here
      const balance = account.get('balance') ? new TokenUnits(account.get('balance').value(), 18) : null;

      return (
        <Card>
          <CardText>
            <Row>
              <Col xs={3}>
                <div className={ styles.identityIconContainer }>
                  <IdentityIcon
                    id={ account.get('id') }
                    onClick={ this.switchDetails }
                    expanded={ showTokens }
                  />
                  <div style={{marginLeft: '10px'}}>
                    {balance && <AccountBalance
                      balance={ balance }
                      symbol="ETC"
                      showFiat={ showFiat }
                    />}
                    {!balance && 'loading...'}
                  </div>
                </div>
              </Col>
              <Col xs={5}>
                <AddressAvatar
                  editable
                  addr={ account.get('id') }
                  description={ account.get('description') }
                  primary={ account.get('name') }
                  onAddressClick={ this.onAddressClick }
                />
              </Col>
              <Col xs={4}>
                <div className={ styles.actionsContainer }>
                  <ButtonGroup>
                    <SecondaryMenu account={account} />
                    <Button
                      label="Add ETC"
                      icon={<QrCodeIcon style={ qrIconStyle } />}
                      onClick={ this.onAddEtcClick }
                    />
                    <Button
                      label="Send"
                      onClick={ this.onSendClick }
                    />
                  </ButtonGroup>
                </div>
              </Col>
            </Row>
            { showTokens &&
                    (<div>
                      <Row>
                        <Col xs={12} lg={12} md={12} sm={12}>
                          <hr className={ styles.tokensDivider } />
                        </Col>
                      </Row>
                      <Row>
                        <Col xs={12} lg={12} md={12} sm={12} style={{marginLeft: '50px'}}>
                          <TokenBalances balances={ tokens } />
                        </Col>
                      </Row>
                    </div>)}
          </CardText>
        </Card>);
    }
}


export default connect(
  (state, ownProps) => ({
    tokens: state.tokens.get('balances', Immutable.Map()).get(ownProps.account.get('id'), Immutable.List()),
  }),
  (dispatch, ownProps) => ({

  })
)(Account);
