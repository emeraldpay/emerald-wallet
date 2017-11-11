// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import { MenuItem } from 'material-ui';

import IdentityIcon from '../../../elements/IdentityIcon';
import SelectField from '../../../elements/Form/SelectField';

/**
 * Address with IdentityIcon. We show it in from field select control
 */
const AddressWithIcon = ({ address, name }) => {
    const style = {
        div: {
            display: 'flex',
            alignItems: 'center',
        },
        address: {
            marginLeft: '5px',
            fontSize: '16px',
            color: '#191919',
        },
    };
    return (
        <div style={style.div}>
            <IdentityIcon size={30} expanded={true} id={ address }/>
            <div style={ style.address }>{ name || address }</div>
        </div>
    );
};


class SelectAddressField extends React.Component {

    static propTypes = {
        name: PropTypes.string.isRequired,
        accounts: PropTypes.object.isRequired,
        onChangeAccount: PropTypes.func,
    };

    onChange = (event, value) => {
        this.props.onChangeAccount(this.props.accounts, value);
    };

    render() {
        const { name, accounts } = this.props;
        return (
            <Field
                name={ name }
                onChange={ this.onChange }
                component={ SelectField }
                underlineShow={ false }
                fullWidth={ true }
                dropDownMenuProps={{
                    menuStyle: {
                        overflowX: 'hidden',
                    },
                    selectionRenderer: (val) => (<AddressWithIcon address={ val }/>),
                }}>
                { accounts.map((account) =>
                    <MenuItem
                        key={ account.get('id') }
                        value={ account.get('id') }
                        primaryText={<AddressWithIcon address={ account.get('id') }/> }
                    />
                )}
            </Field>);
    }
}

export default SelectAddressField;
