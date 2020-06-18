import {connect} from "react-redux";
import {IState} from "@emeraldwallet/store";
import * as React from "react";
import {Dispatch} from "react";
import * as vault from "@emeraldpay/emerald-vault-core";
import {List, ListItem, ListItemIcon, ListItemText} from "@material-ui/core";
import AddBoxIcon from '@material-ui/icons/AddBox';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import PublishIcon from '@material-ui/icons/Publish';
import ExposureZeroIcon from '@material-ui/icons/ExposureZero';
import {KeySourceType, KeysSource} from "./flow/types";

type Props = {}
type Actions = {}

/**
 * Select source for the private key of the wallet.
 */
const Component = (({seeds, onSelect}: Props & Actions & OwnProps) => {

  let seedsList = null;

  if (seeds.length > 1) {
    seedsList = seeds.map((seed) =>
      <ListItem key={"seed-" + seed.id}
                onClick={() => onSelect({type: KeySourceType.SEED_SELECTED, id: seed.id!})}>
        <ListItemIcon>
          <FileCopyIcon/>
        </ListItemIcon>
        <ListItemText primary={"Seed"}
                      secondary={"Seed " + seed.id}/>
      </ListItem>
    )
  } else if (seeds.length == 1) {
    seedsList = <ListItem key={"seed-" + seeds[0].id}
                          onClick={() => onSelect({type: KeySourceType.SEED_SELECTED, id: seeds[0].id!})}>
      <ListItemIcon>
        <FileCopyIcon/>
      </ListItemIcon>
      <ListItemText primary={"Use current seed"}
                    secondary={"Seed " + seeds[0].id}/>
    </ListItem>
  }

  const createSeed = <ListItem key={"create-seed"}
                               onClick={() => onSelect({type: KeySourceType.SEED_GENERATE})}>
    <ListItemIcon>
      <AddBoxIcon/>
    </ListItemIcon>
    <ListItemText primary={"Create new seed"}
                  secondary={"Generate a new mnemonic phrase for a new wallet (24 words)"}/>
  </ListItem>

  const importSeed = <ListItem key={"import-seed"}
                               onClick={() => onSelect({type: KeySourceType.SEED_IMPORT})}>
    <ListItemIcon>
      <PublishIcon/>
    </ListItemIcon>
    <ListItemText primary={"Import existing seed"}
                  secondary={"Import another mnemonic phrase (21 or 24 words) or use new Hardware Wallet (Ledger Nano)"}/>
  </ListItem>

  const useKey = <ListItem key={"useKey"}
                           onClick={() => onSelect({type: KeySourceType.PK_ANY})}>
    <ListItemIcon>
      <PublishIcon/>
    </ListItemIcon>
    <ListItemText primary={"Import existing Private Key"}
                  secondary={"Create a new wallet dedicated to a single Private Key, by importing a raw key or Ethereum JSON file"}/>
  </ListItem>

  const nothing = <ListItem key={"nothing"}
                            onClick={() => onSelect('empty')}>
    <ListItemIcon>
      <ExposureZeroIcon/>
    </ListItemIcon>
    <ListItemText primary={"Create empty wallet"}
                  secondary={"Create a new empty wallet and add coins and addresses later"}/>
  </ListItem>

  return <List>
    {seedsList}
    {createSeed}
    {importSeed}
    {useKey}
    {nothing}
  </List>

})

type OwnProps = {
  seeds: vault.SeedDescription[],
  onSelect: (value: KeysSource) => void
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {}
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {}
  }
)((Component));