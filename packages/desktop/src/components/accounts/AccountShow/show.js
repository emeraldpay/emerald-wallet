import React from 'react';
import withStyles from 'react-jss';
import Immutable from 'immutable';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import QRCode from 'qrcode.react';
import {Back} from '@emeraldplatform/ui-icons';
import {
  Page, IdentityIcon, ButtonGroup, Account as AddressAvatar
} from '@emeraldplatform/ui';
import { Button, InlineEdit } from '@emeraldwallet/ui';
import {Blockchains} from '@emeraldwallet/core';
import {styles, Row} from 'elements/Form';
import { screen } from 'store';
import accounts from '../../../store/vault/accounts';
import tokens from '../../../store/vault/tokens';
import history from '../../../store/wallet/history';
import createLogger from '../../../utils/logger';
import TransactionsList from '../../tx/TxHistory';
import Balance from '../Balance';
import SecondaryMenu from '../SecondaryMenu';
import TokenBalances from '../TokenBalances';
import Wallet from '../../../store/wallet';

export const styles2 = {
  transContainer: {
    marginTop: '20px',
  },
  qrCodeContainer: {
    flexBasis: '30%',
    backgroundColor: 'white',
  },
};

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
    this.setState({edit: true});
  };

  handleSave = (data) => {
    this.props.editAccount(data)
      .then((result) => {
        this.setState({edit: false});
        log.debug(result);
      });
  };

  cancelEdit = () => {
    this.setState({edit: false});
  };

  render() {
    const {
      account, tokensBalances, classes,
    } = this.props;
    const {
      showFiat, goBack, transactions, createTx, showReceiveDialog,
    } = this.props;
    // TODO: show pending balance too
    // TODO: we convert Wei to TokenUnits here
    const balance = account.get('balance');
    const acc = {
      id: account.get('id'),
      description: account.get('description'),
      name: account.get('name'),
      hdpath: account.get('hdpath'),
      hardware: account.get('hardware', false),
      blockchain: account.get('blockchain'),
    };

    const { coinTicker } = Blockchains[acc.blockchain].params;

    return (
      <div>
        <Page title="Account" leftIcon={<Back onClick={goBack}/>}>
          <div style={{display: 'flex', alignItems: 'center', paddingBottom: '20px'}}>
            <div style={{flexGrow: 2}}>
              <Row>
                <div id="left-column" style={styles.left}>
                  <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                    <IdentityIcon id={acc.id}/>
                  </div>
                </div>
                <div style={styles.right}>
                  {!this.state.edit && <AddressAvatar
                    editable
                    address={acc.id}
                    description={acc.description}
                    name={acc.name}
                    onEditClick={this.handleEdit}
                    addressProps={{hideCopy: false}}
                  />}
                  {this.state.edit && <InlineEdit
                    placeholder="Account name"
                    initialValue={acc.name}
                    id={acc.id}
                    onSave={this.handleSave}
                    onCancel={this.cancelEdit}
                  />}
                </div>
              </Row>

              <Row>
                <div style={styles.left}>
                </div>
                <div style={styles.right}>
                  {balance && <Balance
                    showFiat={showFiat}
                    coinsStyle={{fontSize: '20px', lineHeight: '24px'}}
                    balance={balance.toWei().toString(10)}
                    decimals={18}
                    symbol={coinTicker}
                  />}
                </div>
              </Row>

              <Row>
                <div style={styles.left}>
                </div>
                <div style={styles.right}>
                  <TokenBalances balances={tokensBalances}/>
                </div>
              </Row>
              {acc.hardware
              && <Row>
                <div style={styles.left}>
                  <div style={styles.fieldName}>
                    HD Path
                  </div>
                </div>
                <div style={styles.right}>
                  {acc.hdpath}
                </div>
              </Row>}
              <Row>
                <div style={styles.left}/>
                <div style={styles.right}>
                  <div>
                    <ButtonGroup>
                      <Button
                        primary
                        label="Deposit"
                        onClick={showReceiveDialog}
                      />
                      <Button
                        primary
                        label="Send"
                        onClick={createTx}
                      />
                      <SecondaryMenu account={account}/>
                    </ButtonGroup>
                  </div>
                </div>
              </Row>
            </div>

            <div className={classes.qrCodeContainer}>
              <QRCode value={acc.id}/>
            </div>
          </div>
        </Page>

        <div className={classes.transContainer}>
          <TransactionsList transactions={transactions} accountId={acc.id}/>
        </div>
      </div>
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
    const { account } = ownProps;
    let transactions = Immutable.List();
    let tokensBalances = Immutable.List();

    if (account && account.get('id')) {
      transactions = history.selectors.searchTransactions(
        account.get('id'),
        state.wallet.history.get('trackedTransactions')
      );
      tokensBalances = tokens.selectors.balancesByAddress(state.tokens, account.get('id'));
    } else {
      log.warn("Can't find account in general list of accounts", account.get('id'));
    }

    return {
      showFiat: Wallet.selectors.showFiat(state),
      tokensBalances,
      account,
      transactions,
    };
  },
  (dispatch, ownProps) => ({
    createTx: () => {
      const {account} = ownProps;
      dispatch(screen.actions.gotoScreen('create-tx', account));
    },
    showReceiveDialog: () => {
      const {account} = ownProps;
      const address = {
        value: account.get('id'),
        coinTicker: Blockchains[account.get('blockchain')].params.coinTicker,
      };
      dispatch(screen.actions.showDialog('receive', address));
    },
    goBack: () => {
      dispatch(screen.actions.gotoScreen('home'));
    },
    editAccount: (data) => {
      return new Promise((resolve, reject) => {
        dispatch(accounts.actions.updateAccount(data.id, data.value, data.description))
          .then((response) => {
            resolve(response);
          });
      });
    },
  })
)(withStyles(styles2)(AccountShow));
