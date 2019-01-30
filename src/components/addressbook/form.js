import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { ButtonGroup, Button } from 'emerald-js-ui';
import TextField from 'elements/Form/TextField';
import { required, address } from 'lib/validators';
import { Form, Row, styles as formStyles } from 'elements/Form';

const titleStyle = {
  fontSize: '18px',
  fontWeight: '400',
};

const Render = ({
  handleSubmit, blockAddress, invalid, pristine, submitting, cancel, title,
}) => (
  <Form>
    <Row>
      <div style={formStyles.left}>
      </div>
      <div style={formStyles.right} >
        <span style={titleStyle}>{title}</span>
      </div>
    </Row>
    <Row expandable={false}>
      <div style={formStyles.left}>
        <div style={formStyles.fieldName}>Address</div>
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
        <div style={formStyles.fieldName}>Name</div>
      </div>
      <div style={formStyles.right} >
        <Field
          underlineShow={false}
          name="name"
          component={TextField}
          type="text"
          validate={required} /></div>
    </Row>
    {/* <Row>
      <div style={formStyles.left}>
        <div style={formStyles.fieldName}>Description</div>
      </div>
      <div style={formStyles.right} >
        <Field
          underlineShow={false}
          name="description"
          component={TextField}
          type="text"
        /></div>
    </Row> */}
    <Row>
      <div style={formStyles.left} />
      <div style={formStyles.right}>
        <ButtonGroup>
          <Button
            label="Cancel"
            onClick={cancel}
          />
          <Button
            primary
            label="Save"
            disabled={pristine || submitting || invalid}
            onClick={handleSubmit}
          />
        </ButtonGroup>
      </div>
    </Row>
  </Form>
);

export const AddressForm = reduxForm({
  form: 'AddressForm',
  fields: ['name', 'address', 'description'],
})(Render);
