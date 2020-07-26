import {makeStyles} from '@material-ui/core/styles';
import * as React from 'react';
import {Box, createStyles, Theme} from "@material-ui/core";
import {ClassNameMap} from "@material-ui/styles";
import {WithDefaults} from "@emeraldwallet/core";

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    // root: {
    //   ...css
    // },
  })
);

// Component properties
interface OwnProps {
  classes?: Partial<ClassNameMap<ClassKey>>;
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

  return <Box>
  </Box>
})

export default Component;