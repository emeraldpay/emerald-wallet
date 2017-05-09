import BigNumber from 'bignumber.js';
import Immutable from 'immutable';
import { parseHexQuantity } from './convert';

const ETHER = new BigNumber(10).pow(18);
const MWEI = new BigNumber(10).pow(6);

const ZERO = new BigNumber(0);
const ONE = new BigNumber(1);

export class Wei extends Immutable.Record({ val: ZERO }) {
    constructor(val) {
        super({
            val: parseHexQuantity(val, ZERO),
        });
    }
    getEther() {
        return this.val.dividedBy(ETHER).toFixed(5);
    }
    getMwei() {
        return this.val.dividedBy(MWEI).toFixed(5);
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
