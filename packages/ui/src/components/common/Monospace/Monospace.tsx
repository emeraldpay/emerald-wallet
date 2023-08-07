import { createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';

const useStyles = makeStyles((theme) =>
  createStyles({
    monospace: {
      ...theme.monotype,
      fontWeight: 'normal',
    },
  }),
);

interface OwnProps {
  text: string;
}

const Monospace: React.FC<OwnProps> = ({ text }) => {
  const styles = useStyles();

  return <span className={styles.monospace}>{text}</span>;
};

export default Monospace;
