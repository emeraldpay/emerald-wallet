import BigNumber from 'bignumber.js';
import Immutable from 'immutable';
// (whilei) I ran in into error trying to add these npm packages:
// $ npm install -S os-locale locale-currency
// $ npm run build ->
// > Module not found 'child_process', 'fs', and 'spawn-sync'.
// import osLocale from 'os-locale';
// import LocaleCurrency from 'locale-currency';
import { parseHexQuantity } from './convert';

const ETHER = new BigNumber(10).pow(18);
const MWEI = new BigNumber(10).pow(6);

const ZERO = new BigNumber(0);
const ONE = new BigNumber(1);

// This could go somewhere else... maybe i18n?
/**
 * Render n as locale-ized currency.
 * Currently hardcoded to USD. Would like to use OS localized eventually.
 * e.g. 12345.6789 -> $12,345.67
 * @param  {string|number} n      value to render as currency
 * @param  {string} locale leave undefined for non-string for os defaults
 * @return {string}        localized currency string including symbol ($/¥/etc) prefix
 */
export function renderAsCurrency(n, locale) {
    n = +n; // ensure cast as number
    if (typeof locale !== 'string') {
        locale = 'en-us'; // osLocale.sync();
    }
    return n.toLocaleString(locale, {
        style: 'currency',
        currency: 'USD', // localeCurrency,
        currencyDisplay: 'symbol',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
// export const localeCurrency = osLocale((locale) => LocaleCurrency.getCurrency(locale));

export class Wei extends Immutable.Record({ val: ZERO }) {
    constructor(val) {
        if (typeof val === 'string' || val === null) {
            super({
                val: parseHexQuantity(val, ZERO),
            });
        } else if (typeof val === 'number') {
            super({
                val: new BigNumber(val),
            });
        } else {
            super({
                val,
            });
        }
    }

    getEther(decimals) {
        if (typeof decimals === 'undefined' || decimals === null) {
            decimals = 5;
        }
        return this.val.dividedBy(ETHER).toFixed(decimals);
    }
    getMwei() {
        return this.val.dividedBy(MWEI).toFixed(5);
    }

    mul(bigNumber) {
        return new Wei(this.val.mul(bigNumber));
    }

    plus(another) {
        return new Wei(this.val.plus(another.val));
    }
    getFiat(r, decimals) {
        if (typeof (r) === 'undefined' || r === null) {
            r = 0;
        }
        if (typeof decimals === 'undefined' || decimals === null) {
            decimals = 2;
        }
        const rate = new BigNumber(r.toString());
        return this.val.dividedBy(ETHER).mul(rate).toFixed(decimals);
    }
    sub(another) {
        return new Wei(this.val.sub(another.val));
    }
}

export class TokenUnits extends Immutable.Record({ val: ZERO,
    divisor: ONE }) {
    constructor(val, decimal) {
        super({
            val: parseHexQuantity(val, ZERO),
            divisor: new BigNumber(10).pow(parseHexQuantity(decimal, ZERO)),
        });
    }
    getDecimalized(decimals) {
        return this.val.dividedBy(this.divisor).toFixed(5);
    }
}
