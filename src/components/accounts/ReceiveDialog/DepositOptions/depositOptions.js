import React from 'react';
import { ToggleButtonGroup, ToggleButton } from 'react-bootstrap';


/**
 * TODO: After Material-UI v 1.0 release switch to ToggleButton
 * (see: https://github.com/callemall/material-ui/pull/7551)
 *
 */

class DepositOptions extends React.Component {
    render() {
        const { defaultValue } = this.props;
        return (
                <ToggleButtonGroup name="options" type="radio" defaultValue={ 1 }>
                    <ToggleButton value={ 1 }>ETC</ToggleButton>
                    <ToggleButton value={ 2 }>BITCOIN</ToggleButton>
                    <ToggleButton value={ 3 }>LITECOIN</ToggleButton>
                </ToggleButtonGroup>
        );
    }
}


export default DepositOptions;
