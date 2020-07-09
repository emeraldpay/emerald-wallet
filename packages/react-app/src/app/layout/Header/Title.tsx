import {connect} from "react-redux";
import {Dispatch} from "react";
import * as React from 'react';
import {Box, createStyles, Theme} from "@material-ui/core";
import {IState, screen} from "@emeraldwallet/store";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    root: {
      fontSize: "16px",
      flexGrow: 1,
      cursor: "pointer",
    },
    brandPart: {
      color: theme.palette.primary.main,
      marginRight: "4px",
    },
    productPart: {
      color: theme.palette.secondary.main,
    },
  })
);

/**
 *
 */
const Component = (({onClick}: Props & Actions & OwnProps) => {
  const styles = useStyles();
  return <div className={styles.root} onClick={() => onClick()}>
    <span className={styles.brandPart}>Emerald</span>
    <span className={styles.productPart}>Wallet</span>
  </div>
})

// State Properties
interface Props {
}

// Actions
interface Actions {
  onClick: () => void;
}

// Component properties
interface OwnProps {
}

export default connect(
  (state: IState, ownProps: OwnProps): Props => {
    return {}
  },
  (dispatch: Dispatch<any>, ownProps: OwnProps): Actions => {
    return {
      onClick: () => {
        dispatch(screen.actions.gotoScreen("home"));
      }
    }
  }
)((Component));