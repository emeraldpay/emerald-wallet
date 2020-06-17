import {connect} from "react-redux";
import {Dispatch} from "react";
import * as React from 'react';
import {Box, Button, Card, CardContent, CardMedia, createStyles, FormControlLabel, Typography} from "@material-ui/core";
import {IState} from "@emeraldwallet/store";
import {CoinAvatar} from "@emeraldwallet/ui";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import {makeStyles} from "@material-ui/core/styles";
import {BlockchainCode, IBlockchain} from "@emeraldwallet/core";

const useStyles = makeStyles(
  createStyles({
    media: {
      width: "200px",
      float: "left"
    },
    iconBox: {
      paddingLeft: "65px",
      paddingTop: "30px"
    },
    content: {
      width: "800px",
      float: "left"
    },
    contentCoinsBox: {
      width: "80%",
      float: "left"
    },
    contentControlBox: {
      width: "20%",
      float: "left"
    },
    buttonsRow: {
      // otherwise it's in the center
      display: 'block'
    }
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

    const tokens: JSX.Element[] = [];

    blockchain.getAssets().forEach((asset) => {
      const tokenLabel = <FormControlLabel
        key={asset}
        control={
          blockchainNowEnabled ? <CheckBoxIcon color={"disabled"}/> : <CheckBoxOutlineBlankIcon color={"disabled"}/>
        }
        label={asset}
      />;
      tokens.push(tokenLabel);
    });

    const blockchainCard = <Card key={blockchain.params.code}>
      <CardMedia className={styles.media}>
        <Box className={styles.iconBox}>
          <CoinAvatar chain={blockchain.params.code} size="large"/>
        </Box>
      </CardMedia>
      <CardContent className={styles.content}>
        <Typography variant={"h5"}>{blockchain.getTitle()}</Typography>
        <Box>
          <Box className={styles.contentCoinsBox}>
            <Typography variant={"body2"}>Supported coins:</Typography>
            {tokens}
          </Box>
          <Box className={styles.contentControlBox}>
            <Button
              onClick={() => toggleBlockchain(blockchain.params.code)}
              disabled={blockchainWasEnabled} // deny to remove existing chains for now
              variant="text"
              color="primary"
              startIcon={blockchainNowEnabled ? <CheckBoxIcon/> : <CheckBoxOutlineBlankIcon/>}
            >
              {blockchainNowEnabled ? "Disable" : "Enable"}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>

    selectCoinsStep.push(blockchainCard)
  });

  return <Box>{selectCoinsStep}</Box>
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