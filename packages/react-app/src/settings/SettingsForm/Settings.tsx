import { ButtonGroup, Checkbox, Page } from '@emeraldplatform/ui';
import { Back } from '@emeraldplatform/ui-icons';
import { Button } from '@emeraldwallet/ui';
import { MenuItem, TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';
import { WithTranslation } from 'react-i18next';

const styles = {
  formRow: {
    display: 'flex',
    marginBottom: '19px',
    alignItems: 'center'
  },
  fieldName: {
    fontSize: '16px',
    textAlign: 'right'
  } as any,
  left: {
    flexBasis: '20%',
    marginLeft: '14.75px',
    marginRight: '14.75px'
  },
  right: {
    flexGrow: 2,
    display: 'flex',
    alignItems: 'center',
    marginLeft: '14.75px',
    marginRight: '14.75px',
    maxWidth: '580px'
  }
};

export interface IProps {
  onSubmit?: any;
  goBack?: any;
  classes?: any;
  numConfirmations: number;
  showHiddenAccounts: boolean;
  currency: string;
  language: string;
}

interface IState {
  currency: string;
  language: string;
  showHiddenAccounts: boolean;
  numConfirmations: number;
}

type Props = IProps & WithTranslation;

export class Settings extends React.Component<Props, IState> {
  constructor (props: Props) {
    super(props);
    this.state = {
      showHiddenAccounts: this.props.showHiddenAccounts,
      currency: this.props.currency.toLowerCase(),
      language: this.props.language,
      numConfirmations: this.props.numConfirmations
    };
  }

  public handleShowHiddenChange = (event: any, isChecked: boolean) => {
    this.setState({
      showHiddenAccounts: isChecked
    });
  }

  public handleCurrencyChange = (event: any) => {
    this.setState({
      currency: event.target.value
    });
  }

  public handleLangChange = (event: any) => {
    this.setState({
      language: event.target.value
    });
  }

  public handleConfirmsChange = (event: any) => {
    this.setState({
      numConfirmations: event.target.value
    });
  }

  public handleSave = () => {
    if (this.props.onSubmit) {
      this.props.onSubmit(this.state);
    }
  }

  public render () {
    const { goBack, t, classes } = this.props;
    const {
      showHiddenAccounts, currency, language, numConfirmations
    } = this.state;
    return (
      <Page title='Settings' leftIcon={<Back onClick={goBack}/>}>
        <div className={classes.formRow}>
          <div className={classes.left}>
            <div className={classes.fieldName}>{t('settings.currency')}</div>
          </div>
          <div className={classes.right}>
            <TextField
              select={true}
              fullWidth={true}
              value={currency}
              onChange={this.handleCurrencyChange}
            >
              <MenuItem key='eur' value='eur'>EUR</MenuItem>
              <MenuItem key='usd' value='usd'>USD</MenuItem>
              <MenuItem key='cny' value='cny'>CNY</MenuItem>
              <MenuItem key='rub' value='rub'>RUB</MenuItem>
              <MenuItem key='krw' value='krw'>KRW</MenuItem>
              <MenuItem key='aud' value='aud'>AUD</MenuItem>
            </TextField>
          </div>
        </div>
        <div className={classes.formRow}>
          <div className={classes.left}>
            <div className={classes.fieldName}>
              {t('settings.lang')}
            </div>
          </div>
          <div className={classes.right}>
            <TextField
              select={true}
              value={language}
              fullWidth={true}
              onChange={this.handleLangChange}
            >
              <MenuItem key='en-US' value='en-US'>English (US)</MenuItem>
              <MenuItem key='zh-CN' value='zh-CN'>中文</MenuItem>
              <MenuItem key='pt-BR' value='pt-BR'>Portugese</MenuItem>
              <MenuItem key='ko-KR' value='ko-KR'>Korean</MenuItem>
            </TextField>
          </div>
        </div>
        <div className={classes.formRow}>
          <div className={classes.left}>
            <div className={classes.fieldName}>
              {t('settings.showHiddenAccounts')}
            </div>
          </div>
          <div className={classes.right}>
            <Checkbox
              checked={showHiddenAccounts}
              label='Show accounts you have hidden'
              onCheck={this.handleShowHiddenChange}
            />
          </div>
        </div>
        <div className={classes.formRow}>
          <div className={classes.left}>
            <div className={classes.fieldName}>
              {t('settings.confirmations')}
            </div>
          </div>
          <div className={classes.right}>
            <TextField
              fullWidth={true}
              value={numConfirmations}
              margin='normal'
              type='number'
              required={true}
              onChange={this.handleConfirmsChange}
              // helperText="Number of confirmations for a transaction to be considered successful"
            />
          </div>
        </div>
        <div className={classes.formRow}>
          <div className={classes.left}/>
          <div className={classes.right}>
            <ButtonGroup>
              <Button
                label='Cancel'
                onClick={goBack}
              />
              <Button
                primary={true}
                label='SAVE'
                onClick={this.handleSave}
              />
            </ButtonGroup>
          </div>
        </div>
      </Page>
    );
  }
}

export default withStyles(styles)(Settings);
