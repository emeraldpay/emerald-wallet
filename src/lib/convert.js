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
    var val="";
    for (var i=0;i<arrVals.length;i++) val += padLeft(arrVals[i],64);
    return {to: to, data: func+val};
}