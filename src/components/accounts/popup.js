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
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { DescriptionList, DescriptionTitle, DescriptionData } from 'elements/dl';
import { align, cardSpace } from 'lib/styles';

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
    const { account, rates } = this.props;
    const styles = {
        closeButton: {
            float: 'right',
        },
        openButton: {
            display: 'inline-block',
        },
        qr: {
            marginLeft: 'auto',
            marginRight: 'auto',
        },
        usageText: {
            color: 'gray',
        },
        usageWarning: {
            color: 'crimson',
        },
        accountId: {
            overflow: 'scroll',
            backgroundColor: 'whitesmoke',
            padding: '0.1rem 0.3rem',
        }
    };

    return (
      <div>
        <FlatButton
            label="Add Ether"
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
                <h1>Add Ether</h1>
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
            <Col xs={6}>
                <p>Top up your wallet with BTC</p>
                <DescriptionList>
                    {account.get('description') && <div>
    -                            <DescriptionData>{account.get('description')}</DescriptionData>
    -                            </div>}
                    <DescriptionData>
                        <code style={styles.accountId}>
                        {account.get('id')}
                        </code>
                    </DescriptionData>
                </DescriptionList>

                <p>Exchange Rate</p>
                <p>
                    1 ETC ~ {rates.get('btc')} BTC
                </p>

                <p style={styles.usageText}>
                    Share your wallet address and use it to top up your wallet with BTC from any other service.
                    All BTC will be converted to ETC. It may take some time for your coins be deposited.
                </p>

                <p>Minimal amount</p>
                <p>0.00055 BTC</p>

                <p style={styles.usageWarning}>
                    Please note than an amount is less than the minimum, it is mostly non-refundable.
                </p>
            </Col>
            <Col xs={6} style={align.center}>
                 <QRCode value={account.get('id')} size={256} />
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
        return {
            account: (accounts.get(pos) || Immutable.Map({})),
            rates,
        };
    },
    (dispatch, ownProps) => ({})
)(AccountPopupRender);

export default AccountPopup;
