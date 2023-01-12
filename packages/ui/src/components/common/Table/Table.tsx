import { Table as BaseTable, TableProps, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import classNames from 'classnames';
import * as React from 'react';
import Theme from '../../../theme';

const useStyles = makeStyles((theme: typeof Theme) =>
  createStyles({
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
  }),
);

interface OwnProps {
  divided?: boolean;
}

export const Table: React.FC<OwnProps & TableProps> = ({ className, children, divided = false, ...props }) => {
  const styles = useStyles();

  return (
    <BaseTable className={classNames(className, divided ? styles.withBorder : styles.withoutBorder)} {...props}>
      {children}
    </BaseTable>
  );
};
