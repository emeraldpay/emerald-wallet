import { BigAmount, NumberAmount, Unit, Units } from '@emeraldpay/bigamount';
import BigNumber from 'bignumber.js';
import { BlockchainCode, blockchainIdToCode } from '../blockchains';

const TOKEN_TYPES = ['ERC20', 'ERC721', 'ERC1155'] as const;

const WRAPPED_TOKENS: Readonly<Partial<Record<BlockchainCode, string>>> = {
  [BlockchainCode.ETH]: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  [BlockchainCode.ETC]: '0x1953cab0E5bFa6D4a9BaD6E05fD46C1CC6527a5a',
  [BlockchainCode.Sepolia]: '0xc31e8a1087bf1460b9926274de4a03b0dd44a6da',
};

export interface TokenData {
  address: string;
  blockchain: number;
  decimals: number;
  icon?: string;
  name: string;
  pinned?: boolean;
  stablecoin?: boolean;
  symbol: string;
  type: (typeof TOKEN_TYPES)[number];
}

export function isToken(value: unknown): value is TokenData {
  return (
    value != null &&
    typeof value === 'object' &&
    'type' in value &&
    typeof (value as { [key: string]: unknown }).type in TOKEN_TYPES
  );
}

export function isWrappedToken(token: TokenData): boolean {
  return token.address.toLowerCase() === WRAPPED_TOKENS[blockchainIdToCode(token.blockchain)]?.toLowerCase();
}

export class TokenAmount extends BigAmount {
  readonly token: TokenData;

  constructor(value: NumberAmount | BigAmount, units: Units, token: TokenData) {
    super(value, units);

    this.token = token;
  }

  static is(value: unknown): value is TokenAmount {
    return BigAmount.is(value) && 'token' in value && value.token != null && typeof value.token === 'object';
  }

  protected convert(amount: this): this {
    return new TokenAmount(amount, this.units, this.token) as this;
  }

  protected copyWith(value: BigNumber): this {
    return this.convert(super.copyWith(value));
  }

  plus(amount: this): this {
    return this.convert(super.plus(amount));
  }

  minus(amount: this): this {
    return this.convert(super.minus(amount));
  }

  multiply(amount: number | BigNumber): this {
    return this.convert(super.multiply(amount));
  }

  divide(amount: number | BigNumber): this {
    return this.convert(super.divide(amount));
  }

  max(amount: this): this {
    return this.convert(super.max(amount));
  }

  min(amount: this): this {
    return this.convert(super.min(amount));
  }
}

export class Token implements TokenData {
  private readonly _pinned?: boolean;
  private readonly _stablecoin?: boolean;

  readonly address: string;
  readonly blockchain: number;
  readonly decimals: number;
  readonly icon?: string;
  readonly name: string;
  readonly symbol: string;
  readonly type: (typeof TOKEN_TYPES)[number];

  constructor(token: TokenData) {
    this._pinned = token.pinned;
    this._stablecoin = token.stablecoin;

    this.blockchain = token.blockchain;
    this.decimals = token.decimals;
    this.icon = token.icon;
    this.name = token.name;
    this.type = token.type;

    this.address = token.address.toLowerCase();
    this.symbol = token.symbol.toUpperCase();
  }

  get pinned(): boolean {
    return this._pinned ?? false;
  }

  get stablecoin(): boolean {
    return this._stablecoin ?? false;
  }

  get wrapped(): boolean {
    return isWrappedToken(this);
  }

  getAmount(amount: BigNumber | string | number): TokenAmount {
    return new TokenAmount(amount, this.getUnits(), this);
  }

  getUnits(): Units {
    const { decimals, name, symbol } = this;

    return new Units([new Unit(decimals, name, symbol)]);
  }

  toPlain(): TokenData {
    return { ...this };
  }
}

export type TokenInstances = Map<BlockchainCode, Map<string, Token>>;

export class TokenRegistry {
  private readonly instances: TokenInstances = new Map();

  constructor(tokens: TokenData[]) {
    tokens.forEach((token) => {
      const blockchain = blockchainIdToCode(token.blockchain);
      const instances = this.instances.get(blockchain) ?? new Map();

      const address = token.address.toLowerCase();

      this.instances.set(blockchain, instances.set(address, new Token(token)));
    });
  }

  byBlockchain(blockchain: BlockchainCode): Token[] {
    const instances = this.instances.get(blockchain);

    if (instances == null) {
      return [];
    }

    return [...instances.values()];
  }

  byAddress(blockchain: BlockchainCode, address: string): Token {
    const instances = this.instances.get(blockchain);

    if (instances == null) {
      throw new Error(`Can't find tokens by blockchain ${blockchain} for address ${address}`);
    }

    const instance = instances.get(address.toLowerCase());

    if (instance == null) {
      throw new Error(`Can't find token by address ${address} in ${blockchain} blockchain`);
    }

    return instance;
  }

  byAddresses(blockchain: BlockchainCode, addresses: string[]): Token[] {
    const instances = this.instances.get(blockchain);

    if (instances == null) {
      throw new Error(`Can't find tokens by blockchain ${blockchain} for addresses ${addresses.join(', ')}`);
    }

    const tokenAddresses = addresses.map((address) => address.toLowerCase());

    return [...instances.values()].reduce<Token[]>((carry, token) => {
      if (tokenAddresses.includes(token.address)) {
        return [...carry, token];
      }

      return carry;
    }, []);
  }

  hasAddress(blockchain: BlockchainCode, address: string): boolean {
    const instances = this.instances.get(blockchain);

    if (instances == null) {
      return false;
    }

    return instances.has(address.toLowerCase());
  }

  hasAnyToken(blockchain: BlockchainCode): boolean {
    const instances = this.instances.get(blockchain);

    return (instances?.size ?? 0) > 0;
  }

  hasWrappedToken(blockchain: BlockchainCode): boolean {
    return WRAPPED_TOKENS[blockchain] != null;
  }

  getPinned(blockchain: BlockchainCode): Token[] {
    const instances = this.instances.get(blockchain);

    if (instances == null) {
      return [];
    }

    return [...instances.values()].reduce<Token[]>((carry, token) => {
      if (token.pinned) {
        return [...carry, token];
      }

      return carry;
    }, []);
  }

  getStablecoins(blockchain: BlockchainCode): Token[] {
    const instances = this.instances.get(blockchain);

    if (instances == null) {
      return [];
    }

    return [...instances.values()].reduce<Token[]>((carry, token) => {
      if (token.stablecoin) {
        return [...carry, token];
      }

      return carry;
    }, []);
  }

  getWrapped(blockchain: BlockchainCode): Token {
    const address = WRAPPED_TOKENS[blockchain];

    if (address == null) {
      throw new Error(`Wrapped token not found for ${blockchain} blockchain`);
    }

    const instances = this.instances.get(blockchain);

    if (instances == null) {
      throw new Error(`Can't find wrapped token by blockchain ${blockchain}`);
    }

    const instance = instances.get(address.toLowerCase());

    if (instance == null) {
      throw new Error(`Can't find wrapped token by address ${address} in ${blockchain} blockchain`);
    }

    return instance;
  }
}
