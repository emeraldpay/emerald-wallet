import React, {Fragment} from 'react';
import Immutable from 'immutable';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import People from 'material-ui/svg-icons/social/people';
import muiThemeable from 'material-ui/styles/muiThemeable';
import QRCode from 'qrcode.react';
import TokenUnits from 'lib/tokenUnits';
import { Button, IdentityIcon, Account as AddressAvatar, ButtonGroup, Page } from 'emerald-js-ui';
import { styles, Row } from 'elements/Form';
import { Back } from 'emerald-js-ui/lib/icons3';
import accounts from '../../../store/vault/accounts';
import tokens from '../../../store/vault/tokens';
import screen from '../../../store/wallet/screen';
import history from '../../../store/wallet/history';
import launcher from '../../../store/launcher';
import createLogger from '../../../utils/logger';
import AccountEdit from '../AccountEdit';
import TransactionsList from '../../tx/TxHistory';
import AccountBalance from '../Balance';
import SecondaryMenu from '../SecondaryMenu';
import classes from './show.scss';
import TokenBalances from '../TokenBalances';

const log = createLogger('AccountShow');

export class AccountShow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      edit: false,
      showModal: false,
    };
  }

  handleEdit = () => {
    this.setState({ edit: true });
  }

  handleSave = (data) => {
    this.props.editAccount(data)
      .then((result) => {
        this.setState({ edit: false });
        log.debug(result);
      });
  }

  cancelEdit = () => {
    this.setState({ edit: false });
  }

  render() {
    const { account, tokensBalances } = this.props;
    const { showFiat, goBack, transactions, createTx, showReceiveDialog } = this.props;
    // TODO: show pending balance too
    // TODO: we convert Wei to TokenUnits here
    const balance = account.get('balance') ? new TokenUnits(account.get('balance').value(), 18) : null;

    return (
      <Fragment>
        <Page title="Account" leftIcon={ <Back onClick={goBack} /> }>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{flexGrow: 2}}>
              <Row>
                <div id="left-column" style={styles.left}>
                  <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                    <IdentityIcon id={account.get('id')} />
                  </div>
                </div>
                <div style={styles.right}>
                  <AccountBalance
                    showFiat={ showFiat }
                    coinsStyle={{fontSize: '20px', lineHeight: '24px'}}
                    balance={ balance }
                    symbol="ETC"
                  />
                </div>
              </Row>

              <Row>
                <div style={ styles.left }>
                </div>
                <div style={ styles.right }>
                  <TokenBalances balances={ tokensBalances }/>
                </div>
              </Row>

              <Row>
                <div style={styles.left}>
                  <div style={styles.fieldName}>
                    <People />
                  </div>
                </div>
                <div style={ styles.right }>
                  {!this.state.edit && <AddressAvatar
                    editable
                    addr={account.get('id')}
                    description={account.get('description')}
                    name={account.get('name')}
                    onEditClick={this.handleEdit}
                  />}
                  {this.state.edit && <AccountEdit
                    account={account}
                    submit={this.handleSave}
                    cancel={this.cancelEdit}
                  />}
                </div>
              </Row>
              { account.get('hardware', false) &&
                <Row>
                  <div style={styles.left}>
                    <div style={styles.fieldName}>
                      HD Path
                    </div>
                  </div>
                  <div style={ styles.right }>
                    { account.get('hdpath') }
                  </div>
                </Row> }
              <Row>
                <div style={styles.left}/>
                <div style={styles.right}>
                  <div>
                    <ButtonGroup>
                      <Button
                        primary
                        label="Deposit"
                        onClick={ showReceiveDialog }
                      />
                      <Button
                        primary
                        label="Send"
                        onClick={ createTx }
                      />
                      <SecondaryMenu account={ account } />
                    </ButtonGroup>
                  </div>
                </div>
              </Row>
            </div>

            <div className={ classes.qrCodeContainer }>
              <QRCode value={ account.get('id') } />
            </div>
          </div>

          <div style={{paddingBottom: '20px'}} />
        </Page>

        <div className={ classes.transContainer }>
          <TransactionsList transactions={ transactions } accountId={ account.get('id') } />
        </div>
      </Fragment>
    );
  }
}

AccountShow.propTypes = {
  showFiat: PropTypes.bool,
  account: PropTypes.object.isRequired,
  goBack: PropTypes.func.isRequired,
  transactions: PropTypes.object.isRequired,
  editAccount: PropTypes.func,
  createTx: PropTypes.func,
  showReceiveDialog: PropTypes.func,
};

export default connect(
  (state, ownProps) => {
    const account = accounts.selectors.selectAccount(state, ownProps.account.get('id'));
    let transactions = Immutable.List();
    let tokensBalances = Immutable.List();

    if (account && account.get('id')) {
      transactions = history.selectors.searchTransactions(
        account.get('id'),
        state.wallet.history.get('trackedTransactions'));
      tokensBalances = tokens.selectors.balancesByAddress(state.tokens, account.get('id'));
    } else {
      log.warn("Can't find account in general list of accounts", ownProps.account.get('id'));
    }

    return {
      showFiat: launcher.selectors.getChainName(state) === 'mainnet',
      tokensBalances,
      account,
      transactions,
    };
  },
  (dispatch, ownProps) => ({
    createTx: () => {
      const account = ownProps.account;
      dispatch(screen.actions.gotoScreen('create-tx', account));
    },
    showReceiveDialog: () => {
      const account = ownProps.account;
      dispatch(screen.actions.showDialog('receive', account));
    },
    goBack: () => {
      dispatch(screen.actions.gotoScreen('home'));
    },
    editAccount: (data) => {
      return new Promise((resolve, reject) => {
        dispatch(accounts.actions.updateAccount(data.address, data.name, data.description))
          .then((response) => {
            resolve(response);
          });
      });
    },
  })
)(muiThemeable()(AccountShow));
