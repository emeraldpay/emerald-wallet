import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { renderTextField } from 'elements/formFields';
import { Card, CardText, FlatButton } from 'material-ui';
import { required, address } from 'lib/validators';
import { cardSpace } from 'lib/styles';

const Render = ({handleSubmit, blockAddress, invalid, pristine, submitting, cancel}) => {

    return (
      <Card style={cardSpace}>
        <CardText expandable={false}>
            <form onSubmit={handleSubmit}>
                <Field  name="address" 
                        component={renderTextField} 
                        type="text" 
                        label="Network Address"
                        disabled={blockAddress}
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
        </CardText>
      </Card>
    );
};

export const AddressForm = reduxForm({
    form: 'AddressForm',
    fields: ['name', 'address', 'description']
})(Render);
