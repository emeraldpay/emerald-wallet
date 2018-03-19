import { connect } from 'react-redux';
import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { Card, CardText } from 'material-ui';
import { TextField } from 'redux-form-material-ui';
import { Button, ButtonGroup } from 'emerald-js-ui';
import { required, address } from '../../../lib/validators';
import { cardSpace } from '../../../lib/styles';


export const AccountEdit = ({ handleSubmit, blockAddress, invalid, pristine, submitting, cancel }) => (
  <Card style={cardSpace}>
    <CardText expandable={false}>
      <form onSubmit={handleSubmit}>
        <div>
          <Field
            name="address"
            component={TextField}
            type="text"
            hintText="ETC Address"
            disabled={blockAddress}
            fullWidth={true}
            validate={[required, address]}
          />
        </div>
        <div>
          <Field
            name="name"
            component={TextField}
            type="text"
            floatingLabelText="Account Name"
            validate={required}
          />
        </div>
        <div>
          <Field
            name="description"
            component={TextField}
            type="text"
            floatingLabelText="Account Description"
          />
        </div>
        <ButtonGroup>
          <Button
            label="Cancel"
            secondary={true}
            onClick={cancel} />
          <Button
            primary
            label="Save"
            type="submit"
            disabled={pristine || submitting || invalid} />
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
