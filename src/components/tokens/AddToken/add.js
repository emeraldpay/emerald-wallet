import React from 'react';
import withStyles from 'react-jss';
import PropTypes from 'prop-types';
import { convert } from '@emeraldplatform/emerald-js';
import { connect } from 'react-redux';
import { Field, reduxForm, change, formValueSelector, reset, SubmissionError } from 'redux-form';
import TextField from 'elements/Form/TextField';
import { Button, ButtonGroup } from 'emerald-js-ui';
import { required, address } from 'lib/validators';
import TokenUnits from 'lib/tokenUnits';
import tokens from '../../../store/vault/tokens';

export const styles2 = {
  actionButtons: {
    marginTop: '10px',
  },
};

export class AddToken extends React.Component {
    static propTypes = {
      handleSubmit: PropTypes.func,
      token: PropTypes.object,
      clearToken: PropTypes.func,
      invalid: PropTypes.bool,
      pristine: PropTypes.bool,
      submitting: PropTypes.bool,
    };

    render() {
      const { token, handleSubmit, invalid, pristine, submitting } = this.props;
      const { clearToken, classes } = this.props;

      const total = (tokenData) => new TokenUnits(
        convert.toBigNumber(tokenData.totalSupply),
        convert.toBigNumber(tokenData.decimals));

      return (
        <div>
          <form onSubmit={ handleSubmit }>
            { !token &&
                    <div>
                      <div>
                        <Field
                          name="address"
                          component={ TextField }
                          underlineShow={ false }
                          fullWidth={ true }
                          hintText="Token Contract Address"
                          type="text"
                          label="Token Contract Address"
                          validate={ [required, address] }
                        />
                      </div>
                      <div className={ classes.actionButtons }>
                        <Button
                          primary
                          label="Submit"
                          type="submit"
                          disabled={pristine || submitting || invalid }
                        />
                      </div>
                    </div>
            }
            { token &&
                    (
                      <div>
                        <div>
                          <table>
                            <tbody>
                              <tr>
                                <td>Address</td>
                                <td>{ token.address }</td>
                              </tr>
                              <tr>
                                <td>Symbol</td>
                                <td>{ token.symbol }</td>
                              </tr>
                              <tr>
                                <td>Total supply</td>
                                <td>{ total(token).getDecimalized() }</td>
                              </tr>
                              <tr>
                                <td>Decimals</td>
                                <td>{ convert.toNumber(token.decimals) }</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div className={ classes.actionButtons }>
                          <ButtonGroup>
                            <Button
                              primary
                              label="Add"
                              type="submit"
                              disabled={pristine || submitting || invalid }
                            />
                            <Button
                              label="Cancel"
                              onClick={ clearToken }
                              disabled={ pristine || submitting || invalid }
                            />
                          </ButtonGroup>
                        </div>
                      </div>
                    )
            }
          </form>
        </div>
      );
    }
}

const StyledAddToken = withStyles(styles2)(AddToken);

const AddTokenForm = reduxForm({
  form: 'addToken',
  fields: ['address', 'name', 'token'],
})(StyledAddToken);

function mapDispatchToProps(dispatch, ownProps) {
  return {
    onSubmit: (data) => {
      if (data.token) {
        return dispatch(tokens.actions.addToken(data.token))
          .then(dispatch(reset('addToken')))
          .then(dispatch(tokens.actions.loadTokenBalances(data)));
      }

      return dispatch(tokens.actions.fetchTokenDetails(data.address))
        .then((result) => {
          return dispatch(change('addToken', 'token', result));
        });
    },
    clearToken: () => dispatch(reset('addToken')),
  };
}

function mapStateToProps(state, ownProps) {
  const selector = formValueSelector('addToken');
  const token = (selector(state, 'token'));
  return {
    token,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddTokenForm);
