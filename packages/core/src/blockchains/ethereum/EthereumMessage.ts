import { Schema, validate } from 'jsonschema';

interface EthereumMessageType {
  name: string;
  type: string;
}

export interface EthereumMessage {
  domain: {
    [key: string]: string;
  };
  message: {
    [key: string]: unknown;
  };
  primaryType: string;
  types: {
    EIP712Domain: EthereumMessageType[];
    [key: string]: EthereumMessageType[];
  };
}

const schema: Schema = {
  type: 'object',
  properties: {
    types: {
      type: 'object',
      properties: {
        EIP712Domain: { type: 'array' },
      },
      additionalProperties: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            type: { type: 'string' },
          },
          required: ['name', 'type'],
        },
      },
      required: ['EIP712Domain'],
    },
    primaryType: { type: 'string' },
    domain: { type: 'object' },
    message: { type: 'object' },
  },
  required: ['types', 'primaryType', 'domain', 'message'],
};

export function isStructuredMessage(message: string): boolean {
  try {
    return validate(JSON.parse(message), schema).valid;
  } catch (exception) {
    return false;
  }
}
