import { Interface, JsonFragment, defaultAbiCoder } from '@ethersproject/abi';
import { BigNumber as EtherBigNumber } from '@ethersproject/bignumber';
import { BigNumber } from 'bignumber.js';
import { tokenAbi } from './abi';

type DecodedType = string | undefined;

interface Decoded {
  inputs: ReadonlyArray<BigNumber | number | string>;
  name?: string;
  types: DecodedType[];
}

function isArray(type: string): boolean {
  return type.lastIndexOf(']') === type.length - 1;
}

function parseTypeArray(type: string): 'dynamic' | number | null {
  const [, match] = type.match(/(.*)\[(.*?)]$/) ?? [];

  if (match != null) {
    return match === '' ? 'dynamic' : parseInt(match, 10);
  }

  return null;
}

function normalizeAddresses(types: string[], input: Buffer): Buffer {
  let offset = 0;

  for (let i = 0; i < types.length; i++) {
    const type = types[i];

    if (type === 'address') {
      input.set(Buffer.alloc(12), offset);
    }

    if (isArray(type)) {
      const size = parseTypeArray(type);

      if (size == null || size === 'dynamic') {
        offset += 32;
      } else {
        offset += 32 * size;
      }
    } else {
      offset += 32;
    }
  }
  return input;
}

export class InputDataDecoder {
  private readonly contract: Interface;

  constructor(abi: JsonFragment[]) {
    this.contract = new Interface(abi);
  }

  decodeConstructor(encoded: string): Decoded {
    let data = encoded.trim();

    for (const method of this.contract.fragments) {
      if (method.type !== 'constructor') {
        continue;
      }

      const types = method.inputs?.map((input) => input.type).filter((type): type is string => type != null) ?? [];

      // take last 32 bytes
      data = data.slice(-256);

      if (data.length !== 256) {
        throw new Error('Invalid data');
      }

      const inputs = defaultAbiCoder
        .decode(types, Buffer.from(data.replace(/^0x/, ''), 'hex'))
        .map((input) =>
          typeof input === 'string' && input.startsWith('0x')
            ? input.replace(/^0x/, '').toLowerCase()
            : EtherBigNumber.isBigNumber(input)
            ? new BigNumber(input.toString())
            : input,
        );

      return {
        inputs,
        types,
        name: method.name,
      };
    }

    throw new Error('Constructor not found');
  }

  decodeData(encoded?: string): Decoded {
    const data = encoded?.trim() ?? '';

    const dataBuf = Buffer.from(data.replace(/^0x/, ''), 'hex');
    const methodId = Buffer.from(dataBuf.subarray(0, 4)).toString('hex');

    let inputsBuf = dataBuf.subarray(4);

    const methods = Object.values(this.contract.functions);

    const result = methods.reduce<Decoded>(
      (carry, method) => {
        if (method.type === 'constructor') {
          return carry;
        }

        const hash = this.contract.getSighash(method).replace(/^0x/, '');
        const types = method.inputs?.map((input) => input.type).filter((type): type is string => type != null) ?? [];

        if (hash === methodId) {
          inputsBuf = normalizeAddresses(types, inputsBuf);

          const inputs = defaultAbiCoder
            .decode(types, Buffer.from(inputsBuf))
            .map((input) =>
              typeof input === 'string' && input.startsWith('0x')
                ? input.replace(/^0x/, '').toLowerCase()
                : EtherBigNumber.isBigNumber(input)
                ? new BigNumber(input.toString())
                : input,
            );

          return {
            types,
            inputs,
            name: method.name,
          };
        }

        return carry;
      },
      { types: [], inputs: [] },
    );

    if (result.name == null) {
      try {
        return this.decodeConstructor(data);
      } catch (err) {
        // Nothing
      }
    }

    return result;
  }
}

const decoder = new InputDataDecoder(tokenAbi);

export function decodeData(data: string): Decoded {
  return decoder.decodeData(data);
}
