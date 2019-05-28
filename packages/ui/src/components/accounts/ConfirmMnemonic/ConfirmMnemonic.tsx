import * as React from 'react';
import {withStyles} from '@material-ui/styles';

import { Page, Warning, WarningText, Input } from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import Button from '../../common/Button';

export const styles2 = {
  confirmLabel: {
    height: '24px',
    width: '190px',
    color: '#191919',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '24px',
  },
  mnemonicLabel: {
    height: '24px',
    color: '#191919',
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: '24px',
  },
  formRow: {
    display: 'flex',
    marginBottom: '19px',
    alignItems: 'center',
  },
  left: {
    flexBasis: '20%',
    marginLeft: '14.75px',
    marginRight: '14.75px',
  },
  right: {
    flexGrow: 2,
    display: 'flex',
    alignItems: 'center',
    marginLeft: '14.75px',
    marginRight: '14.75px',
    maxWidth: '580px',
  },
};

interface Props {
  classes: any;
  onBack?: any;
  onSubmit?: any;
  error?: any;
  mnemonic: string;
}

export class ConfirmMnemonic extends React.Component<Props> {
  handleSubmit = () => {
    const { onSubmit, mnemonic } = this.props;
    if (onSubmit) {
      onSubmit(mnemonic);
    }
  };

  render() {
    const {
      onBack, error, classes, mnemonic,
    } = this.props;
    return (
      <Page title="Confirm Mnemonic" leftIcon={ <Back onClick={ onBack } /> }>
        <div className={classes.formRow}>
          <div className={classes.left}/>
          <div className={classes.right}>
            <div style={{width: '100%'}}>
              <div className={ classes.mnemonicLabel }>Confirm your mnemonic phrase</div>
              <div>
                <Input
                  multiline={ true }
                  rowsMax={ 4 }
                  rows={ 4 }
                  value={mnemonic }
                />
              </div>
            </div>
          </div>
        </div>

        <div className={classes.formRow}>
          <div className={classes.left}/>
          <div className={classes.right}>
            <Button
              primary
              label="Import"
              onClick={ this.handleSubmit }
            />
          </div>
        </div>

        {error && (
          <div className={classes.formRow}>
            <div className={classes.left}/>
            <div className={classes.right}>
              <Warning>
                <WarningText>{error}</WarningText>
              </Warning>
            </div>
          </div>
        )}
      </Page>
    );
  }
}

export default withStyles(styles2)(ConfirmMnemonic);
