import * as vault from "@emeraldpay/emerald-vault-core";
import {Ledger} from '@emeraldwallet/ui';
import {List, ListItem, ListItemIcon, ListItemText} from "@material-ui/core";
import AddBoxIcon from '@material-ui/icons/AddBox';
import ExposureZeroIcon from '@material-ui/icons/ExposureZero';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import PublishIcon from '@material-ui/icons/Publish';
import * as React from "react";
import { KeySourceType, KeysSource } from "./flow/types";

type OwnProps = {
  seeds: vault.SeedDescription[];
  onSelect: (value: KeysSource) => void;
}

/**
 * Select source for the private key of the wallet.
 */
const Component: React.FC<OwnProps> = (
  ({ seeds, onSelect }) => {

    let seedsList = null;

    if (seeds.length > 1) {
      seedsList = seeds.map((seed) =>
        <ListItem
          key={"seed-" + seed.id}
          onClick={() => onSelect({ type: KeySourceType.SEED_SELECTED, id: seed.id! })}
        >
          <ListItemIcon>
            <FileCopyIcon />
          </ListItemIcon>
          <ListItemText
            primary={"Seed"}
            secondary={"Seed " + seed.id}
          />
        </ListItem>,
      )
    } else if (seeds.length == 1) {
      seedsList = <ListItem
        key={"seed-" + seeds[0].id}
        onClick={() => onSelect({ type: KeySourceType.SEED_SELECTED, id: seeds[0].id! })}
      >
        <ListItemIcon>
          <FileCopyIcon />
        </ListItemIcon>
        <ListItemText
          primary={"Use current seed"}
          secondary={"Seed " + seeds[0].id}
        />
      </ListItem>
    }

    const createSeed = <ListItem
      key={"create-seed"}
      onClick={() => onSelect({ type: KeySourceType.SEED_GENERATE })}
    >
      <ListItemIcon>
        <AddBoxIcon />
      </ListItemIcon>
      <ListItemText
        primary={"Create new seed"}
        secondary={"Generate a new mnemonic phrase for a new wallet (24 words)"}
      />
    </ListItem>

    const importSeed = <ListItem
      key={"import-seed"}
      onClick={() => onSelect({ type: KeySourceType.SEED_IMPORT })}
    >
      <ListItemIcon>
        <PublishIcon />
      </ListItemIcon>
      <ListItemText
        primary={"Import existing seed"}
        secondary={"Import another mnemonic phrase or use new Hardware Wallet (Ledger Nano)"}
      />
    </ListItem>

    const importLedger = <ListItem
      key={"import-ledger"}
      onClick={() => onSelect("start-ledger")}
    >
      <ListItemIcon>
        <Ledger />
      </ListItemIcon>
      <ListItemText
        primary={"Create from Ledger Nano"}
        secondary={"Create wallet backed by Ledger Nano model S or X"}
      />
    </ListItem>

    const useKey = <ListItem
      key={"useKey"}
      onClick={() => onSelect({ type: KeySourceType.PK_RAW, password: '', pk: '' })}
    >
      <ListItemIcon>
        <PublishIcon />
      </ListItemIcon>
      <ListItemText
        primary={"Import existing Raw Private Key"}
        secondary={"Create a new wallet dedicated to a single Private Key, by importing a raw key"}
      />
    </ListItem>

    const useJson = <ListItem
      key={"useJson"}
      onClick={() => onSelect({ type: KeySourceType.PK_WEB3_JSON, json: '', jsonPassword: '', password: '' })}
    >
      <ListItemIcon>
        <PublishIcon />
      </ListItemIcon>
      <ListItemText
        primary={"Import existing Private Key JSON file"}
        secondary={"Create a new wallet dedicated to a single Private Key, by importing Ethereum JSON file"}
      />
    </ListItem>

    const nothing = <ListItem
      key={"nothing"}
      onClick={() => onSelect('empty')}
    >
      <ListItemIcon>
        <ExposureZeroIcon />
      </ListItemIcon>
      <ListItemText
        primary={"Create empty wallet"}
        secondary={"Create a new empty wallet and add coins and addresses later"}
      />
    </ListItem>

    return <List>
      {seedsList}
      {importLedger}
      {createSeed}
      {importSeed}
      {useKey}
      {useJson}
      {nothing}
    </List>

  }
)

export default Component;
