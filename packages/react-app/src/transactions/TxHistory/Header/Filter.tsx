import { withStyles } from '@material-ui/core/styles';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import * as React from 'react';

const styles = {
  root: {
    boxShadow: 'none'
  }
};

interface IFilterProps {
  value: string;
  onChange?: any;
  classes?: any;
}

function Filter (props: IFilterProps) {
  const { value, onChange, classes } = props;
  return (
    <ToggleButtonGroup
      classes={{ root: classes.root }}
      exclusive={true}
      value={value || 'ALL'}
      onChange={onChange}
    >
      <ToggleButton value={'ALL'}>ALL</ToggleButton>
      <ToggleButton value={'IN'}>IN</ToggleButton>
      <ToggleButton value={'OUT'}>OUT</ToggleButton>
    </ToggleButtonGroup>
  );
}

export default withStyles(styles)(Filter);
