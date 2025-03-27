import { makeStyles } from 'tss-react/mui';
import { CSSProperties } from 'react';
import * as React from 'react';

const useStyles = makeStyles()({
  container: {
    alignItems: 'center',
    display: 'flex',
    paddingBottom: 20,
  },
});

interface OwnProps {
  last?: boolean;
  style?: CSSProperties;
  children?: React.ReactNode;
}

const FormRow: React.FC<OwnProps> = ({ children, last, style }) => {
  const { classes } = useStyles();

  return (
    <div className={classes.container} style={{ paddingBottom: last === undefined ? undefined : 0, ...style }}>
      {children}
    </div>
  );
}

export default FormRow;
