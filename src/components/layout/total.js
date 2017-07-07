import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import Immutable from 'immutable';
import { Wei, renderAsCurrency } from 'lib/types';

const Render = ({ total, fiat, showFiat, currentLocaleCurrency }) => {
    const styleTitle = {
    };
    const styleTotal = {
        fontSize: '40px',
    };
    const fiatSubtitle = {
        // fontSize: '1.1rem',
    };
    const valueDisplay = {
        marginLeft: '1rem',
        marginRight: '1rem',
    };
    console.log(showFiat)

    return (
        <div>
            <Row>
                <Col xs={12} style={styleTitle}>Total</Col>
            </Row>
            <Row>
                <Col xs={12} style={styleTotal}>
                    {total} ETC
                </Col>
            </Row>
            {showFiat && <Row>
                <Col xs={12} style={fiatSubtitle}>
                    <span style={valueDisplay}>
                        {renderAsCurrency(fiat.total.localized)}
                    </span>
                    &bull;
                    <span style={valueDisplay}>
                        {fiat.rate.localized ? renderAsCurrency(fiat.rate.localized) : '?'} ETC/{currentLocaleCurrency.toUpperCase()}
                    </span>
                </Col>
            </Row>}
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

        // Sum of balances of all known accounts.
        const total = state.accounts.get('accounts', Immutable.List()).map((account) => {
            if (account.get('balance')) {
                return account.get('balance');
            }
            return new Wei(0);
        }).reduce((t, v) => t.plus(v), new Wei(0));
        const totalEther = total.getEther();

        let fiat = {};
        let r = {};
        if (rates && total) {
            r = {
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

        // Try to localize, with USD defaults.
        let currentLocaleCurrency = 'USD'; // prod: localeCurrency localized from OS.

        const localeCurrencyRate = fiat.rate[currentLocaleCurrency.toLowerCase()];
        // If we are able to get the rate for the local currency:
        if (typeof localeCurrencyRate === 'number') {
            fiat.total.localized = total.getFiat(localeCurrencyRate);
            fiat.rate.localized = localeCurrencyRate;

        // Fallback to USD.
        } else {
            currentLocaleCurrency = 'USD';
            fiat.total.localized = fiat.total.usd;
            fiat.rate.localized = +fiat.rate.usd; // fiat.pair.usd;
        }

        const network = (state.network.get('chain').get('name') || '').toLowerCase();

        return {
            total: +totalEther,
            fiat,
            currentLocaleCurrency,
            showFiat: (network === 'mainnet'),
        };
    },
    (dispatch, ownProps) => ({})
)(Render);

export default Total;
