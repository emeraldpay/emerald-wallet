// @flow
import { EthRpc, convert } from 'emerald-js';
import BigNumber from 'bignumber.js';

type Call = {
    method: string,
    params: Array<any>,
}

type Transaction = {
    from: string,
    to: string,
    gas: string,
    gasPrice: string,
    value: string,
    data: string,
}

interface ITracer {
    buildRequest(): Call;
    estimateGas(trace: any): ?BigNumber;
}

/**
 * Every Ethereum implementation has eth_estimateGas
 */
class CommonCallTracer implements ITracer {
    tx: Transaction;

    constructor(tx: Transaction) {
        this.tx = tx;
    }

    buildRequest(): Call {
        const params = [{
            from: this.tx.from,
            to: this.tx.to,
            gas: this.tx.gas,
            gasPrice: this.tx.gasPrice,
            value: this.tx.value,
            data: this.tx.data,
        }];
        params.push('latest');

        return {
            method: 'eth_estimateGas',
            params,
        };
    }

    estimateGas(trace: any): BigNumber | null {
        return convert.hexToBigNumber(trace);
    }
}

/**
 * Parity has trace_call API method
 */
export class ParityTracer implements ITracer {
    tx: Transaction;

    constructor(tx: Transaction) {
        if (!tx) {
            throw new Error(`Invalid value of tx ${tx}`);
        }
        this.tx = tx;
    }

    buildRequest(): Call {
        const params = [{
            from: this.tx.from,
            to: this.tx.to,
            gas: this.tx.gas,
            gasPrice: this.tx.gasPrice,
            value: this.tx.value,
            data: this.tx.data,
        }];
        params.push(['trace', 'stateDiff']);
        params.push('latest');

        return {
            method: 'trace_call',
            params,
        };
    }

    estimateGas(trace: any): BigNumber | null {
        if (!trace) {
            return new BigNumber('21000');
        }
        const gasEst = ParityTracer.estimateGasFromTrace(this.tx, trace);
        if (!gasEst) {
            return null;
        }
        return gasEst.div(convert.hexToBigNumber(this.tx.gasPrice));
    }

    static estimateGasFromTrace(dataObj, trace): BigNumber {
        const gasLimit = 2000000;
        const value = new BigNumber(dataObj.value);

        const recurCheckBalance = function (ops) {
            let startVal = 24088 + ops[0].cost;
            for (let i = 0; i < ops.length - 1; i++) {
                const remainder = startVal - (gasLimit - ops[i].ex.used);
                if (ops[i + 1].sub && ops[i + 1].sub.ops.length && gasLimit - ops[i + 1].cost > remainder) {
                    startVal += gasLimit - ops[i + 1].cost - startVal;
                } else if (ops[i + 1].cost > remainder) {
                    startVal += ops[i + 1].cost - remainder;
                }
            }
            if (!dataObj.to) startVal += 37000; // add 37000 for contract creation
            startVal = startVal === gasLimit ? -1 : startVal;
            return startVal;
        };

        let estGas = new BigNumber(-1);
        if ((trace || {}).vmTrace && trace.vmTrace.ops.length) {
            const result = trace.vmTrace.ops;
            estGas = recurCheckBalance(result);
            estGas = estGas < 0 ? -1 : estGas + 5000;
        } else {
            let stateDiff = (trace || {}).stateDiff;
            stateDiff = stateDiff && (stateDiff[dataObj.from.toLowerCase()] || {}).balance['*'];
            if (stateDiff) {
                const fromState = new BigNumber(stateDiff.from);
                const toState = new BigNumber(stateDiff.to);
                estGas = fromState.sub(toState);
                estGas = (dataObj.from.toLowerCase() === dataObj.to.toLowerCase()) ? estGas : estGas.sub(value);
            }
            if (estGas.lt(0) || estGas.eq(gasLimit)) {
                estGas = null;
            }
        }
        return estGas;
    }

}

/**
 * Ethereum Classic Geth implementation has eth_callTrace method
 */
class ClassicGethTracer implements ITracer {
    tx: Transaction;

    constructor(tx: Transaction) {
        this.tx = tx;
    }
    buildRequest(): Call {
        const params = [{
            from: this.tx.from,
            to: this.tx.to,
            gas: this.tx.gas,
            gasPrice: this.tx.gasPrice,
            value: this.tx.value,
            data: this.tx.data,
        }];
        params.push('latest');

        return {
            method: 'eth_traceCall',
            params,
        };
    }

    estimateGas(trace): BigNumber {
        return convert.hexToBigNumber(trace.gas);
    }
}

/**
 * Returns function witch construct particular "tracer" instance
 * in accordance with supported JSON-RPC API
 *
 * @param ethRpc
 */
export function detect(ethRpc: EthRpc) : Promise<any> {
    return ethRpc.raw('trace_call', [])
        .catch((error) => {
            if (error.code === -32601) {
                // method not found, try another
                return ethRpc.raw('eth_traceCall', [])
                    .then(() => (tx) => new ClassicGethTracer(tx))
                    .catch((err) => {
                        if (err.code === -32601) {
                            return (tx) => new CommonCallTracer(tx);
                        }
                        throw err;
                    });
            } else if (error.code === -32602) {
                // method found but wrong params, it's Ok
                return (tx) => new ParityTracer(tx);
            }
            throw error;
        });
}
