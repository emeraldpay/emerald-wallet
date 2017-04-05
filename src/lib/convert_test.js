import { fromTokens, transformToFullName, extractDisplayName, getFunctionSignature } from './convert'
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
})