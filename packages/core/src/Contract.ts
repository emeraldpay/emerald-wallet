/*
Copyright 2019 ETCDEV GmbH
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import {methodID, rawEncode} from 'ethereumjs-abi';

export interface IAbiFunction {
  name: string;
  inputs: any[];
  outputs: any[];
}

type ContractAbi = IAbiFunction[];

export class Contract {
  public abi: ContractAbi;

  constructor(abi: ContractAbi) {
    this.abi = abi;
  }

  public getFunction(name: string): IAbiFunction {
    const found = this.abi.filter((f) => (f.name === name));
    if (found.length > 0) {
      return found[0];
    }
    throw Error("Function not found: " + name);
  }

  public functionToData(name: string, inputs: any): string {
    const func = this.getFunction(name);
    if (func) {
      const types: any[] = [];
      const values: any[] = [];
      func.inputs.forEach((input) => {
        types.push(input.type);
        values.push(inputs[input.name]);
      });
      const data = Buffer.concat([
        methodID(func.name, types),
        rawEncode(types, values)]
      ).toString('hex');
      return `0x${data}`;
    }
    throw new Error(`Function ${name} not found in ABI`);
  }
}
