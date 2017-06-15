import React from 'react';
import PropTypes from 'prop-types';
import Immutable from 'immutable';
import { connect } from 'react-redux';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { DescriptionList, DescriptionTitle, DescriptionData } from 'elements/dl';
import QRCode from 'qrcode.react';
import log from 'loglevel';
import { translate } from 'react-i18next';
import { cardSpace } from 'lib/styles';
import { accountPopupClose } from 'store/accountActions';


const TokenRow = ({ token }) => {
    const balance = token.get('balance') ? token.get('balance').getDecimalized() : '0';

    return (
        <div><span>{balance} {token.get('symbol')}</span></div>
    );
};
TokenRow.propTypes = {
    token: PropTypes.object.isRequired,
};

const Render = translate('accounts')(({ t, account, fiat, handleCloseAccountDialog, open }) => {
    const value = t('show.value', {value: account.get('balance') ? account.get('balance').getEther() : '?'});
    const pending = account.get('balancePending') ? `(${account.get('balancePending').getEther()} pending)` : null;

    return (
            <Dialog style={cardSpace} modal={false} open={open} onRequestClose={handleCloseAccountDialog}>
                <Row>
                    <Col xs={12}>
                        <h1>Add Ether</h1>
                        <FlatButton
                            label="Cancel"
                            primary={true}
                            onTouchTap={handleCloseAccountDialog}
                            icon={<FontIcon className="fa fa-close" />}
                          />
                    </Col>
                </Row>
                <Row>
                    <Col xs={8}>
                        <DescriptionList>
                            {account.get('description') && <div>
                            <DescriptionTitle>{t('show.description.title')}</DescriptionTitle>
                            <DescriptionData>{account.get('description')}</DescriptionData>
                            </div>}

                            <DescriptionTitle>{t('show.description.address')}</DescriptionTitle>
                            <DescriptionData>{account.get('id')}</DescriptionData>

                            <DescriptionTitle>{t('show.description.sentTransactions')}</DescriptionTitle>
                            <DescriptionData>{account.get('txcount') || '0'}</DescriptionData>

                            <DescriptionTitle>{t('show.description.etherBalance')}</DescriptionTitle>
                            <DescriptionData>{value}</DescriptionData>
                            <DescriptionData>{value} {pending}</DescriptionData>

                            <DescriptionTitle>{t('show.description.tokenBalance')}</DescriptionTitle>
                            <DescriptionData>
                                {account
                                    .get('tokens')
                                    .map((tok) =>
                                        <TokenRow token={tok} key={tok.get('address')}/>
                                )}
                            </DescriptionData>

                            <DescriptionTitle>Equivalent Values</DescriptionTitle>
                            <DescriptionData>
                                <div><span>BTC {fiat.btc}</span></div>
                                <div><span>USD {fiat.usd}</span></div>
                                <div><span>CNY {fiat.cny}</span></div>
                            </DescriptionData>

                        </DescriptionList>
                    </Col>
                    <Col xs={4} md={2} mdOffset={2}>
                        <QRCode value={account.get('id')} />
                    </Col>
                </Row>
            </Dialog>
    );
});

Render.propTypes = {
    account: PropTypes.object.isRequired,
    handleCloseAccountDialog: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
};

const AccountPopup = connect(
    (state, ownProps) => {
        const account = state.get('accountPopup', Immutable.fromJS());
        const open = account === {};

        let fiat = {};
        if (open) {
            const balance = account.get('balance');
            const rates = state.accounts.get('rates');
            if (rates && balance) {
                fiat = {
                    btc: balance.getFiat(rates.get('btc')),
                    eur: balance.getFiat(rates.get('eur')),
                    usd: balance.getFiat(rates.get('usd')),
                    cny: balance.getFiat(rates.get('cny')),
                };
            }
        }

        return {
            account,
            open,
            fiat,
        };
    },
    (dispatch, ownProps) => ({
        handleCloseAccountDialog: () => {
            log.debug('close popup');
            dispatch(accountPopupClose());
        },
    })
)(Render);

export default AccountPopup;
