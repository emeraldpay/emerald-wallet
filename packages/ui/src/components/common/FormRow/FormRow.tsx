import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';

export const styles = {
  formRow: {
    display: 'flex',
    marginBottom: '19px',
    alignItems: 'center'
  },
  left: {
    flexBasis: '20%',
    marginLeft: '14.75px',
    marginRight: '14.75px'
  },
  right: {
    flexGrow: 2,
    display: 'flex',
    alignItems: 'center',
    marginLeft: '14.75px',
    marginRight: '14.75px',
    maxWidth: '580px'
  }
};

export interface IFormRowProps {
  leftColumn?: React.ReactElement;
  rightColumn?: React.ReactElement;
  classes: any;
}

export function FormRow (props: IFormRowProps) {
  const { classes, leftColumn, rightColumn } = props;
  return (
    <div className={classes.formRow}>
      <div className={classes.left}>{leftColumn}</div>
      <div className={classes.right}>{rightColumn}</div>
    </div>
  );
}

export default withStyles(styles)(FormRow);
