import { HDPath } from './HDPath';

describe('Parse HDPath', () => {
  it('standard', () => {
    const act = HDPath.parse("m/44'/60'/0'/0/0");

    expect(act.toString()).toBe("m/44'/60'/0'/0/0");
  });

  it('with values', () => {
    const act = HDPath.parse("m/44'/60'/1'/0/15");

    expect(act.toString()).toBe("m/44'/60'/1'/0/15");
  });

  it('only account', () => {
    const act = HDPath.parse("m/44'/60'/1'");

    expect(act.toString()).toBe("m/44'/60'/1'");
  });
});

describe('Change HDPath', () => {
  it('change account', () => {
    const act = HDPath.parse("m/44'/60'/0'/0/0").forAccount(2);

    expect(act.toString()).toBe("m/44'/60'/2'/0/0");
  });

  it('change index', () => {
    const act = HDPath.parse("m/44'/60'/0'/0/0").forIndex(101);

    expect(act.toString()).toBe("m/44'/60'/0'/0/101");
  });

  it('change multiple', () => {
    const act = HDPath.parse("m/44'/60'/0'/0/0").forIndex(101).forAccount(4);

    expect(act.toString()).toBe("m/44'/60'/4'/0/101");
  });

  it('to account', () => {
    const act = HDPath.parse("m/84'/0'/5'/0/101");

    expect(act.asAccount().toString()).toBe("m/84'/0'/5'");
  });
});
