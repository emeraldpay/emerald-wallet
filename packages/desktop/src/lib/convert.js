// @flow
import BigNumber from 'bignumber.js';

/*
  Convert unix timestamp to time elapsed
*/
export function toDuration(timestamp) {
  let millis = Date.now() - (timestamp * 1000);
  const dur = [];
  const units = [
    { label: 'millis', mod: 1000 },
    { label: 'seconds', mod: 60 },
    { label: 'mins', mod: 60 },
    { label: 'hours', mod: 24 },
    { label: 'days', mod: 365 },
    { label: 'years', mod: 1000 },
  ];
    // calculate the individual unit values
  units.forEach((u) => {
    const val = millis % u.mod;
    millis = (millis - val) / u.mod;
    if (u.label === 'millis') { return; }
    if (val > 0) { dur.push({ label: u.label, val }); }
  });
  // convert object to string representation
  dur.toString = () => dur.reverse().slice(0, 2).map((d) => `${d.val} ${d.val === 1 ? d.label.slice(0, -1) : d.label}`).join(', ');
  return dur;
}

// TODO: Handle locales
export function toDate(timestamp) {
  return new Date(timestamp * 1000).toUTCString();
}

export function parseString(hex: string) {
  if (typeof hex !== 'string') {
    return null;
  }
  // TODO _very_ dumb implementation, and works only for ascii

  hex = hex.substring(2);
  const parts = hex.match(/.{64}/g);
  if (parts == null) {
    return '';
  }
  const lenIgnore = parts[0];
  const textSize: number = +parts[1];
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

export function mweiToWei(val: number | string | BigNumber) {
  const m = new BigNumber(10).pow(6);
  return new BigNumber(val).multipliedBy(m).decimalPlaces(0, BigNumber.ROUND_HALF_DOWN);
}

/**
 *
 * Estimate gas using trace_call result
 *
 */
export function estimateGasFromTrace(dataObj, trace): BigNumber {
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
    let { stateDiff } = (trace || {});
    stateDiff = stateDiff && (stateDiff[dataObj.from.toLowerCase()] || {}).balance['*'];
    if (stateDiff) {
      const fromState = new BigNumber(stateDiff.from);
      const toState = new BigNumber(stateDiff.to);
      estGas = fromState.minus(toState);
      estGas = (dataObj.from.toLowerCase() === dataObj.to.toLowerCase()) ? estGas : estGas.minus(value);
    }
    if (estGas.lt(0) || estGas.eq(gasLimit)) { estGas = null; }
  }
  return estGas;
}

export function etherToWei(val) {
  const m = new BigNumber(10).pow(18);
  return new BigNumber(val).multipliedBy(m).decimalPlaces(0, BigNumber.ROUND_HALF_DOWN);
}

export function transformToFullName(func) {
  const typeName = func.get('inputs').map((i) => i.get('type')).join();
  return `${func.get('name')}(${typeName})`;
}
