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
import { cardSpace } from 'lib/styles';

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
    const { account } = this.props;
    const styles = {
        closeButton: {
            float: 'right',
        },
        openButton: {
            display: 'inline-block',
        },
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
            <Col xs={8}>
                <DescriptionList>
                    {account.get('description') && <div>
    -                            <DescriptionData>{account.get('description')}</DescriptionData>
    -                            </div>}
                    <DescriptionData>{account.get('id')}</DescriptionData>
                </DescriptionList>

            </Col>
            <Col xs={4} md={2} mdOffset={2}>
                 <QRCode value={account.get('id')} />
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
        // This seems ugly, but is the only way I've gotten it to work so far.
        const accounts = state.accounts.get('accounts');
        const pos = accounts.findKey((acc) => acc.get('id') === ownProps.account.get('id'));
        return {
            account: (accounts.get(pos) || Immutable.Map({})),
        };
    },
    (dispatch, ownProps) => ({})
)(AccountPopupRender);

export default AccountPopup;
