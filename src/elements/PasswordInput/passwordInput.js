import React from 'react';
import TextField from 'elements/Form/TextField';
import { Warning, WarningText } from 'elements/Warning/warning';
import { EyeIcon } from 'elements/Icons';


class PasswordInput extends React.Component {

    constructor(props) {
        super(props);
    }

    onInputChange = (event, newValue) => {
        const { onChange } = this.props;

        onChange(newValue);
    };

    renderWarning = () => (
        <div style={{ marginTop: '10px' }}>
            <Warning>
                <WarningText>Password must be minimum 8 characters.</WarningText>
            </Warning>
        </div>
    );

    render() {
        const { invalid } = this.props;

        return (
            <div>
                <div>
                    <TextField
                        invalid={ invalid }
                        rightIcon={ <EyeIcon/> }
                        onChange={ this.onInputChange }
                        hintText="At least 8 characters"
                        type="password"
                        name="password"
                        fullWidth={ true }
                        underlineShow={ false }
                    />
                </div>
                { invalid && this.renderWarning() }
            </div>
        );
    }
}


export default PasswordInput;

