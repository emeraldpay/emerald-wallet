import {WithDefaults} from './index';

describe('WithDefaults', () => {
  it('merges empty', () => {
    const act = WithDefaults({}, {});
    expect(act).toEqual({});
  });

  it('merges empty current', () => {
    const act = WithDefaults({}, {foo: 1, bar: "baz"});
    expect(act).toEqual({foo: 1, bar: "baz"});
  });

  it('merges empty default', () => {
    const act = WithDefaults({foo: 1, bar: "baz"}, {});
    expect(act).toEqual({foo: 1, bar: "baz"});
  });

  it('merges two different', () => {
    const act = WithDefaults({foo: 1, bar: "baz"}, {baz: "bar"});
    expect(act).toEqual({foo: 1, bar: "baz", baz: "bar"});
  });

  it('doesnt update if defined', () => {
    const act = WithDefaults({foo: 1, bar: "baz"}, {foo: 3});
    expect(act).toEqual({foo: 1, bar: "baz"});
  });

  it('update if not defined', () => {
    const act = WithDefaults({foo: undefined, bar: "baz"}, {foo: 3});
    expect(act).toEqual({foo: 3, bar: "baz"});
  });

  it('doesnt update if null', () => {
    const act = WithDefaults({foo: null, bar: "baz"}, {foo: 3});
    expect(act).toEqual({foo: null, bar: "baz"});
  });
})