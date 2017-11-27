import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { renderTextField } from 'elements/formFields';
import { Card, CardText, FlatButton } from 'material-ui';
import { required, address } from 'lib/validators';
import { cardSpace } from 'lib/styles';
import { TextField } from 'redux-form-material-ui';

const Render = ({ handleSubmit, blockAddress, invalid, pristine, submitting, cancel }) => (
  <Card style={cardSpace}>
    <CardText expandable={false}>
      <form onSubmit={handleSubmit}>
        <Field name="address"
          component={TextField}
          type="text"
          label="Network Address"
          disabled={blockAddress}
          fullWidth={true}
          validate={[required, address]} />
        <Field name="name"
          component={renderTextField}
          type="text"
          label="Address Name"
          validate={ required } />
        <Field name="description"
          component={renderTextField}
          type="text"
          label="Address Description" />
        <FlatButton label="Save" type="submit"
          disabled={pristine || submitting || invalid } />
        <FlatButton label="Cancel"
          secondary={true}
          onClick={cancel} />
      </form>
    </CardText>
  </Card>
);

export const AddressForm = reduxForm({
  form: 'AddressForm',
  fields: ['name', 'address', 'description'],
})(Render);
