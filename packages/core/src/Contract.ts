import { Interface, JsonFragment } from '@ethersproject/abi';

export class Contract {
  public readonly contract: Interface;

  constructor(abi: JsonFragment[]) {
    this.contract = new Interface(abi);
  }

  public functionToData(name: string, inputs: Record<string, unknown>): string {
    const values = this.contract.getFunction(name).inputs.map((input) => inputs[input.name]);

    return this.contract.encodeFunctionData(name, values);
  }
}
