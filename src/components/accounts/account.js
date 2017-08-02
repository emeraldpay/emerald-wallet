import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { TableRow, TableRowColumn } from 'material-ui/Table';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import { Grid, Row, Col } from 'react-flexbox-grid/lib/index';

import { AccountAddress } from 'elements/dl';
import AddressAvatar from '../../elements/addressAvatar';
import AccountSendButton from './sendButton';
import { gotoScreen } from 'store/screenActions';
import log from 'electron-log';
import { cardSpace, noShadow, align } from 'lib/styles';
import AccountPopup from './popup';
import AccountBalance from './balance';
import { Wei } from 'lib/types';
import IdentityIcon from './identityIcon';


const Render = ({ account, openAccount }) => {
    const styles = {
        card: {
            marginBottom: "6px",
            ...noShadow
        }
    };

    return (
    <Card style={styles.card}>
        <CardText>
            <Row>
                <Col xs={3}>
                    <div style={{display: 'flex'}}>
                        <IdentityIcon id={account.get('id')}/>
                        <AccountBalance balance={account.get('balance') || new Wei(0) } withAvatar={true} />
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
