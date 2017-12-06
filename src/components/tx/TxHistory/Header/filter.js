// @flow
import React from 'react';
import { ToggleButtonGroup, ToggleButton } from 'react-bootstrap';

/**
 * TODO: After Material-UI v 1.0 release switch to ToggleButton
 * (see: https://github.com/callemall/material-ui/pull/7551)
 *
 */

type Props = {
  value: string,
  onChange: Function
}

class Filter extends React.Component<Props> {
  render() {
    return (
      <ToggleButtonGroup name="options" type="radio" defaultValue={this.props.value || 'ALL'} value={this.props.value} onChange={this.props.onChange}>
        <ToggleButton value={'ALL'}>ALL</ToggleButton>
        <ToggleButton value={'IN'}>IN</ToggleButton>
        <ToggleButton value={'OUT'}>OUT</ToggleButton>
      </ToggleButtonGroup>
    );
  }
}

export default Filter;
