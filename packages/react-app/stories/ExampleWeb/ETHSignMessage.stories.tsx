import {providerForStore} from "../storeProvider";
import {Meta} from "@storybook/react";
import * as React from "react";
import {BackendMock, MemoryApiMock} from "../__mocks__";
import SignMessage from "../../src/message/SignMessage";
import {createWallets} from "../wallets";

const api = new MemoryApiMock();
const backend = new BackendMock();

export default {
  title: 'Example Web / ETH Sign Message',
  decorators: [providerForStore(api, backend, [...createWallets]), ],
} as Meta;

export const Default = {
  name: 'ETH Sign Message',
  render: () => <SignMessage walletId="8ff89b7d-8a73-4ee0-ad5b-8ac1f04a49ef" />
};
