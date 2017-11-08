// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { SelectField, MenuItem } from 'material-ui';


type Props = {
    hdbase: string,
    onChange: (value: string) => void,
}

class HDPath extends React.Component<Props> {
    static propTypes = {
        hdbase: PropTypes.string,
        onChange: PropTypes.func,
    };

    handleChange = (event, index, value) => {
        if (this.props.onChange) {
            this.props.onChange(value);
        }
    };

    render() {
        const { hdbase } = this.props;
        return (
            <SelectField value={ hdbase } onChange={ this.handleChange }>
                <MenuItem value="44'/61'/1'/0" primaryText="44'/61'/1'/0" />
                <MenuItem value="44'/61'/0'/0" primaryText="44'/61'/0'/0" />
                <MenuItem value="44'/60'/160720'/0" primaryText="44'/60'/160720'/0" />
                <MenuItem value="44'/60'/0'" primaryText="44'/60'/0'" />
            </SelectField>
        );
    }
}

export default HDPath;
