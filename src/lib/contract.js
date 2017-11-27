/* @flow */
import ethAbi from 'ethereumjs-abi';

type AbiFunction = {
    name: string,
    inputs: any,
    outputs: any,
};

type ContractAbi = Array<AbiFunction>;

export default class Contract {
    abi: ContractAbi;

    constructor(abi: ContractAbi) {
      this.abi = abi;
    }

    getFunction(name: string): ?AbiFunction {
      return this.abi.find((f) => (f.name === name));
    }

    functionToData(name: string, inputs): string {
      const func = this.getFunction(name);
      if (func) {
        const types = [];
        const values = [];
        func.inputs.forEach((input) => {
          types.push(input.type);
          values.push(inputs[input.name]);
        });
        const data = Buffer.concat([
          ethAbi.methodID(func.name, types),
          ethAbi.rawEncode(types, values)]
        ).toString('hex');
        return `0x${data}`;
      }
      throw new Error(`Function ${name} not found in ABI`);
    }
}
