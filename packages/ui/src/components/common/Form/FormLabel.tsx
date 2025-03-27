import classNames from 'classnames';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
  root: {
    color: theme.palette.text.secondary,
    flexShrink: 0,
    fontSize: 16,
    fontWeight: 400,
    paddingRight: 30,
    textAlign: 'right',
    width: 160,
    fontFamily: theme.typography.fontFamily
  },
  top: {
    alignSelf: 'flex-start',
    lineHeight: '28px',
    paddingTop: 10,
  },
}));

interface OwnProps {
  top?: boolean | number;
  children?: React.ReactNode;
  classes?: {
    root?: string;
  };
}

const Label: React.FC<OwnProps> = ({ children, top, classes: classesOverride }) => {
  const { classes } = useStyles();

  return (
    <label
      className={classNames(classesOverride?.root || classes.root, top == null ? undefined : classes.top)}
      style={{ paddingTop: typeof top === 'number' ? top : undefined }}
    >
      {children}
    </label>
  );
};

export default Label;
