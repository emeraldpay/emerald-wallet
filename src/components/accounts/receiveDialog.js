import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import QRCode from 'qrcode.react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { DescriptionList, DescriptionTitle, DescriptionData } from 'elements/dl';
import { AccountAddress } from 'elements/dl';
import { link, align, cardSpace, copyIcon } from 'lib/styles';
import { closeDialog } from 'store/screenActions';

const styles = {
    closeButton: {
        float: 'right',
        color: 'green',
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

const Render = ({ account, handleClose }) => {
    return <Dialog
        modal={false}
        open={true}
        onRequestClose={handleClose}>
        <Row>
            <Col xs={11}>
                <h1>Add ETC</h1>
            </Col>
            <Col xs={1}>
                <FlatButton
                    icon={<FontIcon className='fa fa-close' />}
                    primary={true}
                    onTouchTap={handleClose}
                    style={styles.closeButton}
                />
            </Col>
        </Row>
        <Row>
            <Col xs={7}>
                <p>Top up your wallet with ETC</p>
                <DescriptionList>
                    {account.get('description') && <div>
                        -                                      <DescriptionData>{account.get('description')}</DescriptionData>
                        -                                      </div>}
                    <DescriptionData>
                        <AccountAddress id={account.get('id')} />
                    </DescriptionData>
                </DescriptionList>
            </Col>
            <Col xs={5} style={align.center}>
                <QRCode value={account.get('id')} size={256} style={styles.qr} />
            </Col>
        </Row>
    </Dialog>;
};

const ReceiveDialog = connect(
    (state, ownProps) => ({
    }),
    (dispatch, ownProps) => ({
        handleClose: () => {
            dispatch(closeDialog());
        },
    })
)(Render);

export default ReceiveDialog;
