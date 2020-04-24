import { Input, Page, Warning, WarningText } from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { Button, FormRow } from '@emeraldwallet/ui';
import { createStyles, withStyles } from '@material-ui/core/styles';
import * as React from 'react';

export const styles = createStyles({
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
  }
});

export interface IConfirmProps {
  classes: any;
  onBack?: any;
  onSubmit?: any;
  error?: any;
  mnemonic: string;
}

export function ConfirmMnemonic (props: IConfirmProps) {
  const {
    onBack, error, classes, mnemonic, onSubmit
  } = props;

  function handleSubmit () {
    if (onSubmit) {
      onSubmit(mnemonic);
    }
  }

  return (
      <Page title='New Wallet - Confirm recovery phrase' leftIcon={<Back onClick={onBack} />}>
        <FormRow
          rightColumn={(
            <div style={{ width: '100%' }}>
              <div className={classes.mnemonicLabel}>Confirm your mnemonic phrase</div>
              <div>
                <Input
                  multiline={true}
                  rowsMax={4}
                  rows={4}
                  value={mnemonic}
                />
              </div>
            </div>
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
