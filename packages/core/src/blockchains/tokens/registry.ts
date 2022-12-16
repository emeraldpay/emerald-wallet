import { BigAmount, Unit, Units } from '@emeraldpay/bigamount';
import BigNumber from 'bignumber.js';
import { BlockchainCode, blockchainIdToCode } from '../blockchains';

const tokenTypes = ['ERC20', 'ERC721', 'ERC1155'] as const;

export interface TokenData {
  address: string;
  blockchain: number;
  decimals: number;
  icon?: string;
  name: string;
  stablecoin?: boolean;
  symbol: string;
  type: typeof tokenTypes[number];
  wrapped?: boolean;
}

export function isToken(value: unknown): value is TokenData {
  return (
    value != null &&
    typeof value === 'object' &&
    'type' in value &&
    typeof (value as { [key: string]: unknown }).type in tokenTypes
  );
}

export class Token implements TokenData {
  address: string;
  blockchain: number;
  decimals: number;
  icon?: string;
  name: string;
  stablecoin?: boolean;
  symbol: string;
  type: typeof tokenTypes[number];
  wrapped?: boolean;

  constructor(token: TokenData) {
    this.address = token.address;
    this.blockchain = token.blockchain;
    this.decimals = token.decimals;
    this.icon = token.icon;
    this.name = token.name;
    this.stablecoin = token.stablecoin;
    this.symbol = token.symbol;
    this.type = token.type;
    this.wrapped = token.wrapped;
  }

  isStablecoin(): boolean {
    return this.stablecoin ?? false;
  }

  isWrapped(): boolean {
    return this.wrapped ?? false;
  }

  getUnits(): Units {
    const { decimals, name, symbol } = this;

    return new Units([new Unit(decimals, name, symbol)]);
  }

  getAmount(amount: BigNumber | string | number): BigAmount {
    return new BigAmount(amount, this.getUnits());
  }
}

type TokenAddresses = Set<string>;
type AddressesBySymbol = Map<string, TokenAddresses>;

type TokenByAddress = Map<string, Token>;

export type TokenDirectory = Map<BlockchainCode, AddressesBySymbol>;
export type TokenInstances = Map<BlockchainCode, TokenByAddress>;

export class TokenRegistry {
  private readonly directory: TokenDirectory = new Map();
  private readonly instances: TokenInstances = new Map();

  constructor(tokens: TokenData[]) {
    tokens.forEach((token) => {
      const blockchain = blockchainIdToCode(token.blockchain);

      const directory: AddressesBySymbol = this.directory.get(blockchain) ?? new Map();
      const addresses: TokenAddresses = directory.get(token.symbol) ?? new Set();

      const instances: TokenByAddress = this.instances.get(blockchain) ?? new Map();

      const address = token.address.toLowerCase();

      this.directory.set(blockchain, directory.set(token.symbol.toUpperCase(), addresses.add(address)));
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

  bySymbol(blockchain: BlockchainCode, symbol: string): Token {
    const directory = this.directory.get(blockchain);

    if (directory == null) {
      throw new Error(`Can't find tokens by blockchain ${blockchain} for symbol ${symbol}`);
    }

    const addresses = directory.get(symbol.toUpperCase());

    if (addresses == null) {
      throw new Error(`Can't find tokens by symbol ${symbol} in ${blockchain} blockchain`);
    }

    const [address] = addresses.values();

    return this.byAddress(blockchain, address);
  }

  hasSymbol(blockchain: BlockchainCode, symbol: string): boolean {
    const directory = this.directory.get(blockchain);

    if (directory == null) {
      return false;
    }

    return directory.has(symbol.toUpperCase());
  }

  getStablecoins(blockchain: BlockchainCode): Token[] {
    const instances = this.instances.get(blockchain);

    if (instances == null) {
      return [];
    }

    return [...instances.values()].reduce<Token[]>((carry, token) => {
      if (token.isStablecoin()) {
        return [...carry, token];
      }

      return carry;
    }, []);
  }
}
