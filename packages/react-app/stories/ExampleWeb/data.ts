import {BackendMock, MemoryApiMock} from "../__mocks__";
import {BlockchainCode} from "@emeraldwallet/core";
import {xpubSeedId, wallet3SeedAddresses} from "../wallets";

export interface Data {
  api: MemoryApiMock;
  backend: BackendMock;
}

export function createNew(): Data {

  console.log("prepare api data");

  const api = new MemoryApiMock();
  const backend = new BackendMock();

  return {
    api,
    backend
  }
}
