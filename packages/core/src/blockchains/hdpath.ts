const MAX_UNHARDENED: number = Math.pow(2, 31) - 1;
const regexp = /^m\/(\d+)'\/(\d+)'\/(\d+)'\/(\d+)\/(\d+)$/;

export class HDPath {
  readonly purpose: number;
  readonly coin: number;
  readonly account: number;
  readonly change: number;
  readonly index: number;

  constructor(purpose: number, coin: number, account: number, change: number, index: number) {
    if (purpose < 0 || purpose > MAX_UNHARDENED) {
      throw new Error("Invalid purpose: " + purpose)
    }
    if (coin < 0 || coin > MAX_UNHARDENED) {
      throw new Error("Invalid coin: " + coin)
    }
    if (account < 0 || account > MAX_UNHARDENED) {
      throw new Error("Invalid account: " + account)
    }
    if (change < 0 || change > MAX_UNHARDENED) {
      throw new Error("Invalid change: " + change)
    }
    if (index < 0 || index > MAX_UNHARDENED) {
      throw new Error("Invalid index: " + index)
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
    const m = regexp.exec(value);
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

    public toString(): string {
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

  public forIndex(index: number) {
    return new HDPath(this.purpose, this.coin, this.account, this.change, index);
  }
}