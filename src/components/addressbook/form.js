import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { renderTextField } from 'elements/formFields';
import FlatButton from 'material-ui/FlatButton';
import { required, address } from 'lib/validators';

const Render = ({handleSubmit, invalid, pristine, submitting, cancel}) => {

    return (
            <form onSubmit={handleSubmit}>
                <Field  name="address" 
                        component={renderTextField} 
                        type="text" 
                        label="Network Address"
                        validate={[ required, address ]} />
                <Field  name="name" 
                        component={renderTextField} 
                        type="text" 
                        label="Address Name"
                        validate={ required } />
                <Field  name="description" 
                        component={renderTextField} 
                        type="text" 
                        label="Address Description" />
                <FlatButton label="Save" type="submit"
                            disabled={pristine || submitting || invalid } />
                <FlatButton label="Cancel" 
                            onClick={cancel} />
            </form>
        );
};

export const AddressForm = reduxForm({
    form: 'AddressForm',
    fields: ['name', 'address', 'description']
})(Render);
