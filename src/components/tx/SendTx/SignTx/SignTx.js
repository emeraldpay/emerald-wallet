import { trimEnd } from 'lodash';
import { Button, ButtonGroup, IdentityIcon } from 'emerald-js-ui';
import { ArrowRight } from 'emerald-js-ui/lib/icons3';
import { required } from 'lib/validators';
import { Divider } from 'material-ui';
import muiThemeable from 'material-ui/styles/muiThemeable';
import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { Form, Row, styles } from '../../../../elements/Form';
import TextField from '../../../../elements/Form/TextField';
import { Currency } from '../../../../lib/currency';

const HorizontalAddressWithIdentity = (props) => {
  return (
    <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'center'}}>
      <IdentityIcon size={60} id={props.accountId} />
      <div style={{paddingTop: '10px'}}>{props.accountId}</div>
    </div>
  );
};


const passwordFields = (props) => {
  if (props.useLedger) {
    return null;
  }
  return (
    <Row>
      <div style={styles.left}>
        <div style={styles.fieldName}>
          Password
        </div>
      </div>
      <div style={styles.right}>
        <Field
          name="password"
          type="password"
          style={{ minWidth: '600px' }}
          component={TextField}
          hintText="Enter your Password"
          underlineShow={false}
          fullWidth={true}
          validate={[required]}
        />
      </div>
    </Row>
  );
};

const displayFlexCenter = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

<<<<<<< HEAD:src/components/tx/SendTx/SignTx/SignTx.js
export const SignTx = ((props) => {
  const { fiatRate, fiatCurrency, fee, tx, nativeTx } = props;
  const { onCancel, handleSubmit, muiTheme } = props;
=======
const SignTx = muiThemeable()((props) => {
  const { value, fiatRate, fiatCurrency, fee, tx, gas, token } = props;
  const { onCancel, handleSubmit } = props;
>>>>>>> problem: token sending not working:src/components/tx/SendTx/SignTx/SignTxForm.js

  // const USDValue = Currency.format(Currency.convert(value, fiatRate, 2), fiatCurrency);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '50px' }}>
        <HorizontalAddressWithIdentity accountId={tx.from} />
        <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ ...displayFlexCenter, flexDirection: 'column' }}>
            {/* <div>{USDValue} USD</div> */}
            <div style={{fontSize: '28px'}}>{tx.value.toFixed()} {tx.symbol}</div>
          </div>
          <div style={{display: 'flex'}}>
            <ArrowRight />
          </div>
        </div>
        <HorizontalAddressWithIdentity accountId={tx.to} />
      </div>
      <div style={{ paddingTop: '35px', display: 'flex', justifyContent: 'center' }}>
<<<<<<< HEAD:src/components/tx/SendTx/SignTx/SignTx.js
        <span style={{ color: muiTheme.palette.secondaryTextColor }}>
          Plus a {trimEnd(fee.getDecimalized(), '0')} ETC fee for 21000 GAS
=======
        <span style={{ color: props.muiTheme.palette.secondaryTextColor }}>
          Plus {trimEnd(fee.getDecimalized(), '0')} ETC for gas.
>>>>>>> problem: token sending not working:src/components/tx/SendTx/SignTx/SignTxForm.js
        </span>
      </div>
      <Divider style={{ marginTop: '35px' }} />
      <Form style={{ marginTop: '0' }}>
        {passwordFields(props)}
        <Row>
          <div style={styles.left} />
          <div style={{ paddingTop: '10px', ...styles.right }}>
            <ButtonGroup>
              <Button label="Cancel" onClick={onCancel} />
              <Button primary label="Sign & Send Transaction" onClick={handleSubmit} />
            </ButtonGroup>
          </div>
        </Row>
      </Form>
    </div>
  );
});

const SignTxForm = reduxForm({
  form: 'createTx',
  fields: ['password'],
  destroyOnUnmount: false,
  forceUnregisterOnUnmount: true,
})(muiThemeable()(SignTx));

export default SignTxForm;
