import {
  number, address, required, positive, isJson, passwordMatch
} from './validators';

describe('Field Validators', () => {
  it('valid required', () => {
    expect(required('abcd')).toBeUndefined();
  });
  it('invalid required', () => {
    expect(required(undefined)).not.toBeUndefined();
    expect(required('')).not.toBeUndefined();
  });

  it('valid numbers', () => {
    expect(number('123')).toBeUndefined();
    expect(number('123819357191927591012875818575819294757100349')).toBeUndefined();
    expect(number('687193.9515')).toBeUndefined();
    expect(number('+1000.00')).toBeUndefined();
    expect(number('-1000.00')).toBeUndefined();
  });

  it('invalid numbers with other characters', () => {
    expect(number('123gg')).not.toBeUndefined();
    expect(number('1238-1935719192')).not.toBeUndefined();
  });
  it('invalid numbers in hex', () => {
    expect(number('0x51fe')).not.toBeUndefined();
  });
  it('valid positive', () => {
    expect(positive('1000')).toBeUndefined();
    expect(positive('+1000')).toBeUndefined();
    expect(positive('1000.12')).toBeUndefined();
    expect(positive('+1000.99')).toBeUndefined();
  });
  it('invalid positive', () => {
    expect(positive('-1000')).not.toBeUndefined();
    expect(positive('-1000.99')).not.toBeUndefined();
  });


  it('valid address', () => {
    expect(address('0x6ebeb2af2e734fbba2b58c5b922628af442527ce')).toBeUndefined();
    expect(address('0x0E7C045110B8dbF29765047380898919C5CB56F4')).toBeUndefined();
  });
  it('invalid address', () => {
    expect(address('0x6ebeb2af2e734fbba2b58c5b922628af442527')).not.toBeUndefined();
    expect(address('0E7C045110B8dbF29765047380898919C5CB56F4')).not.toBeUndefined();
  });

  it('valid json', () => {
    expect(isJson('{"a": 1, "b": 2}')).toBeUndefined();
    expect(isJson('{"a": [1,2,3], "b": 2}')).toBeUndefined();
    expect(isJson('["a", 1, "b", 2]')).toBeUndefined();
    expect(isJson('{"a": {"a": 1, "b": 2}, "b": {"a": 1, "b": {"a": 1, "b": 2}}}')).toBeUndefined();
  });
  it('invalid json', () => {
    expect(isJson('{a: 1, b: 2}')).not.toBeUndefined();
    expect(isJson('')).not.toBeUndefined();
    expect(isJson('{"a", [1,2,3], "b": 2}')).not.toBeUndefined();
    expect(isJson('"a", 1, "b", 2')).not.toBeUndefined();
  });
});
