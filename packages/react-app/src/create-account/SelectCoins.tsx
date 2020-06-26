import {connect} from "react-redux";
import {Dispatch} from "react";
import * as React from 'react';
import {
  createStyles,
  FormControlLabel, Grid,
  Switch,
  Typography
} from "@material-ui/core";
import {IState} from "@emeraldwallet/store";
import {CoinAvatar} from "@emeraldwallet/ui";
import {makeStyles} from "@material-ui/core/styles";
import {BlockchainCode, IBlockchain, AssetDetails} from "@emeraldwallet/core";

const useStyles = makeStyles(
  createStyles({
    iconBox: {
      paddingTop: "8px",
      paddingLeft: "32px",
    },
    row: {
      marginTop: "16px"
    },
    descriptionEnabled: {},
    descriptionDisabled: {
      opacity: "0.5"
    },
  })
);

/**
 *
 */
const Component = (({blockchains, enabled, onChange, multiple}: Props & Actions & OwnProps) => {

  const styles = useStyles();
  const selectCoinsStep: JSX.Element[] = [];

  const [justEnabled, setJustEnabled] = React.useState([] as BlockchainCode[]);

  function isJustEnabled(code: BlockchainCode): boolean {
    return justEnabled.indexOf(code) >= 0;
  }

  function toggleBlockchain(code: BlockchainCode) {
    let copy = [] as BlockchainCode[];
    if (!multiple) {
      copy.push(code);
    } else {
      copy = copy.concat(justEnabled);
      if (isJustEnabled(code)) {
        copy = justEnabled.filter((it) => it != code);
      } else {
        copy.push(code);
      }
    }
    setJustEnabled(copy);
    onChange(copy);
  }

  blockchains.map((blockchain, i) => {
    const blockchainWasEnabled = enabled.indexOf(blockchain.params.code) >= 0;
    const blockchainNowEnabled = blockchainWasEnabled || isJustEnabled(blockchain.params.code);

    const tokens = blockchain.getAssets().map((asset) => {
      const detail = AssetDetails[asset];
      return `${detail.title} (${asset})`;
    }).join(", ");

    const blockchainCard = <Grid item={true} xs={12} key={blockchain.params.code} className={styles.row}>
      <Grid container={true}>
        <Grid item={true} xs={1} className={styles.iconBox}><CoinAvatar chain={blockchain.params.code} size="default"/></Grid>
        <Grid item={true} xs={8}
              className={blockchainNowEnabled ? styles.descriptionEnabled : styles.descriptionDisabled}>
          <Typography variant={"subtitle1"}>{blockchain.getTitle()}</Typography>
          <Typography variant={"body2"}>Cryptocurrencies: {tokens}</Typography>
        </Grid>
        <Grid item={true} xs={2}>
          <FormControlLabel
            control={
              <Switch
                checked={blockchainNowEnabled}
                onChange={() => toggleBlockchain(blockchain.params.code)}
                disabled={blockchainWasEnabled} // deny to remove existing chains for now
                name="checkedB"
                color="primary"
              />
            }
            label={blockchainNowEnabled ? "Enabled" : "Disabled"}
          />
        </Grid>

      </Grid>
    </Grid>

    selectCoinsStep.push(blockchainCard)
  });

  return <Grid container={true}>{selectCoinsStep}</Grid>
})

// State Properties
type Props = {}
// Actions
type Actions = {}

// Component properties
type OwnProps = {
  blockchains: IBlockchain[],
  enabled: BlockchainCode[],
  onChange: (value: BlockchainCode[]) => void;
  multiple?: boolean;
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {
      multiple: typeof ownProps.multiple == "undefined" || ownProps.multiple
    }
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {}
  }
)((Component));