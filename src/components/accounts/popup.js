import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import log from 'electron-log';
import QRCode from 'qrcode.react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import copy from 'copy-to-clipboard';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { DescriptionList, DescriptionTitle, DescriptionData } from 'elements/dl';
import { link, align, cardSpace, copyIcon } from 'lib/styles';
import { Wei } from 'lib/types';
import { AccountAddress } from 'elements/dl';

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
    };

    return (
        <div style={styles.container}>
        <FlatButton
            label="Add ETC"
            icon={<FontIcon className='fa fa-qrcode' />}
            onTouchTap={this.handleOpen}
            style={styles.openButton} />
        <Dialog
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
                    <p>Top up your wallet with ETC</p>
                    <DescriptionList>
                        {account.get('description') && <div>
        -                            <DescriptionData>{account.get('description')}</DescriptionData>
        -                            </div>}
                        <DescriptionData>
                            <AccountAddress id={account.get('id')} />
                        </DescriptionData>
                    </DescriptionList>
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
        const gasPrice = state.accounts.get('gasPrice');
        return {
            account: (accounts.get(pos) || Immutable.Map({})),
            rates,
            gasPrice,
        };
    },
    (dispatch, ownProps) => ({})
)(AccountPopupRender);

export default AccountPopup;
