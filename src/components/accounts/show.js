import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, CardActions, CardText } from 'material-ui/Card';
import { AddressAvatar } from 'elements/dl';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import QRCode from 'qrcode.react';
import log from 'loglevel';
import { translate } from 'react-i18next';
import { cardSpace } from 'lib/styles';
import { gotoScreen } from 'store/screenActions';

const TokenRow = ({ token }) => {
    const balance = token.get('balance') ? token.get('balance').getDecimalized() : '0';

    return (
        <div><span>{balance} {token.get('symbol')}</span></div>
    );
};
TokenRow.propTypes = {
    token: PropTypes.object.isRequired,
};

const Render = translate('accounts')(({ t, account, rates, editAccount, createTx, showModal }) => {
    const value = t('show.value', {value: account.get('balance') ? account.get('balance').getEther() : '?'});
    const pending = account.get('balancePending') ? `(${account.get('balancePending').getEther()} pending)` : null;

    return (
        <Card style={cardSpace}>
            <CardText>
            Dashboard button
            </CardText>
            <CardText>
                <Row>
                    <Col xs={8}>
                        <h2>
                            {value}
                            {pending && <FlatButton label={`${pending} pending`} primary={true} />}
                        </h2>
                        {account.get('balance') ? `$${account.get('balance').getFiat(rates.get('usd'))}` : ''}

                        <AddressAvatar
                            secondary={account.get('id')}
                            tertiary={account.get('description')}
                            primary={account.get('name')}
                            onClick={editAccount}
                        />
                    </Col>
                    <Col xs={4} md={2} mdOffset={2}>
                        <QRCode value={account.get('id')} />
                    </Col>
                </Row>
            </CardText>
            <CardActions>
                <FlatButton label="ADD ETHER"
                            onClick={showModal}
                            icon={<FontIcon className="fa fa-qrcode" />}/>
                <FlatButton label={t('show.send')}
                            onClick={createTx}
                            icon={<FontIcon className="fa fa-arrow-circle-o-right" />}/>
            </CardActions>

        </Card>
    );
});

Render.propTypes = {
    account: PropTypes.object.isRequired,
    createTx: PropTypes.func.isRequired,
    editAccount: PropTypes.func.isRequired,
};

const AccountShow = connect(
    (state, ownProps) => {
        const rates = state.accounts.get('rates');
        const balance = ownProps.account.get('balance');
        let fiat = {};
        if (rates && balance) {
            fiat = {
                btc: balance.getFiat(rates.get('btc')),
                eur: balance.getFiat(rates.get('eur')),
                usd: balance.getFiat(rates.get('usd')),
                cny: balance.getFiat(rates.get('cny')),
            };
        }
        return {
            fiat,
            rates,
        };
    },
    (dispatch, ownProps) => ({
        createTx: () => {
            const account = ownProps.account;
            log.debug('create tx from', account.get('id'));
            dispatch(gotoScreen('create-tx', account));
        },
        editAccount: () => {

        }
    })
)(Render);

export default AccountShow;
