import BigNumber from "bignumber.js"
import ethUtil from 'ethereumjs-util'

export function toNumber(quantity) {
    return parseInt(quantity.substring(2), 16)
}


export function parseString(hex) {
    if (typeof hex !== 'string') {
        return null
    }
    //TODO _very_ dumb implementation, and works only for ascii

    hex = hex.substring(2);
    const parts = hex.match(/.{64}/g);
    const len_ignore = parts[0];
    const text_size = parts[1];
    const text_data = hex.substring(64 + 64);
    let result = '';
    for (let i = 0; i < text_size; i++) {
        const pos = i * 2;
        result += String.fromCharCode(parseInt(text_data[pos] + text_data[pos + 1], 16))
    }
    return result
}

export function getNakedAddress(address) {
    return address.toLowerCase().replace('0x', '');
}

export function padLeft(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

export function getDataObj(to, func, arrVals) {
    let val="";
    for (var i=0;i<arrVals.length;i++) val += padLeft(arrVals[i],64);
    return {to: to, data: func+val};
}

export function fromTokens(value, decimals) {
    return new BigNumber(value).times(new BigNumber(10).pow(decimals.substring(2)));
}

/**
 * Create full function/event name from json abi
 *
 * @method transformToFullName
 * @param {Object} json-abi
 * @return {String} full fnction/event name
 */
export function transformToFullName(json) {
    if (json.name.indexOf('(') !== -1) {
        return json.name;
    }

    let typeName = json.inputs.map(function (i) {
        return i.type;
    }).join();
    return json.name + '(' + typeName + ')';
};

/**
 * Get display name of contract function
 *
 * @method extractDisplayName
 * @param {String} name of function/event
 * @returns {String} display name for function/event eg. multiply(uint256) -> multiply
 */
export function extractDisplayName(name) {
    let length = name.indexOf('(');
    return length !== -1 ? name.substr(0, length) : name;
};

export function getFunctionSignature (func) {
    let fullName = transformToFullName(func)
    return ethUtil.sha3(fullName).toString('hex').slice(0, 8);
};

/**
 *
 * Estimate gas using trace_call result
 *
 */
/*
export function estimateGasFromTrace (dataObj, trace) {
    let gasLimit = 2000000;
    dataObj.gasPrice = '0x01';
    dataObj.gas = '0x' + new BigNumber(gasLimit).toString(16);

    function recurCheckBalance(ops) {
        var startVal = 24088 + ops[0].cost;
        for (var i = 0; i < ops.length - 1; i++) {
            var remainder = startVal - (gasLimit - ops[i].ex.used);
            if (ops[i + 1].sub && ops[i + 1].sub.ops.length && gasLimit - ops[i + 1].cost > remainder) startVal += gasLimit - ops[i + 1].cost - startVal;else if (ops[i + 1].cost > remainder) startVal += ops[i + 1].cost - remainder;
        }
        if (!dataObj.to) startVal += 37000; //add 37000 for contract creation
        startVal = startVal == gasLimit ? -1 : startVal;
        return startVal;
    }

    if (trace.vmTrace && trace.vmTrace.ops.length) {
        var result = trace.vmTrace.ops;
        var estGas = recurCheckBalance(result);
        estGas = estGas < 0 ? -1 : estGas + 5000;
    } else {
        var stateDiff = trace.stateDiff;
        stateDiff = stateDiff[dataObj.from.toLowerCase()]['balance']['*'];
        if (stateDiff) var estGas = new BigNumber(stateDiff['from']).sub(new BigNumber(stateDiff['to'])).sub(new BigNumber(dataObj.value));else var estGas = new BigNumber(-1);
        if (estGas.lt(0) || estGas.eq(gasLimit)) estGas = -1;
    }
    return estGas;
};
*/