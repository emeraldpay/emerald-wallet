import {connect} from "react-redux";
import {Dispatch} from "react";
import * as React from 'react';
import {CircularProgress, createStyles, Grid, Typography} from "@material-ui/core";
import {IState, ledger} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";
import {Ledger} from "@emeraldplatform/ui-icons";
import {SeedDescription} from "@emeraldpay/emerald-vault-core";

const useStyles = makeStyles(
  createStyles({
    icon: {
      fontSize: "4em"
    },
    progress: {
      paddingTop: "10px",
      textAlign: "center"
    },
    containerFullSize: {
      marginTop: "120px",
      marginBottom: "120px",
    }
  })
);

/**
 *
 */
const Component = ((props: Props & Actions & OwnProps) => {
  const styles = useStyles();
  const fullSize: boolean = props.fullSize || false;

  React.useEffect(() => {
    props.start()
  }, []);

  return <Grid container={true} className={fullSize ? styles.containerFullSize : ""}>
    {fullSize && <Grid item={true} xs={2}/>}
    <Grid item={true} xs={1} className={styles.progress}>
      <CircularProgress/>
    </Grid>
    <Grid item={true} xs={6}>
      <Typography variant={"h5"}>
        <Ledger/> Waiting for Ledger Nano
      </Typography>
      <Typography>
        Please connect and unlock your Ledger Nano X or Nano S.
      </Typography>
    </Grid>
  </Grid>
})

// State Properties
interface Props {
}

// Actions
interface Actions {
  start: () => void;
}

// Component properties
interface OwnProps {
  fullSize?: boolean;
  onConnected: (seed: SeedDescription) => void;
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {}
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {
      start: () => {
        dispatch(ledger.actions.waitConnection(ownProps.onConnected))
      }
    }
  }
)((Component));