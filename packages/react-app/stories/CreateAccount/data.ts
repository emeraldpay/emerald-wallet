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

  api.vault.addSeedAddress(
    'e23378da-d4b2-4843-ae4d-f42888a11b58',
    "m/44'/60'/0'/0/0",
    '0xc4cf138d349ead73f7a93306096a626c40f56653',
  );
  api.vault.addSeedAddress(
    'e23378da-d4b2-4843-ae4d-f42888a11b58',
    "m/44'/61'/0'/0/0",
    '0x75a32a48a215675f822fca1f9d99dadf7c6ec104',
  );
  api.vault.addSeedAddress(
    'e23378da-d4b2-4843-ae4d-f42888a11b58',
    "m/44'/60'/1'/0/0",
    '0x49dbb473f4fbdc20a4367763351df63553c86824',
  );
  api.vault.addSeedAddress(
    'e23378da-d4b2-4843-ae4d-f42888a11b58',
    "m/44'/61'/1'/0/0",
    '0x2b59a19f1f4de027d039ac3f24e9b73ddf03386f',
  );
  api.vault.addSeedAddresses(xpubSeedId, wallet3SeedAddresses());

  backend.useBlockchains([BlockchainCode.ETH, BlockchainCode.ETC]);
  backend.blockchains[BlockchainCode.ETC]?.setBalance(
    '0x75a32a48a215675f822fca1f9d99dadf7c6ec104',
    'ETC',
    '30400000000000000000',
  );
  backend.blockchains[BlockchainCode.ETH]?.setBalance(
    '0xc4cf138d349ead73f7a93306096a626c40f56653',
    'ETH',
    '150078009050000000',
  );
  backend.blockchains[BlockchainCode.ETH]?.setBalance(
    '0xc4cf138d349ead73f7a93306096a626c40f56653',
    'DAI',
    '250018500000000000000',
  );
  backend.blockchains[BlockchainCode.ETH]?.setBalance(
    '0xc4cf138d349ead73f7a93306096a626c40f56653',
    'USDT',
    '41010000000',
  );

  return {
    api,
    backend
  }
}
