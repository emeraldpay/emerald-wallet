import * as React from 'react';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import { withStyles, CSSProperties } from '@material-ui/styles';

import Button from '../common/Button';

export const styles = (theme?: any) => ({
  addAccount: {
    fontWeight: 500,
    padding: '20px',
    fontSize: '17px',
    paddingLeft: '15px',
  },
  addAccountButtons: {
    display: 'flex',
    alignItems: 'start',
    flexDirection: 'column',
    justifyContent: 'center',
  } as CSSProperties,
  welcome: {
    fontWeight: 500,
    marginLeft: '80px',
    color: theme.palette.primary.main
  },
  aboutClassic: {
    color: theme.palette.secondary.main,
    fontWeight: 200
  },
  mainGridItem: {
    backgroundColor: theme.palette.background.default,
    padding: 0
  }
});

export interface ILandingProps {
  classes?: any;
  onGenerate?: any;
  onAboutClick?: any;
  onImportJson?: any;
  onImportPrivateKey?: any;
  onLedger?: any;
}

export const Landing = ({
  onGenerate, onImportJson, onImportPrivateKey, onLedger, classes, onAboutClick,
}: ILandingProps) => {

  return (
    <div>
      <div style={{display: 'flex', alignItems: 'stretch'}}>
        <div style={{flexGrow: 1}}>
          <Grid container style={{padding: 0, margin: 0}}>
            <Grid item className={classes.mainGridItem} xs={12}>
              <div style={{
                display: 'flex', alignItems: 'center', marginLeft: '80px', marginTop: '60px',
              }}>
                <div className={classes.welcome}>WELCOME TO EMERALD WALLET</div>
              </div>
              <br />
              <div style={{marginLeft: '150px', padding: '10px', maxWidth: '700px'}}>
                <br />
                <Button onClick={onAboutClick} label="More about supported tokens" />
                <br />
                <br />
                <Button primary onClick={onGenerate} label="Generate New Account" />
                <br />
                <br />
              </div>
              <Divider />
              <div style={{marginLeft: '145px', marginBottom: '70px'}}>
                <div className={classes.addAccount}>Add Account</div>
                <div className={classes.addAccountButtons}>
                  <Button variant="text" primary onClick={onImportJson} label="From Keystore File (UTC/JSON)" />
                  <Button variant="text" primary onClick={onImportPrivateKey} label="From Private key" />
                  <Button variant="text" primary onClick={onLedger} label="Ledger Nano S" />
                </div>
              </div>
            </Grid>
          </Grid>
        </div>
      </div>
    </div>
  );
};

export default withStyles(styles)(Landing);
