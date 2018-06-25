import { trimEnd } from 'lodash';
import { Button, ButtonGroup, IdentityIcon, Input } from 'emerald-js-ui';
import { ArrowRight } from 'emerald-js-ui/lib/icons3';
import { required } from 'lib/validators';
import { Divider } from 'material-ui';
import muiThemeable from 'material-ui/styles/muiThemeable';
import React from 'react';
import { Form, Row, styles } from '../../../../elements/Form';
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
        <Input
          name="password"
          type="password"
          onChange={props.onChange}
          style={{ minWidth: '600px' }}
          hintText="Enter your Password"
          underlineShow={false}
          fullWidth={true}
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

const SignTx = muiThemeable()((props) => {
  const { value, fiatRate, fiatCurrency, txFee, tx } = props;
  const { onCancel, onChangePassword, onSubmit, useLedger } = props;

  const onChange = (event, val) => {
    onChangePassword(val);
  };

  // const USDValue = Currency.format(Currency.convert(tx.amount, fiatRate, 2), fiatCurrency);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '50px' }}>
        <HorizontalAddressWithIdentity accountId={tx.from} />
        <div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ ...displayFlexCenter, flexDirection: 'column' }}>
            {/* <div>{USDValue} USD</div> */}
            <div style={{fontSize: '28px'}}>{tx.amount} {tx.token}</div>
          </div>
          <div style={{display: 'flex'}}>
            <ArrowRight />
          </div>
        </div>
        <HorizontalAddressWithIdentity accountId={tx.to} />
      </div>
      <div style={{ paddingTop: '35px', display: 'flex', justifyContent: 'center' }}>
        <span style={{ color: props.muiTheme.palette.secondaryTextColor }}>
          Plus {txFee} ETC for {tx.gasLimit} GAS.
        </span>
      </div>
      <Divider style={{ marginTop: '35px' }} />
      <Form style={{ marginTop: '0' }}>
        {passwordFields({...props, onChange})}
        <Row>
          <div style={styles.left} />
          <div style={{ paddingTop: '10px', ...styles.right }}>
            <ButtonGroup>
              <Button label="Cancel" onClick={onCancel} />
              <Button primary label="Sign & Send Transaction" onClick={onSubmit} />
            </ButtonGroup>
          </div>
        </Row>
      </Form>
    </div>
  );
});

export default SignTx;
