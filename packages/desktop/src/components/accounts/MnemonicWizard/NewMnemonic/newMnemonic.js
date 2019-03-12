import React from 'react';
import PropTypes from 'prop-types';
import {
  Warning, WarningHeader, WarningText, Input
} from 'emerald-js-ui';
import { Page } from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { Row, styles as formStyles } from 'elements/Form';
import { Button } from 'ui';

export class NewMnemonic extends React.Component {
  static propTypes = {
    onBack: PropTypes.func,
    mnemonic: PropTypes.string,
    onGenerate: PropTypes.func,
    onContinue: PropTypes.func,
  }

  render() {
    const {
      onBack, mnemonic, onGenerate, onContinue,
    } = this.props;
    return (
      <Page title="New Mnemonic account" leftIcon={ <Back onClick={ onBack }/> }>
        <Row>
          <div style={formStyles.left}/>
          <div style={formStyles.right}>
            <Warning fullWidth={ true }>
              <WarningHeader>Keep this phrase in a safe place.</WarningHeader>
              <WarningText>If you lose this phrase you will not be able to recover your account.</WarningText>
            </Warning>
          </div>
        </Row>
        <Row>
          <div style={ formStyles.left }>
          </div>
          <div style={ formStyles.right }>
            <div style={{width: '100%'}}>
              <div>Mnemonic phrase</div>
              <div>
                <Input
                  disabled={ true }
                  value={ mnemonic }
                  multiLine={ true }
                  rowsMax={ 4 }
                  rows={ 2 }
                  name="mnemonic"
                  fullWidth={ true }
                  underlineShow={ false }
                />
              </div>
            </div>
          </div>
        </Row>

        <Row>
          <div style={formStyles.left}/>
          <div style={formStyles.right}>
            { mnemonic && <Button primary label="Continue" onClick={ onContinue } /> }
            { !mnemonic && <Button primary label="Generate" onClick={ onGenerate } /> }
          </div>
        </Row>
        { this.state && this.state.error }
      </Page>
    );
  }
}

export default NewMnemonic;
