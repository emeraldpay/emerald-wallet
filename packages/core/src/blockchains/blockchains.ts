import Ethereum from "./ethereum/Ethereum";
import Classic from "./ethereum-classic/Classic";

export enum BlockchainCode {
  ETC = "etc",
  ETH = "eth",
  Morden = "morden",
}

export const Blockchains = {
  [BlockchainCode.ETH]: new Ethereum(),
  [BlockchainCode.ETC]: new Classic(),
  [BlockchainCode.Morden]: new Classic(),
};
