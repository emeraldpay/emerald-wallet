import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import { Grid, Row, Col } from 'react-flexbox-grid/lib/index';
import log from 'electron-log';

import AccountAddress from 'elements/AccountAddress';
import AddressAvatar from '../../elements/addressAvatar';
import AccountSendButton from './sendButton';
import { gotoScreen } from 'store/screenActions';

import { cardSpace, noShadow, align } from 'lib/styles';
import AccountPopup from './popup';
import AccountBalance from './AccountBalance';
import { Wei } from 'lib/types';
import IdentityIcon from 'elements/IdentityIcon';


const Render = ({ account, openAccount }) => {
    const styles = {
        card: {
            marginBottom: '6px',
            ...noShadow,
        },
    };

    const balance = account.get('balance');
    return (
    <Card style={styles.card}>
        <CardText>
            <Row>
                <Col xs={3}>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <IdentityIcon id={account.get('id')}/>
                        <div style={{marginLeft: '10px'}}>
                            {balance && <AccountBalance balance={account.get('balance')} /> }
                            {!balance && 'loading...'}
                        </div>
                    </div>
                </Col>
                <Col xs={6}>
                    <AddressAvatar
                        addr={account.get('id')}
                        tertiary={account.get('description')}
                        primary={account.get('name')}
                        onAddressClick={openAccount}
                    />
                </Col>
                <Col xs={3}>
                    <AccountPopup account={account}/>
                    <AccountSendButton account={account} />
                </Col>
            </Row>
        </CardText>
    </Card>);
};

Render.propTypes = {
    account: PropTypes.object.isRequired,
    openAccount: PropTypes.func.isRequired,
};

const Account = connect(
    (state, ownProps) => ({}),
    (dispatch, ownProps) => ({
        openAccount: () => {
            const account = ownProps.account;
            log.debug('open', account.get('id'));
            dispatch(gotoScreen('account', account));
        },
    })
)(Render);


export default Account;
