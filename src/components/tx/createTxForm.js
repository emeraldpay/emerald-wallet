import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import { SelectField, TextField, RadioButtonGroup } from 'redux-form-material-ui';
import { RadioButton } from 'material-ui/RadioButton';
import { MenuItem, FlatButton, FontIcon, IconButton } from 'material-ui';
import Divider from 'material-ui/Divider';
import { IconMenu } from 'material-ui/IconMenu';
import ImportContacts from 'material-ui/svg-icons/communication/import-contacts';
import { Row, Col } from 'react-flexbox-grid/lib/index';
import { red200 } from 'material-ui/styles/colors';
import { cardSpace } from 'lib/styles';
import { positive, number, required, address } from 'lib/validators';

/**
  TODO (elaine):
    `balance` is a temporary placeholder.
    Replace with card containing full account data.
****/

const Render = (props) => {
    const { fields: { from, to }, accounts, balance, handleSubmit, invalid, pristine, submitting } = props;
    const { addressBook, handleSelect, tokens, token, isToken, onChangeToken, onChangeAccount } = props;
    const { error, cancel } = props;

    return (
    <Card style={cardSpace}>
      <CardActions>
          <FlatButton label="ACCOUNT"
                      primary={true}
                      onClick={cancel}
                      icon={<FontIcon className="fa fa-arrow-left" />}/>
      </CardActions>
      <CardHeader
        title='Send Transaction'
        actAsExpander={false}
        showExpandableButton={false}
      />

      <CardText expandable={false}>
        <Row>
          <Col xs={12} md={8}>
            <Row>
              <Col xs={12}>
                <Field name="from"
                       floatingLabelText="From"
                       onChange={(event, val) => onChangeAccount(accounts, val)}
                       component={SelectField}
                       fullWidth={true}>
                  {accounts.map((account) =>
                    <MenuItem key={account.get('id')} value={account.get('id')} primaryText={account.get('id')} />
                  )}
                </Field>
                <Field name="balance"
                       disabled={true}
                       component={TextField}
                       floatingLabelText="Balance"
                />
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <Field name="password"
                       floatingLabelText="Password"
                       type="password"
                       component={TextField}
                       fullWidth={true}
                       validate={required}>
                </Field>
              </Col>
            </Row>
            <Row>
              <Col xs={11}>
                <Field name="to"
                       component={TextField}
                       floatingLabelText="Target Address"
                       validate={[required, address]}
                       fullWidth={true}
                />
              </Col>
              <Col xs={1}>
                <IconMenu
                    iconButtonElement={<IconButton><ImportContacts /></IconButton>}
                    onItemTouchTap={handleSelect}
                >
                {accounts.map((account) =>
                  <MenuItem key={account.get('id')}
                    value={account.get('id')}
                    primaryText={account.get('name') ? account.get('name') : account.get('id')} />
                )}
                {/*
                <Divider />
                {addressBook.map((account) =>
                  <MenuItem key={account.get('id')} value={account.get('id')} primaryText={account.get('id')} />
                )}
                */}
                </IconMenu>
              </Col>
            </Row>
            <Row>
              <Col xs={8} md={6}>
                <Field name="value"
                       component={TextField}
                       floatingLabelText="Amount"
                       hintText="1.0000"
                       validate={[required]}
                />
              </Col>
              <Col xs={4} md={4}>
                <Field name="token"
                       component={SelectField}
                       onChange={onChangeToken}
                       value={token}
                       fullWidth={true}>
                  {tokens.map((it) =>
                    <MenuItem key={it.get('address')}
                              value={it.get('address')}
                              label={it.get('symbol')}
                              primaryText={it.get('symbol')} />
                  )}
                </Field>
              </Col>
              {isToken &&
              <Col>
                <Field name="isTransfer"
                       component={RadioButtonGroup}
                       defaultSelected="true"
                       validate={required}>
                  <RadioButton value="true" label="Transfer"/>
                  <RadioButton value="false" label="Approve for Withdrawal"/>
                </Field>
              </Col> }
            </Row>
          </Col>

          <Col xs={12} md={4}>
            <Row>
              <Col xs={12}>
                <Field name="gasPrice"
                       component={TextField}
                       floatingLabelText="Gas Price (MGas)"
                       hintText="10000"
                       validate={[required, number, positive]}
                />
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <Field name="gas"
                       component={TextField}
                       floatingLabelText="Gas Amount"
                       hintText="21000"
                       validate={[required, number, positive]}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        {error && (
          <Row>
            <Col>
              <span style={{ color: red200 }}><strong>{error}</strong></span>
            </Col>
          </Row>
        )}
      </CardText>

      <CardActions>
        <FlatButton label="Cancel"
                    onClick={cancel}
                    icon={<FontIcon className="fa fa-ban" />}
                    secondary={true} />
        <FlatButton label="Send"
                    disabled={ pristine || submitting || invalid }
                    onClick={handleSubmit}
                    icon={<FontIcon className="fa fa-check" />}
                     />
      </CardActions>
    </Card>
    );
};

Render.propTypes = {
    fields: PropTypes.array.isRequired, // verify in react-form
    accounts: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    invalid: PropTypes.bool.isRequired,
    pristine: PropTypes.bool.isRequired,
    submitting: PropTypes.bool.isRequired,
    cancel: PropTypes.func.isRequired,

    addressBook: PropTypes.object.isRequired,
    handleSelect: PropTypes.func.isRequired,
    tokens: PropTypes.object.isRequired,
    token: PropTypes.object,
    isToken: PropTypes.string,
    onChangeToken: PropTypes.func.isRequired,

    error: PropTypes.string,
};

const CreateTxForm = reduxForm({
    form: 'createTx',
    fields: ['to', 'from', 'password', 'value', 'token', 'gasPrice', 'gas', 'token', 'isTransfer'],
})(Render);

export default CreateTxForm;
