import React from 'react';
import PropTypes from 'prop-types';
import TextField from 'elements/Form/TextField';
import Button from 'elements/Button';
import LinkButton from 'elements/LinkButton';
import { Form, Row, styles as formStyles } from 'elements/Form';

class AccountPropertiesDialog extends React.Component {
    static propTypes = {
      onSave: PropTypes.func,
      onSkip: PropTypes.func,
      onBack: PropTypes.func,
      t: PropTypes.func,
    }

    constructor(props) {
      super(props);
      this.state = {};
    }

    handleSave = () => {
      const { onSave } = this.props;
      onSave(this.state.name);
    }

    onInputChange = (event, newValue) => {
      this.setState({
        name: newValue,
      });
    };

    render() {
      const { onSkip, onBack, t } = this.props;
      return (
        <Form caption="Set account properties" onCancel={ onBack }>
          <Row>
            <div style={ formStyles.left }>
              <div style={ formStyles.fieldName }>Account name</div>
            </div>
            <div style={ formStyles.right }>
              <div style={{ width: '100%' }}>
                <TextField
                  onChange={ this.onInputChange }
                  hintText="if needed"
                  name="name"
                  fullWidth={ true }
                  underlineShow={ false }
                />
              </div>
            </div>
          </Row>

          <Row>
            <div style={ formStyles.left }/>
            <div style={ formStyles.right }>
              <div>
                <Button
                  primary
                  onClick={ this.handleSave }
                  label="Save"
                />
                <LinkButton
                  onClick={ onSkip }
                  label="Skip"
                />
              </div>
            </div>
          </Row>
        </Form>
      );
    }
}

export default AccountPropertiesDialog;
