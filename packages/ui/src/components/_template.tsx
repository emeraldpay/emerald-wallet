import {makeStyles} from '@material-ui/core/styles';
import * as React from 'react';
import {Box, createStyles} from "@material-ui/core";


const useStyles = makeStyles(
  createStyles({
    // formRow: {
    //   ...css
    // },
  })
);

// Component properties
interface OwnProps {
  classes?: any;
}

const defaults: Partial<OwnProps> = {
  classes: {}
}

/**
 *
 */
const Component = ((props: OwnProps) => {
  props = {...props, ...defaults};
  const styles = useStyles();
  const {classes} = props;

  return <Box>
  </Box>
})

export default Component;