import Ethereum from "./ethereum/Ethereum";
import EthereumParams from "./ethereum/EthereumParams";
import {CoinTicker} from "./CoinTicker";

export enum BlockchainCode {
  ETC = "etc",
  ETH = "eth",
  Morden = "morden",
  Kovan = "kovan",
}

export const Blockchains = {
  [BlockchainCode.ETH]: new Ethereum(new EthereumParams(CoinTicker.ETH, 1), "Ethereum"),
  [BlockchainCode.ETC]: new Ethereum(new EthereumParams(CoinTicker.ETC, 61), "Ethereum Classic"),
  [BlockchainCode.Morden]: new Ethereum(new EthereumParams(CoinTicker.MORDEN, 62), "Ethereum Morden Testnet"),
  [BlockchainCode.Kovan]: new Ethereum(new EthereumParams(CoinTicker.KOVAN, 42), "Ethereum Kovan Testnet"),
};
