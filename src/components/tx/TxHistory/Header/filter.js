// @flow
import React from 'react';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';

type Props = {
  value: string,
  onChange: Function
}

class Filter extends React.Component<Props> {
  render() {
    const { value, onChange } = this.props;
    return (
      <ToggleButtonGroup
        exclusive
        value={value || 'ALL'}
        onChange={onChange}
      >
        <ToggleButton value={'ALL'}>ALL</ToggleButton>
        <ToggleButton value={'IN'}>IN</ToggleButton>
        <ToggleButton value={'OUT'}>OUT</ToggleButton>
      </ToggleButtonGroup>
    );
  }
}

export default Filter;
