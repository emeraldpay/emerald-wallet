import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Immutable from 'immutable';
// import { Wei } from 'lib/types';

import { Wei } from 'emerald-js';
import { Currency } from '../../../lib/currency';


const Render = ({ total, fiat, showFiat, currentLocaleCurrency }) => {
    const styleTotal = {
        fontSize: '26px',
        lineHeight: '36px',
        color: '#47B04B',
        marginLeft: '10px',
    };

    const valueDisplay = {
        lineHeight: '36px',
        fontSize: '14px',
        color: '#747474',
        marginLeft: '1rem',
        marginRight: '1rem',
    };

    const totalAmount = Currency.format(fiat.total.localized, currentLocaleCurrency);
    const rateAmount = fiat.rate.localized ? Currency.format(fiat.rate.localized, currentLocaleCurrency) : '?';

    return (
        <div style={{display: 'flex'}}>
            <div style={styleTotal}>~{ total } ETC</div>
            {showFiat &&
                <div style={valueDisplay}>
                    { totalAmount } / { rateAmount } for 1 ETC
                </div>
            }
        </div>
    );
};

Render.propTypes = {
    total: PropTypes.number.isRequired,
    fiat: PropTypes.object.isRequired,
    currentLocaleCurrency: PropTypes.string.isRequired,
    showFiat: PropTypes.bool.isRequired,
};

const Total = connect(
    (state, ownProps) => {
        // (whilei) I left hardcoded rates because they might be worth throwing in a popup, feed, sidebar, or
        // some other kind of sexy sneaky UI down the road.

        const rates = state.accounts.get('rates');
        const currentLocaleCurrency = state.accounts.get('localeCurrency');
        const localeCurrencyRate = state.accounts.get('localeRate');

        // Sum of balances of all known accounts.
        const total = state.accounts.get('accounts', Immutable.List())
            .map((account) => (account.get('balance') ? account.get('balance') : Wei.ZERO))
            .reduce((t, v) => t.plus(v), Wei.ZERO);
        const totalEther = total.getEther();

        let fiat = {};
        if (rates && total) {
            const r = {
                btc: rates.get('btc'),
                eur: rates.get('eur'),
                usd: rates.get('usd'),
                cny: rates.get('cny'),
            };
            fiat = {
                total: {
                    btc: total.getFiat(r.btc),
                    eur: total.getFiat(r.eur),
                    usd: total.getFiat(r.usd),
                    cny: total.getFiat(r.cny),
                },
                rate: r,
            };
        }

        // If we are able to get the rate for the local currency:
        if (typeof localeCurrencyRate === 'number') {
            fiat.total.localized = total.getFiat(localeCurrencyRate);
            fiat.rate.localized = localeCurrencyRate;

        // Fallback to USD.
        } else {
            fiat.total.localized = fiat.total.usd;
            fiat.rate.localized = +fiat.rate.usd; // fiat.pair.usd;
        }

        const chain = (state.launcher.get('chain').get('name') || '').toLowerCase();

        return {
            total: +totalEther,
            fiat,
            currentLocaleCurrency,
            showFiat: (chain === 'mainnet'),
        };
    },
    (dispatch, ownProps) => ({})
)(Render);

export default Total;
