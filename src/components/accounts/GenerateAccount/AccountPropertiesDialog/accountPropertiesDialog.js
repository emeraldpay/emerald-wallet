import React from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonGroup, LinkButton, Input, Page } from 'emerald-js-ui';
import { Row, styles as formStyles } from '../../../../elements/Form';

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
      if (onSave) {
        onSave(this.state.name);
      }
    }

    onInputChange = (event, newValue) => {
      this.setState({
        name: newValue,
      });
    };

    render() {
      const { onSkip } = this.props;
      return (
        <Page title="Set account properties">
          <Row>
            <div style={ formStyles.left }>
              <div style={ formStyles.fieldName }>Account name</div>
            </div>
            <div style={ formStyles.right }>
              <div style={{ width: '100%' }}>
                <Input
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
              <ButtonGroup>
                <Button
                  primary
                  onClick={ this.handleSave }
                  label="Save"
                />
                <LinkButton
                  onClick={ onSkip }
                  label="Skip"
                />
              </ButtonGroup>
            </div>
          </Row>
        </Page>
      );
    }
}

export default AccountPropertiesDialog;
