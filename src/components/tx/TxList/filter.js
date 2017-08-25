import React from 'react';
import { ToggleButtonGroup, ToggleButton } from 'react-bootstrap';


/**
 * TODO: After Material-UI v 1.0 release switch to ToggleButton
 * (see: https://github.com/callemall/material-ui/pull/7551)
 *
 */

class Filter extends React.Component {
    render() {
        const { defaultValue } = this.props;
        return (
            <ToggleButtonGroup name="options" type="radio" defaultValue={ 1 }>
                <ToggleButton value={ 1 }>ALL</ToggleButton>
                <ToggleButton value={ 2 }>IN</ToggleButton>
                <ToggleButton value={ 3 }>OUT</ToggleButton>
            </ToggleButtonGroup>
        );
    }
}


export default Filter;