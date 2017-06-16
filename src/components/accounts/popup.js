import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import log from 'loglevel';
import QRCode from 'qrcode.react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import copy from 'copy-to-clipboard';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { DescriptionList, DescriptionTitle, DescriptionData } from 'elements/dl';
import { link, align, cardSpace } from 'lib/styles';
import { Wei } from 'lib/types';

/**
 * Dialog with action buttons. The actions are passed in as an array of React objects,
 * in this example [FlatButtons](/#/components/flat-button).
 *
 * You can also close this dialog by clicking outside the dialog, or with the 'Esc' key.
 */
class AccountPopupRender extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
        }

    }

  handleOpen = () => {
    this.setState({open: true});
  };

  handleClose = () => {
    this.setState({open: false});
  };

  render() {
    const { account, rates, gasPrice } = this.props;
    const styles = {
        container: {
            display: 'inline',
        },
        closeButton: {
            float: 'right',
            color: 'green',
        },
        openButton: {
            display: 'inline',
            backgroundColor: 'dimgray',
            color: 'white',
        },
        qr: {
            marginLeft: 'auto',
            marginRight: 'auto',
            maxWidth: '90%',
        },
        usageText: {
            color: 'gray',
        },
        usageWarning: {
            color: 'crimson',
            fontSize: '0.9rem',
        },
        accountId: {
            overflow: 'scroll',
            backgroundColor: 'whitesmoke',
            padding: '0.1rem 0.3rem',
            display: 'inline',
            fontSize: '0.8rem', /* to better ensure fit for all screen sizes */
        },
        copyIcon: {
            display: 'inline',
            fontSize: '0.9rem',
            color: 'darkgray',
            marginLeft: '0.3rem',
        },
    };

    function copyAccountToClipBoard() {
        copy(account.get('id'));
    }

    return (
        <div style={styles.container}>
        <FlatButton
            label="Add ETC"
            icon={<FontIcon className='fa fa-qrcode' />}
            onTouchTap={this.handleOpen}
            style={styles.openButton} />
        <Dialog
        //   title="Add Ether"
        //   actions={actions}
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose}
        >
            <Row>
                <Col xs={11}>
                    <h1>Add ETC</h1>
                </Col>
                <Col xs={1}>
                    <FlatButton
                      icon={<FontIcon className='fa fa-close' />}
                      primary={true}
                      onTouchTap={this.handleClose}
                      style={styles.closeButton}
                    />
                </Col>
            </Row>
            <Row>
                <Col xs={7}>
                    <p>Top up your wallet with BTC</p>
                    <DescriptionList>
                        {account.get('description') && <div>
        -                            <DescriptionData>{account.get('description')}</DescriptionData>
        -                            </div>}
                        <DescriptionData>
                            <span>
                            <code style={styles.accountId}>
                            {account.get('id')}
                            </code>
                            <FontIcon className='fa fa-clone' onClick={copyAccountToClipBoard} style={Object.assign({}, link, styles.copyIcon)} />
                            </span>
                        </DescriptionData>
                    </DescriptionList>

                    <p>Exchange Rate</p>
                    <strong>
                        1 ETC ~ {rates.get('btc')} BTC
                    </strong>

                    <p style={styles.usageText}>
                        Share your wallet address and use it to top up your wallet with BTC from any
                        &nbsp;<a href='https://shapeshift.io' >other service</a>. All BTC will be converted to ETC.
                        It may take some time for your coins be deposited.
                    </p>

                    <p>Minimal amount</p>
                    <p>{gasPrice.getEther(10)} ~ {gasPrice.getFiat(rates.get('btc'), 10)} BTC</p>

                    <p style={styles.usageWarning}>
                        Please note that if an amount is less than the minimum, it is mostly non-refundable.
                    </p>
                </Col>
                <Col xs={5} style={align.center}>
                     <QRCode value={account.get('id')} size={256} style={styles.qr} />
                 </Col>
            </Row>
        </Dialog>
        </div>
    );
  }
}

AccountPopupRender.propTypes = {
    account: PropTypes.object.isRequired,
};

const AccountPopup = connect(
    (state, ownProps) => {
        const accounts = state.accounts.get('accounts');
        const pos = accounts.findKey((acc) => acc.get('id') === ownProps.account.get('id'));
        const rates = state.accounts.get('rates');
        const gasPrice = new Wei(21000000000); // Rough estimate tx gasprice; 21000 * 10^6
        return {
            account: (accounts.get(pos) || Immutable.Map({})),
            rates,
            gasPrice,
        };
    },
    (dispatch, ownProps) => ({})
)(AccountPopupRender);

export default AccountPopup;
