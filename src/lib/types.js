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