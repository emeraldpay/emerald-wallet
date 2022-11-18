import {Back} from '../../../icons';
import {withStyles} from '@material-ui/core/styles';
import * as React from 'react';
import Button from '../../common/Button';
import FormRow from '../../common/FormRow';
import {Page} from '../../common/Page';
import {Input} from '../../common/Input';
import {Warning, WarningText} from '../../common/Warning';

export const styles = {
  confirmLabel: {
    height: '24px',
    width: '190px',
    color: '#191919',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '24px'
  },
  mnemonicLabel: {
    height: '24px',
    color: '#191919',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '24px'
  },
  fieldName: {
    color: '#747474',
    fontSize: '16px',
    textAlign: 'right'
  } as any
};

export interface IConfirmProps {
  classes: any;
  onBack?: any;
  onSubmit?: any;
  error?: any;
  mnemonic: string;
  dpath: string;
}

export function ConfirmMnemonic (props: IConfirmProps) {
  const {
    onBack, error, classes, mnemonic, dpath, onSubmit
  } = props;

  function handleSubmit () {
    if (onSubmit) {
      onSubmit(mnemonic);
    }
  }

  return (
      <Page title='Confirm Mnemonic' leftIcon={<Back onClick={onBack} />}>
        <FormRow
          rightColumn={(
            <div style={{ width: '100%' }}>
              <div className={classes.mnemonicLabel}>Confirm your mnemonic phrase</div>
              <div>
                <Input
                  maxRows={4}
                  minRows={4}
                  multiline={true}
                  value={mnemonic}
                />
              </div>
            </div>
          )}
        />

        <FormRow
          leftColumn={(
            <div className={classes.fieldName}>Derivation Path</div>
          )}
          rightColumn={(
            <div>{dpath}</div>
          )}
        />

        <FormRow
          rightColumn={(
            <Button
              primary={true}
              label='Import'
              onClick={handleSubmit}
            />
          )}
        />

        {error && (
          <FormRow
            rightColumn={(
              <Warning>
                <WarningText>{error}</WarningText>
              </Warning>
            )}
          />
        )}
      </Page>
  );
}

export default withStyles(styles)(ConfirmMnemonic);
