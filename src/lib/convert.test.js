import BigNumber from 'bignumber.js';
import Immutable from 'immutable';
import { toHex, fromTokens, mweiToWei, etherToWei, estimateGasFromTrace } from './convert';
import { transformToFullName, functionToData, dataToParams, getFunctionSignature } from './convert';

describe('Hex Converter', () => {
    it('convert decimal number to hex', () => {
        expect(toHex(10000000000)).toEqual('0x02540be400');
    });
});

describe('Token Converter', () => {
    it('convert token number to value', () => {
        expect(fromTokens(1234, '0x08').toString()).toEqual('123400000000');
    });
    it('convert token number to value', () => {
        expect(fromTokens(1234, '0x08')).toEqual(new BigNumber('123400000000'));
    });
    it('convert token string to value', () => {
        expect(fromTokens('1234', '0x02').toString()).toEqual('123400');
    });
    it('convert token decimals to value', () => {
        expect(fromTokens('0.01', '0x08').toString()).toEqual('1000000');
    });
});

const balanceOf = {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    payable: false,
    type: 'function',
};
const transfer = {
    constant: false,
    inputs: [{ name: '_to', type: 'address' }, { name: '_value', type: 'uint256' }],
    name: 'transfer',
    outputs: [{ name: 'success', type: 'bool' }],
    payable: false,
    type: 'function',
};

describe('Function Converter', () => {
    it('get full name from ABI', () => {
        expect(transformToFullName(Immutable.fromJS(balanceOf))).toEqual('balanceOf(address)');
    });
    it('get full name from ABI', () => {
        expect(transformToFullName(Immutable.fromJS(transfer))).toEqual('transfer(address,uint256)');
    });
    it('get function signature from ABI', () => {
        expect(getFunctionSignature(Immutable.fromJS(transfer))).toEqual('a9059cbb');
    });
    it('get function signature from ABI', () => {
        expect(getFunctionSignature(Immutable.fromJS(balanceOf))).toEqual('70a08231');
    });
});

describe('Function to Data Converter', () => {
    const balanceArgs = { _owner: '0xbb0000000aaaa000000000000000000000000bb' };
    const transferArgs = { _to: '0xaa00000000bbbb000000000000000000000000aa', _value: 10 };
    it('convert function to data', () => {
        expect(functionToData(Immutable.fromJS(balanceOf), balanceArgs))
        .toEqual('0x70a082310000000000000000000000000bb0000000aaaa000000000000000000000000bb');
    });
    it('convert function to data', () => {
        expect(functionToData(Immutable.fromJS(transfer), transferArgs))
        .toEqual('0xa9059cbb000000000000000000000000aa00000000bbbb000000000000000000000000aa000000000000000000000000000000000000000000000000000000000000000a');
    });
    it('ignore bad args', () => {
        const badArgs = { _owner: '0xbb0000000aaaa000000000000000000000000bb', _elaine: 123 };
        expect(functionToData(Immutable.fromJS(balanceOf), badArgs))
        .toEqual('0x70a082310000000000000000000000000bb0000000aaaa000000000000000000000000bb');
    });
});

describe('Data to Params Converter', () => {
    const fxn = { inputs: [{ name: '_owner', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ name: 'balance', type: 'uint32' }],
    };
    let data = '000000000000000000000000000000000000000000000000000000000000002a';
    it('convert data to number', () => {
        expect(dataToParams(Immutable.fromJS(fxn), data).last().value.toString()).toEqual('42');
    });
    it('convert data to number', () => {
        data = '0x000000000000000000000000000000000000000000000000000000000000002a';
        expect(dataToParams(Immutable.fromJS(fxn), data).last().value.toString()).toEqual('42');
    });
    it('convert data to array of numbers', () => {
        fxn.outputs = [{ name: 'balance', type: 'uint256[]' }];
        data = '00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003';
        expect(dataToParams(Immutable.fromJS(fxn), data).last().value.toString()).toEqual('1,2,3');
    });
    it('convert data to array of outputs', () => {
        fxn.outputs = [{ name: 'balance', type: 'uint32' },
                          { name: 'success', type: 'bool' }];
        data = '0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002a';
        expect(dataToParams(Immutable.fromJS(fxn), data).size).toEqual(2);
        expect(dataToParams(Immutable.fromJS(fxn), data).last().value).toEqual(false);
    });
});

describe('Ether converters', () => {
    it('mweiToWei', () => {
        expect(mweiToWei(0).toString()).toBe('0');
        expect(mweiToWei(1).toString()).toBe('1000000');
        expect(mweiToWei(1561).toString()).toBe('1561000000');
        expect(mweiToWei(8591969).toString()).toBe('8591969000000');
        expect(mweiToWei(12.345678).toString()).toBe('12345678');
        expect(mweiToWei(12.3456789).toString()).toBe('12345679');
        expect(mweiToWei(12.3456780).toString()).toBe('12345678');
        expect(mweiToWei(12.3456782).toString()).toBe('12345678');
    });

    it('etherToWei', () => {
        expect(etherToWei(0).toString()).toBe('0');
        expect(etherToWei(1).toString()).toBe('1000000000000000000');
        expect(etherToWei(1234).toString(10)).toBe('1234000000000000000000');
        expect(etherToWei('1234.5678901234567').toString(10)).toBe('1234567890123456700000');
        expect(etherToWei('1234.567890123456789012').toString(10)).toBe('1234567890123456789012');
        expect(etherToWei('1234.5678901234567890123').toString(10)).toBe('1234567890123456789012');
        expect(etherToWei('1234.5678901234567890125').toString(10)).toBe('1234567890123456789012');
        expect(etherToWei('1234.5678901234567890126').toString(10)).toBe('1234567890123456789013');
    });
});

describe('Gas estimator', () => {
    const from = '0xTESTADDRESSFROM';
    const to = '0xTESTADDRESSTO';
    let value = '0x038d7ea4c68000';
    let gasPrice = '0x04e3b29200';

    it('estimate call', () => {
        const trace = { output: '0x',
            stateDiff: { '0xtestaddressto': { balance: { '*': { from: '0x21526d0318ec01', to: '0x24dfeba7df6c01' } }, code: '=', nonce: '=', storage: {} },
                '0xtestaddressfrom': { balance: { '*': { from: '0x98155a85ae35a03e0', to: '0x9815089c5ee3af3e0' } }, code: '=', nonce: { '*': { from: '0x1f', to: '0x20' } }, storage: {} },
                '0xef24b72ed3164673f4837dd61692657d48d818b8': { balance: { '*': { from: '0x34696a249798214e0c', to: '0x34696bb5ade879de0c' } }, code: '=', nonce: '=', storage: {} } },
            trace: [{ action: { callType: 'call', from, gas: '0x0', input: '0x', to, value }, result: { gasUsed: '0x0', output: '0x' }, subtraces: 0, traceAddress: [], type: 'call' }],
            vmTrace: null };
        const testData = {
            from,
            gasPrice,
            gas: '0x5208',
            to,
            value,
            data: '0x',
        };
        expect(estimateGasFromTrace(testData, trace)).toEqual(new BigNumber('441000000000000'));
        expect(estimateGasFromTrace(testData, trace).div(gasPrice).toString(10)).toEqual('21000');
    });
    it('estimate call with lower gas', () => {
        gasPrice = '0xc845880';
        const trace = { stateDiff: {
            '0xtestaddressfrom': { balance: { '*': { from: '0x98155a85ae35a03e0', to: '0x9815216d97617bfe0' } }, code: '=', nonce: { '*': { from: '0x1f', to: '0x20' } }, storage: {} },
            '0xdf7d7e053933b5cc24372f878c90e62dadad5d42': { balance: { '*': { from: '0x491a8fab8806bc7698', to: '0x491a8faf8acf383a98' } }, code: '=', nonce: '=', storage: {} } },
            vmTrace: null };
        const testData = {
            from,
            gasPrice,
            gas: '0x5208',
            to,
            value,
            data: '0x',
        };
        expect(estimateGasFromTrace(testData, trace)).toEqual(new BigNumber('441000000000000').div(100));
        expect(estimateGasFromTrace(testData, trace).div(gasPrice).toString(10)).toEqual('21000');
    });
    it('handle null result', () => {
        const testData = {
            from,
            gasPrice,
            gas: '0x5208',
            to,
            value,
            data: '0x',
        };
        expect(estimateGasFromTrace(testData, null)).toEqual(null);
    });
    it('estimate contract call', () => {
        value = '0x0';
        const trace = { output: '0x',
            stateDiff: { '0x0000000000000000000000000000000000000000': { balance: { '*': { from: '0x26fd2a0d6c08be2d22c', to: '0x26fd29f40784dcf222c' } }, code: '=', nonce: { '*': { from: '0x0', to: '0x1' } }, storage: {} },
                '0xtestaddressto': { balance: { '+': '0x0' }, code: { '+': '0x' }, nonce: { '+': '0x0' }, storage: {} },
                '0xtestaddressfrom': { balance: { '*': { from: '0x98155a85ae35a03e0', to: '0x981541212a54653e0' } }, code: '=', nonce: { '*': { from: '0x1f', to: '0x20' } } } },
            trace: [{ action: { callType: 'call', from: '0x0000000000000000000000000000000000000000', gas: '0x0', input: '0x12065fe0', to: '0x6fc11878336e049855c93da94d89837b4a391f19', value: '0x0' }, result: { gasUsed: '0x0', output: '0x' }, subtraces: 0, traceAddress: [], type: 'call' }],
            vmTrace: null };
        const testData = {
            from,
            gasPrice,
            gas: '0x5208',
            to,
            value,
            data: '0x12065fe0',
        };
        expect(estimateGasFromTrace(testData, trace)).toEqual(new BigNumber(446712000000000));
    });
});
