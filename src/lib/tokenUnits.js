import BigNumber from 'bignumber.js';
import Immutable from 'immutable';
import { convert } from 'emerald-js';

// (whilei) I ran in into error trying to add these npm packages:
// $ npm install -S os-locale locale-currency
// $ npm run build ->
// > Module not found 'child_process', 'fs', and 'spawn-sync'.
// import osLocale from 'os-locale';
// import LocaleCurrency from 'locale-currency';

const { hexToBigNumber } = convert;

const ZERO = new BigNumber(0);
const ONE = new BigNumber(1);

// This could go somewhere else... maybe i18n?
// /**
//  * Render n as locale-ized currency.
//  * Currently hardcoded to USD. Would like to use OS localized eventually.
//  * e.g. 12345.6789 -> $12,345.67
//  * @param  {string|number} n      value to render as currency
//  * @param  {string} locale leave undefined for non-string for os defaults
//  * @return {string}        localized currency string including symbol ($/¥/etc) prefix
//  */
// export function renderAsCurrency(n, locale) {
//     n = +n; // ensure cast as number
//     if (typeof locale !== 'string') {
//         locale = 'en-us'; // osLocale.sync();
//     }
//     return n.toLocaleString(locale, {
//         style: 'currency',
//         currency: 'USD', // localeCurrency,
//         currencyDisplay: 'symbol',
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//     });
// }
// export const localeCurrency = osLocale((locale) => LocaleCurrency.getCurrency(locale));

export class TokenUnits extends Immutable.Record({ val: ZERO, divisor: ONE }) {
    constructor(val, decimal) {
        super({
            val: hexToBigNumber(val, ZERO),
            divisor: new BigNumber(10).pow(hexToBigNumber(decimal, ZERO)),
        });
    }
    getDecimalized(decimals) {
        return this.val.dividedBy(this.divisor).toFixed(5);
    }
}
