import { Button } from '@emeraldwallet/ui';
import Grid from '@material-ui/core/Grid';
import { createStyles, withStyles } from '@material-ui/core/styles';
import * as React from 'react';

export const styles = (theme?: any) => createStyles({
  addAccount: {
    fontWeight: 500,
    padding: '20px',
    fontSize: '17px',
    paddingLeft: '15px'
  },
  addAccountButtons: {
    display: 'flex',
    alignItems: 'start',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  welcome: {
    fontWeight: 500,
    marginLeft: '80px',
    color: theme.palette.primary.main
  },
  welcomeContainer: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: '80px',
    marginTop: '60px'
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
  onCreateWallet?: any;
  onAboutClick?: any;
}

export const Landing = ({
                          onCreateWallet, classes, onAboutClick
                        }: ILandingProps) => {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <div style={{ flexGrow: 1 }}>
          <Grid container={true} style={{ padding: 0, margin: 0 }}>
            <Grid item={true} className={classes.mainGridItem} xs={12}>
              <div className={classes.welcomeContainer}>
                <div className={classes.welcome}>WELCOME TO EMERALD WALLET</div>
              </div>
              <br />
              <div style={{ marginLeft: '150px', padding: '10px', maxWidth: '700px' }}>
                <br />
                <Button onClick={onAboutClick} label='More about supported tokens' />
                <br />
                <br/>
                <Button primary={true} onClick={onCreateWallet} label='Create first wallet'/>
                <br/>
                <br />
              </div>
            </Grid>
          </Grid>
        </div>
      </div>
    </div>
  );
};

export default withStyles(styles)(Landing);
