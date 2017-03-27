import BigNumber from "bignumber.js"
import Immutable from 'immutable'

const ETHER = new BigNumber(10).pow(18);

export class Wei extends Immutable.Record({val: new BigNumber(0)}) {
    constructor(val) {
        super({val: new BigNumber(val.substring(2), 16)});
    }
    getEther() {
        return this.val.dividedBy(ETHER).toFixed(5)
    }
}

export class TokenUnits extends Immutable.Record({val: new BigNumber(0), 
                                            divisor: new BigNumber(0)}) {
    constructor(val, decimal) {
        super({val: new BigNumber(val.substring(2) || "0", 16),
                divisor: new BigNumber(10).pow(decimal.substring(2))});
    }
    getDecimalized(decimals) {
        return this.val.dividedBy(this.divisor).toFixed(5)
    }
}