import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { FlatButton } from 'material-ui';
import TextField from 'elements/Form/TextField';
import { required, address } from 'lib/validators';
import { Form, Row, styles as formStyles } from 'elements/Form';

const Render = ({ handleSubmit, blockAddress, invalid, pristine, submitting, cancel }) => (
  <Form>
    <Row expandable={false}>
      <div style={formStyles.left}>
        <div style={ formStyles.fieldName }>Address</div>
      </div>
      <div style={formStyles.right} >
        <Field
          underlineShow={false}
          name="address"
          component={TextField}
          type="text"
          disabled={blockAddress}
          fullWidth={true}
          validate={[required, address]}
        />
      </div>
    </Row>
    <Row>
      <div style={formStyles.left}>
        <div style={ formStyles.fieldName }>Name</div>
      </div>
      <div style={formStyles.right} >
        <Field
          underlineShow={false}
          name="name"
          component={TextField}
          type="text"
          validate={required} /></div>
    </Row>
    <Row>
      <div style={formStyles.left}>
        <div style={ formStyles.fieldName }>Description</div>
      </div>
      <div style={formStyles.right} >
        <Field
          underlineShow={false}
          name="description"
          component={TextField}
          type="text"
        /></div>
    </Row>
    <Row>
      <div style={formStyles.left} />
      <div style={formStyles.right}>
        <FlatButton
          label="Save"
          type="submit"
          onClick={handleSubmit}
          disabled={pristine || submitting || invalid}
        />
        <FlatButton
          label="Cancel"
          secondary={true}
          onClick={cancel}
        />
      </div>
    </Row>
  </Form>
);

export const AddressForm = reduxForm({
  form: 'AddressForm',
  fields: ['name', 'address', 'description'],
})(Render);
