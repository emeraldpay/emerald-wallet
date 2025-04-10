import { Table as TableBase, TableProps } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import classNames from 'classnames';
import * as React from 'react';

const useStyles = makeStyles()((theme) => ({
  withBorder: {
    '& th, & td': {
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
  },
  withoutBorder: {
    '& th, & td': {
      borderBottom: '1px solid transparent',
    },
  },
}));

interface OwnProps {
  divided?: boolean;
}

export const Table: React.FC<OwnProps & TableProps> = ({ className, children, divided = false, ...props }) => {
  const { classes } = useStyles();

  return (
    <TableBase className={classNames(className, divided ? classes.withBorder : classes.withoutBorder)} {...props}>
      {children}
    </TableBase>
  );
};
