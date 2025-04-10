import { makeStyles } from 'tss-react/mui';
import * as React from 'react';

const useStyles = makeStyles()((theme) => ({
  monospace: {
    ...theme.monotype,
    fontWeight: 'normal',
  },
}));

interface OwnProps {
  text: string;
}

const Monospace: React.FC<OwnProps> = ({ text }) => {
  const { classes } = useStyles();

  return <span className={classes.monospace}>{text}</span>;
};

export default Monospace;
