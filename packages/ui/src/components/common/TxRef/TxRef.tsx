import {makeStyles} from '@material-ui/core/styles';
import * as React from 'react';
import {Box, createStyles, Theme, Typography} from "@material-ui/core";
import {ClassNameMap} from "@material-ui/styles";
import {WithDefaults} from "@emeraldwallet/core";
import classNames from 'classnames';

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    root: {
      fontSize: "0.9em",
      ...theme.monotype
    },
  })
);

// Component properties
interface OwnProps {
  classes?: Partial<ClassNameMap<ClassKey>>;
  txid: string;
  vout?: number;
}

const defaults: Partial<OwnProps> = {}

type ClassKey = 'root';

/**
 *
 */
const Component = ((props: OwnProps) => {
  props = WithDefaults(props, defaults);
  const styles = useStyles();
  const {classes} = props;
  const value = props.txid + (typeof props.vout == "number" ? `:${props.vout}` : "");
  return <Typography className={classNames(styles.root, classes?.root)}>{value}</Typography>
})

export default Component;