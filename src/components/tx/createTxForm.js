import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { SelectField, TextField, RadioButtonGroup } from 'redux-form-material-ui';
import { RadioButton } from 'material-ui/RadioButton';
import { MenuItem, FlatButton, FontIcon, IconButton } from 'material-ui';
import { Grid, Row, Col } from 'react-flexbox-grid/lib/index';
import { IconMenu } from 'material-ui/IconMenu';
import KeyboardArrowLeft from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import ImportContacts from 'material-ui/svg-icons/communication/import-contacts';
import { red200 } from 'material-ui/styles/colors';
import { positive, number, required, address } from 'lib/validators';
import IdentityIcon from '../accounts/identityIcon';

const textEtc = {
  fontSize: '20px',
  fontWeight: '500',
  lineHeight: '24px',
};

const textFiat = {
  marginTop: '5px',
  fontSize: '14px',
  lineHeight: '16px',
};

const textFiatLight = {
  marginTop: '5px',
  fontSize: '14px',
  lineHeight: '16px',
  color: '#747474',
  textAlign: 'center',
  width: '100%',
};

const formLabel = {
    color: '#747474', 
    fontSize: '18px',
    lineHeight: '24px',
    textAlign: 'right',
    marginRight: '30px',
}

const formGroup = {
  marginTop: '10px',
}

const formInput = {
    boxSizing: 'border-box',
    height: '51px', 
    border: '1px solid #DDDDDD',
    borderRadius: '1px',
    color: '#191919',
    fontSize: '16px',
    lineHeight: '24px',
    paddingLeft: '10px',
    paddingRight: '10px',
}

const submitButton = {
    height: '40px',
    fontSize: '14px',
    fontWeight: '500', 
    borderRadius: '1px',
    color: '#fff',
    width: '100%',
}

const cancelButton = {
    height: '40px',
    fontSize: '14px',
    fontWeight: '500', 
    borderRadius: '1px',
    width: '100%',
}

const linkText = {
    marginTop: '5px',
    color: '#47B04B', 
    fontSize: '14px',  
    fontWeight: '500', 
    lineHeight: '20px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    textDecoration: 'none',
};

const balanceGroup = {
    marginTop: '10px',
    height: '40px',
}

const cardStyle = {
    paddingTop: '100px',
    paddingBottom: '100px',
}

const CardHeadEmerald = (props) => {
  const { title, backLabel, cancel } = props;
  const style = {
    color: '#191919',
    fontSize: '22px',
    lineHeight: '24px',
    textAlign: 'left',
  }

  const flatButtonNav = {
    color: '#747474',
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '24px',
  };

  return (
      <Row middle="xs" style={{marginBottom: '60px'}}>
        <Col xs={4}>
          <FlatButton label={backLabel}
                      primary={true}
                      onClick={cancel}
                      style={flatButtonNav}
                      icon={<KeyboardArrowLeft/>}
          />
        </Col>
        <Col xs={6} style={style}>{title}</Col>
      </Row>
  );

};

const BalanceField = ({ input, rate }) => {
  const style = {
    marginTop: '10px',
    color: '#191919',
    textAlign: 'left',
  };

  return (
    <div style={style}>
      <div style={textEtc}>
        {input.value.getEther(6)} ETC
      </div>
      <div style={textFiat}>
        ${input.value.getFiat(rate)}
      </div>
    </div>
  );
};

const Render = (props) => {
    const { fields: { from, to }, accounts, balance, handleSubmit, invalid, pristine, submitting } = props;
    const { addressBook, handleSelect, tokens, token, isToken, onChangeToken, onChangeAccount } = props;
    const { fiatRate, value, fromAddr, onEntireBalance } = props;
    const { error, cancel } = props;

    return (
    <Grid style={cardStyle}>
      <CardHeadEmerald 
        backLabel='DASHBOARD'
        title='Send Ether & Tokens'
        cancel={cancel}
      />
        <Row>
          <Col xs={12} md={8}>
            <Row middle="xs">
              <Col xs={2} xsOffset={1} style={formLabel}>
                From
              </Col>
              <Col xs={8} style={formGroup}>
                <Field name="from"
                       style={formInput}
                       onChange={(event, val) => onChangeAccount(accounts, val)}
                       component={SelectField}
                       underlineShow={false}
                       fullWidth={true}>
                  {accounts.map((account) =>
                    <MenuItem 
                        leftIcon={<IdentityIcon id={account.get('id')}/>}
                        key={account.get('id')} 
                        value={account.get('id')} 
                        primaryText={account.get('id')} />
                  )}
                </Field>
              </Col>
            </Row>
            <Row middle="xs">
              <Col xs={2} xsOffset={1} style={formLabel}>
                Password
              </Col>            
              <Col xs={8} style={formGroup}>
                <Field name="password"
                       style={formInput}
                       type="password"
                       component={TextField}
                       underlineShow={false}
                       fullWidth={true}
                       validate={required}>
                </Field>
              </Col>
            </Row>
            <Row middle="xs">
              <Col xs={2} xsOffset={1} style={formLabel}>
                To
              </Col>
              <Col xs={7} style={formGroup}>
                <Field name="to"
                       style={formInput}
                       component={TextField}
                       validate={[required, address]}
                       underlineShow={false}
                       fullWidth={true}
                />
              </Col>
              <Col xs={1} style={formGroup}>
                <IconMenu
                    iconButtonElement={<IconButton><ImportContacts /></IconButton>}
                    onItemTouchTap={handleSelect}
                >
                {accounts.map((account) =>
                  <MenuItem 
                    leftIcon={<IdentityIcon id={account.get('id')}/>}
                    key={account.get('id')}
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
            <Row middle="xs">
              <Col xs={2} xsOffset={1} style={formLabel}>
                Amount
              </Col>
              <Col xs={7} style={formGroup}>
                <Field name="value"
                       style={formInput}
                       component={TextField}
                       hintText="1.0000"
                       fullWidth={true}
                       underlineShow={false}
                       validate={[required]}
                />
              </Col>
              <Col xs={1} style={formGroup}>
                <Field name="token"
                       component={SelectField}
                       onChange={onChangeToken}
                       value={token}
                       underlineShow={false}
                       fullWidth={true}>
                  {tokens.map((it) =>
                    <MenuItem key={it.get('address')}
                              style={formInput}
                              value={it.get('address')}
                              label={it.get('symbol')}
                              primaryText={it.get('symbol')} />
                  )}
                </Field>
              </Col>
              {isToken &&
              <Col xs={2} style={formGroup}>
                <Field name="isTransfer"
                       style={formInput}
                       component={RadioButtonGroup}
                       defaultSelected="true"
                       validate={required}>
                  <RadioButton value="true" label="Transfer"/>
                  <RadioButton value="false" label="Approve for Withdrawal"/>
                </Field>
              </Col> }
            </Row>
            <Row top="xs" style={balanceGroup}>
              <Col xs={3} style={formLabel} />
              <Col xs={2} style={textFiatLight}>
                  {value && `$${value.getFiat(fiatRate).toString()}` }
              </Col>
              <Col xs={3} style={linkText} onClick={() => onEntireBalance(balance)}>
                Entire Balance
              </Col>
            </Row>
            <Row middle="xs">
              <Col xs={2} xsOffset={1} style={formLabel}>
                Fee
              </Col>
              <Col xs={5} style={formGroup}>
                <Field name="gasPrice"
                       component={TextField}
                       hintText="23000"
                       style={formInput}
                       underlineShow={false}
                       validate={[required, number, positive]}
                />
              </Col>
            </Row>
            {/*<Row>
              <Col xs={12}>
                <Field name="gas"
                       component={TextField}
                       floatingLabelText="Gas Amount"
                       hintText="21000"
                       validate={[required, number, positive]}
                />
              </Col>
            </Row>*/}
            <Row top="xs">
              <Col xs={3} style={formLabel} />
              <Col xs={3} style={formGroup}>
                <FlatButton label={`Send ${value && value.getEther(2).toString() } ETC`}
                            disabled={ pristine || submitting || invalid }
                            onClick={handleSubmit}
                            style={submitButton}
                            backgroundColor="#47B04B"
                             />
                <br />
              </Col>
              <Col xs={3} style={formGroup}>                             
                <FlatButton label="Cancel"
                            onClick={cancel}
                            style={cancelButton}
                            backgroundColor="#DDD" />                     
              </Col>              
            </Row>         
          </Col>

          <Col xs={12} md={4}>
            <Row>
              <Field name="balance"
                     disabled={true}
                     component={BalanceField}
                     floatingLabelText="Balance"
                     rate={fiatRate}
              />
            </Row>
            <Row style={{marginTop: '40px'}}>
                <a style={linkText} href={`http://gastracker.io/addr/${fromAddr}`}>Transaction History</a>
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
    </Grid>
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
    fiatRate: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    balance: PropTypes.number.isRequired,
    fromAddr: PropTypes.string.isRequired,
    onEntireBalance: PropTypes.func.isRequired,

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
