import {BlockchainCode} from "./blockchains";
import {CoinTicker, CoinTickerCode} from "./blockchains/CoinTicker";

export type StableCoinCode = 'DAI' | 'USDT' | 'SAI';
export type SupportedTokenCode = 'BEC' | 'WEENUS';

export type AnyTokenCode = StableCoinCode | SupportedTokenCode;

export type AnyCoinCode = AnyTokenCode | CoinTickerCode;