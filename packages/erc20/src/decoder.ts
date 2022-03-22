import abi from './abi';
import {methodID, rawDecode} from 'ethereumjs-abi';

export class InputDataDecoder {
  private readonly abi: Array<any>;

  constructor(abi: Array<any>) {
    this.abi = abi;
  }

  decodeConstructor(data: string) {
    if (typeof data !== 'string') {
      data = ''
    }
    data = data.trim();

    for (let i = 0; i < this.abi.length; i++) {
      const obj = this.abi[i];
      if (obj.type !== 'constructor') {
        continue
      }

      const name = obj.name || null;
      const types = obj.inputs ? obj.inputs.map((x: any) => x.type) : [];

      // take last 32 bytes
      data = data.slice(-256);

      if (data.length !== 256) {
        throw new Error('Invalid data')
      }

      if (data.indexOf('0x') !== 0) {
        data = `0x${data}`
      }

      const buffer = Buffer.from(data.replace('0x', ''), 'hex');
      const inputs = rawDecode(types, buffer);

      return {
        name,
        types,
        inputs
      }
    }

    throw new Error('Constructor not found')
  }

  decodeData(data: string) {
    if (typeof data !== 'string') {
      data = ''
    }
    data = data.trim();
    const dataBuf = Buffer.from(data.replace(/^0x/, ''), 'hex');
    const methodId = Buffer.from(dataBuf.subarray(0, 4)).toString('hex');
    let inputsBuf = dataBuf.subarray(4);

    const result = this.abi.reduce((acc, obj) => {
      if (obj.type === 'constructor') {
        return acc;
      }
      const name = obj.name || null;
      const types = obj.inputs ? obj.inputs.map((x: any) => x.type) : [];
      const hash = methodID(name, types).toString('hex');

      if (hash === methodId) {
        inputsBuf = normalizeAddresses(types, inputsBuf);
        const inputs = rawDecode(types, Buffer.from(inputsBuf));

        return {
          name,
          types,
          inputs
        }
      }

      return acc
    }, {name: null, types: [], inputs: []});

    if (!result.name) {
      try {
        const decoded = this.decodeConstructor(data);
        if (decoded) {
          return decoded
        }
      } catch (err) {
      }
    }
    return result
  }
}

function normalizeAddresses(types: any, input: any) {
  let offset = 0;
  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    if (type === 'address') {
      input.set(Buffer.alloc(12), offset)
    }

    if (isArray(type)) {
      const size = parseTypeArray(type);
      if (size && size !== 'dynamic') {
        offset += 32 * size
      } else {
        offset += 32
      }
    } else {
      offset += 32
    }
  }
  return input;
}

function parseTypeArray(type: string) {
  const tmp = type.match(/(.*)\[(.*?)\]$/);
  if (tmp) {
    return tmp[2] === '' ? 'dynamic' : parseInt(tmp[2], 10);
  }
  return null;
}

function isArray(type: any) {
  return type.lastIndexOf(']') === type.length - 1
}

const decoder = new InputDataDecoder(abi);

export function decodeData(data: string): any {
  return decoder.decodeData(data);
}
