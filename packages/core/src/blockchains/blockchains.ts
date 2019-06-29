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
  [BlockchainCode.ETH]: new Ethereum(new EthereumParams(CoinTicker.ETH, 1,"m/44'/60'/0'/0'"), "Ethereum"),
  [BlockchainCode.ETC]: new Ethereum(new EthereumParams(CoinTicker.ETC, 61, "m/44'/61'/0'/0'"), "Ethereum Classic"),
  [BlockchainCode.Morden]: new Ethereum(new EthereumParams(CoinTicker.MORDEN, 62, "m/44'/60'/160720'/0'"), "Ethereum Morden Testnet"),
  [BlockchainCode.Kovan]: new Ethereum(new EthereumParams(CoinTicker.KOVAN, 42, "m/44'/60'/160720'/0'"), "Ethereum Kovan Testnet"),
};
