import BigNumber from 'bignumber.js';
import Immutable from 'immutable';
import { convert } from 'emerald-js';

const { hexToBigNumber } = convert;

const ZERO = new BigNumber(0);
const ONE = new BigNumber(1);

export default class TokenUnits extends Immutable.Record({ value: ZERO, decimals: ZERO }) {
    constructor(value, decimals) {
        super({
            value: hexToBigNumber(value, ZERO),
            decimals: hexToBigNumber(decimals, ZERO).toNumber(),
        });
    }

    getDecimalized() {
        const divisor = new BigNumber(10).pow(this.decimals);
        return this.value.dividedBy(divisor).toFixed(this.decimals);
    }
}
