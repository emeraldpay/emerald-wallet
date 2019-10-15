import { Input, Page, Warning, WarningText } from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { withStyles } from '@material-ui/styles';
import * as React from 'react';
import Button from '../../common/Button';
import FormRow from '../../common/FormRow';

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

interface IConfirmProps {
  classes: any;
  onBack?: any;
  onSubmit?: any;
  error?: any;
  mnemonic: string;
  dpath: string;
}

export class ConfirmMnemonic extends React.Component<IConfirmProps> {
  public handleSubmit = () => {
    const { onSubmit, mnemonic } = this.props;
    if (onSubmit) {
      onSubmit(mnemonic);
    }
  }

  public render () {
    const {
      onBack, error, classes, mnemonic, dpath
    } = this.props;
    return (
      <Page title='Confirm Mnemonic' leftIcon={<Back onClick={onBack} />}>
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
              onClick={this.handleSubmit}
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
}

export default withStyles(styles)(ConfirmMnemonic);
