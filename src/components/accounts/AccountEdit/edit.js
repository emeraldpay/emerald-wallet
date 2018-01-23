import { connect } from 'react-redux';
import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { Card, CardText } from 'material-ui';
import { TextField } from 'redux-form-material-ui';
import { Button } from 'emerald-js-ui';
import { renderTextField } from '../../../elements/formFields';
import ButtonGroup from '../../../elements/ButtonGroup';
import { required, address } from '../../../lib/validators';
import { cardSpace } from '../../../lib/styles';


export const AccountEdit = ({ handleSubmit, blockAddress, invalid, pristine, submitting, cancel }) => (
  <Card style={cardSpace}>
    <CardText expandable={false}>
      <form onSubmit={handleSubmit}>
        <Field name="address"
          component={TextField}
          type="text"
          label="ETC Address"
          disabled={blockAddress}
          fullWidth={true}
          validate={[required, address]} />
        <Field name="name"
          component={renderTextField}
          type="text"
          label="Account Name"
          validate={ required } />
        <Field name="description"
          component={renderTextField}
          type="text"
          label="Account Description" />
        <ButtonGroup>
          <Button
            label="Cancel"
            secondary={true}
            onClick={cancel} />
          <Button
            primary
            label="Save"
            type="submit"
            disabled={pristine || submitting || invalid } />
        </ButtonGroup>
      </form>
    </CardText>
  </Card>
);

export const AccountEditForm = reduxForm({
  form: 'AddressForm',
  fields: ['name', 'address', 'description'],
})(AccountEdit);

export default connect(
  (state, ownProps) => ({
    blockAddress: true,
    initialValues: {
      name: ownProps.account.get('name'),
      address: ownProps.account.get('id'),
      description: ownProps.account.get('description'),
    },
  }),
  (dispatch, ownProps) => ({
    onSubmit: (data) => {
      ownProps.submit(data);
    },
    cancel: () => {
      ownProps.cancel();
    },
  })
)(AccountEditForm);
