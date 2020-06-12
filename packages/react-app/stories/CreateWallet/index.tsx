import {storiesOf} from '@storybook/react';
import * as React from 'react';
import CreateWalletWizard from "../../src/create-wallet/CreateWalletWizard";
import withProvider from "../storeProvider";
import {SeedDefinition, SeedDescription} from "@emeraldpay/emerald-vault-core";

const handlers = {
  onCreate: (value) => Promise.resolve("6aacf568-ec33-435f-b234-3668534a7f13"),
  onError: (err) => console.error,
  onCancel: () => {
  }
}

storiesOf('CreateWallet', module)
  .addDecorator(withProvider)
  .add('empty', () => (
    <CreateWalletWizard
      seeds={[]}
      {...handlers}
    />
  ))
  .add("single seed", () => {
    const seed: SeedDescription = {
      id: "6aacf568-ec33-435f-b234-3668534a7f13",
      available: true,
      type: "mnemonic"
    };
    return <CreateWalletWizard
      seeds={[seed]}
      {...handlers}
    />
  });
