const MAX_UNHARDENED: number = Math.pow(2, 31) - 1;
const RE_FULL = /^m\/(\d+)'\/(\d+)'\/(\d+)'\/(\d+)\/(\d+)$/;
const RE_ACC = /^m\/(\d+)'\/(\d+)'\/(\d+)'$/;

export class HDPath {
  readonly purpose: number;
  readonly coin: number;
  readonly account: number;
  readonly change: number | undefined;
  readonly index: number | undefined;

  constructor(purpose: number, coin: number, account: number, change: number | undefined, index: number | undefined) {
    if (purpose < 0 || purpose > MAX_UNHARDENED) {
      throw new Error("Invalid purpose: " + purpose)
    }
    if (coin < 0 || coin > MAX_UNHARDENED) {
      throw new Error("Invalid coin: " + coin)
    }
    if (account < 0 || account > MAX_UNHARDENED) {
      throw new Error("Invalid account: " + account)
    }
    if (typeof change != "undefined" && typeof index != "undefined") {
      if (change < 0 || change > MAX_UNHARDENED) {
        throw new Error("Invalid change: " + change)
      }
      if (index < 0 || index > MAX_UNHARDENED) {
        throw new Error("Invalid index: " + index)
      }
    } else if (typeof change != "undefined" || typeof index != "undefined") {
      throw new Error("Both change and index should be undefined for account. " + change + "/" + index);
    }

    this.purpose = purpose;
    this.coin = coin;
    this.account = account;
    this.change = change;
    this.index = index;
  }

  static default(): HDPath {
    return new HDPath(44, 0, 0, 0, 0)
  }

  static parse(value: string): HDPath {
    try {
      return HDPath.parseFull(value)
    } catch (e) {
      return HDPath.parseAcc(value)
    }
  }

  static parseFull(value: string): HDPath {
    const m = RE_FULL.exec(value);
    if (!m) {
      throw new Error("Invalid HD Path: " + value);
    }
    return new HDPath(
      parseInt(m[1]),
      parseInt(m[2]),
      parseInt(m[3]),
      parseInt(m[4]),
      parseInt(m[5])
    )
  }

  static parseAcc(value: string): HDPath {
    const m = RE_ACC.exec(value);
    if (!m) {
      throw new Error("Invalid HD Path: " + value);
    }
    return new HDPath(
      parseInt(m[1]),
      parseInt(m[2]),
      parseInt(m[3]),
      undefined,
      undefined
    )
  }

  public toString(): string {
    if (this.isAccount()) {
      return `m/${this.purpose}'/${this.coin}'/${this.account}'`
    }
    return `m/${this.purpose}'/${this.coin}'/${this.account}'/${this.change}/${this.index}`
  }

  public forPurpose(purpose: number): HDPath {
    return new HDPath(purpose, this.coin, this.account, this.change, this.index);
  }

  public forCoin(coin: number | string): HDPath {
    if (typeof coin != "number") {
      if (coin.toLowerCase() == 'eth' || coin.toLowerCase() == 'kovan') {
        return this.forCoin(60)
      } else if (coin.toLowerCase() == 'etc') {
        return this.forCoin(61)
      } else {
        throw new Error("Unsupported blockchain: " + coin)
      }
    }
    return new HDPath(this.purpose, coin, this.account, this.change, this.index);
  }

  public forAccount(account: number) {
    return new HDPath(this.purpose, this.coin, account, this.change, this.index);
  }

  public forAddress(change: number, index: number) {
    return new HDPath(this.purpose, this.coin, this.account, change, index);
  }

  public forChange(change: number) {
    return new HDPath(this.purpose, this.coin, this.account, change, this.index);
  }

  public forIndex(index: number) {
    return new HDPath(this.purpose, this.coin, this.account, this.change, index);
  }

  public asAccount(): HDPath {
    return new HDPath(this.purpose, this.coin, this.account, undefined, undefined);
  }

  public isAccount(): boolean {
    return typeof this.change == "undefined";
  }
}