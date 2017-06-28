import BigNumber from 'bignumber.js';
import ethUtil from 'ethereumjs-util';
import ethAbi from 'ethereumjs-abi';
import log from 'electron-log';

export function toNumber(quantity) {
    if (quantity == null) {
        return 0;
    }
    if (quantity === '0x') {
        return 0;
    }
    if (typeof quantity !== 'string') {
        quantity = quantity.toString();
    }
    return parseInt(quantity.substring(2), 16);
}

/*
  Convert unix timestamp to time elapsed
*/
export function toDuration(timestamp) {
    let millis = Date.now() - timestamp * 1000;
    const dur = [];
    const units = [
        { label: "millis",  mod: 1000 },
        { label: "seconds", mod: 60 },
        { label: "mins",    mod: 60 },
        { label: "hours",   mod: 24 },
        { label: "days",    mod: 365 },
        { label: "years",   mod: 1000 },
    ];
    // calculate the individual unit values
    units.forEach((u) => {
        const val = millis % u.mod;
        millis = (millis - val) / u.mod;
        if (u.label === 'millis')
            return;
        if (val > 0)
            dur.push({ label: u.label, val });
    });
    // convert object to string representation
    dur.toString = () =>
        dur.reverse().slice(0, 2).map((d) =>
            `${d.val} ${d.val === 1 ? d.label.slice(0, -1) : d.label}`
        ).join(', ');
    return dur;
}

//TODO: Handle locales
export function toDate(timestamp) {
    return new Date(timestamp).toJSON();
}

export function parseString(hex) {
    if (typeof hex !== 'string') {
        return null;
    }
    // TODO _very_ dumb implementation, and works only for ascii

    hex = hex.substring(2);
    const parts = hex.match(/.{64}/g);
    if (parts == null) {
        log.warn('Corrupted String data', hex);
        return '';
    }
    const lenIgnore = parts[0];
    const textSize = parts[1];
    const textData = hex.substring(64 + 64);
    let result = '';
    for (let i = 0; i < textSize; i++) {
        const pos = i * 2;
        result += String.fromCharCode(parseInt(textData[pos] + textData[pos + 1], 16));
    }
    return result;
}

export function getNakedAddress(address) {
    return address.toLowerCase().replace('0x', '');
}

export function padLeft(n, width, z) {
    z = z || '0';
    n += '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

export function getDataObj(to, func, arrVals) {
    let val = '';
    for (let i = 0; i < arrVals.length; i++) val += padLeft(arrVals[i], 64);
    return { to, data: func + val };
}

export function fromTokens(value, decimals) {
    return new BigNumber(value).times(new BigNumber(10).pow(decimals.substring(2)));
}

/**
 *
 * Estimate gas using trace_call result
 *
 */

export function estimateGasFromTrace(dataObj, trace) {
    const gasLimit = 2000000;
    const value = new BigNumber(dataObj.value);
    log.debug(dataObj);
    log.debug(trace);

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
            estGas = fromState.sub(toState).sub(value);
            log.debug('Start balance: ' + mweiToWei(fromState).toString(10));
            log.debug('End balance: ' + mweiToWei(toState).toString(10));
            log.debug(fromState.sub(toState).toString(10))
        }
        if (estGas.lt(0) || estGas.eq(gasLimit)) estGas = null;
    }
    return estGas;
}

export function mweiToWei(val) {
    const m = new BigNumber(10).pow(6);
    return new BigNumber(val).mul(m).round(0, BigNumber.ROUND_HALF_DOWN);
}

export function etherToWei(val) {
    const m = new BigNumber(10).pow(18);
    return new BigNumber(val).mul(m).round(0, BigNumber.ROUND_HALF_DOWN);
}

export function toHex(val) {
    const hex = val.toString(16);
    return `0x${(hex.length % 2 !== 0 ? `0${hex}` : hex)}`;
}

export function parseHexQuantity(val, defaultValue) {
    if (val == null || val === '0x') {
        return defaultValue;
    }
    return new BigNumber(val, 16);
}

export function transformToFullName(func) {
    const typeName = func.get('inputs').map((i) => i.get('type')).join();
    return `${func.get('name')}(${typeName})`;
}

export function getFunctionSignature(func) {
    const fullName = transformToFullName(func);
    return ethUtil.sha3(fullName).toString('hex').slice(0, 8);
}

export function functionToData(func, inputs) {
    const types = [];
    const values = [];
    func.get('inputs').forEach((input) => {
        types.push(input.get('type'));
        values.push(inputs[input.get('name')]);
    });
    const data = Buffer.concat([
        ethAbi.methodID(func.get('name'), types),
        ethAbi.rawEncode(types, values)]
    ).toString('hex');
    return `0x${data}`;
}

export function dataToParams(func, data) {
    data = new Buffer(data.replace('0x', ''), 'hex');
    const types = func.get('outputs').map((output) => output.get('type')).toArray();
    const params = ethAbi.rawDecode(types, data);
    return func.get('outputs').map((o, i) => ({
        type: o.get('type'),
        name: o.get('name'),
        value: (params[i] instanceof BigNumber) ? params[i].toString() : params[i],
    }));
}
