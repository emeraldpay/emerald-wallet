import { fromTokens, transformToFullName, extractDisplayName, getFunctionSignature, mweiToWei, etherToWei } from './convert';
import BigNumber from "bignumber.js"

describe("Token Converter", () => {
    it("convert token number to value", () => {
        expect(fromTokens(1234, "0x08").toString()).toEqual("123400000000");
    });
    it("convert token number to value", () => {
        expect(fromTokens(1234, "0x08")).toEqual(new BigNumber("123400000000"));
    });
    it("convert token string to value", () => {
        expect(fromTokens("1234", "0x02").toString()).toEqual("123400");
    });
    it("convert token decimals to value", () => {
        expect(fromTokens("0.01", "0x08").toString()).toEqual("1000000");
    });
});

describe("Function Converter", () => {
    const balanceOf = {"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"type":"function"}
    const transfer = {"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"type":"function"}
    it("extract name from function", () => {
        expect(extractDisplayName("balanceOf")).toEqual("balanceOf");
    })
    it("extract name from function", () => {
        expect(extractDisplayName("balanceOf()")).toEqual("balanceOf");
    })
    it("get full name from ABI", () => {
        expect(transformToFullName(balanceOf)).toEqual('balanceOf(address)');
        expect(extractDisplayName(transformToFullName(balanceOf))).toEqual("balanceOf")
    })
    it("get full name from ABI", () => {
        expect(transformToFullName(transfer)).toEqual('transfer(address,uint256)');
    })
    it("get function signature from ABI", () => {
        expect(getFunctionSignature(transfer)).toEqual("a9059cbb");
    })
    it("get function signature from ABI", () => {
        expect(getFunctionSignature(balanceOf)).toEqual("70a08231");
    })
});

describe("Ether converters", () => {
    it("mweiToWei", () => {
        expect(mweiToWei(0).toString()).toBe('0');
        expect(mweiToWei(1).toString()).toBe('1000000');
        expect(mweiToWei(1561).toString()).toBe('1561000000');
        expect(mweiToWei(8591969).toString()).toBe('8591969000000');
        expect(mweiToWei(12.345678).toString()).toBe('12345678');
        expect(mweiToWei(12.3456789).toString()).toBe('12345679');
        expect(mweiToWei(12.3456780).toString()).toBe('12345678');
        expect(mweiToWei(12.3456782).toString()).toBe('12345678');
    });

    it("etherToWei", () => {
        expect(etherToWei(0).toString()).toBe('0');
        expect(etherToWei(1).toString()).toBe('1000000000000000000');
        expect(etherToWei(1234).toString(10)).toBe('1234000000000000000000');
        expect(etherToWei("1234.5678901234567").toString(10)).toBe('1234567890123456700000');
        expect(etherToWei("1234.567890123456789012").toString(10)).toBe('1234567890123456789012');
        expect(etherToWei("1234.5678901234567890123").toString(10)).toBe('1234567890123456789012');
        expect(etherToWei("1234.5678901234567890125").toString(10)).toBe('1234567890123456789012');
        expect(etherToWei("1234.5678901234567890126").toString(10)).toBe('1234567890123456789013');
    })
});