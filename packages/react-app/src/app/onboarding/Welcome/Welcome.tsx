import { IState, application } from '@emeraldwallet/store';
import { Logo } from '@emeraldwallet/ui';
import { CircularProgress, Grid, createStyles, makeStyles } from '@material-ui/core';
import classNames from 'classnames';
import * as React from 'react';
import { connect } from 'react-redux';
import InitialSetup from '../InitialSetup';

const useStyles = makeStyles((theme) =>
  createStyles({
    brand: {
      fontSize: 42,
    },
    brandPart1: {
      color: theme.palette.primary.main,
    },
    brandPart2: {
      color: theme.palette.secondary.main,
    },
    container: {
      maxWidth: 1150,
    },
    loader: {
      marginRight: theme.spacing(),
    },
    logo: {
      paddingTop: '6%',
    },
    message: {
      height: 40,
      paddingTop: 40,
    },
    messageLevel: {
      alignItems: 'center',
      display: 'flex',
    },
    messageLevel1: {
      color: '#999',
    },
    messageLevel3: {
      color: '#f66',
    },
  }),
);

export interface OwnProps {
  currentTermsVersion: string;
}

interface StateProps {
  level: number;
  message: string;
  needSetup: boolean;
}

const Welcome: React.FC<OwnProps & StateProps> = ({ currentTermsVersion, level, message, needSetup }) => {
  const styles = useStyles();

  return needSetup ? (
    <Grid container alignItems="center" justifyContent="center">
      <Grid item xs={10}>
        <InitialSetup currentTermsVersion={currentTermsVersion} />
      </Grid>
    </Grid>
  ) : (
    <Grid container alignItems="center" direction="column" className={styles.container} justifyContent="center">
      <Grid item xs className={styles.logo}>
        <Logo width="250" height="250" />
      </Grid>
      <Grid item>
        <Grid container direction="column">
          <Grid item xs>
            <div className={styles.brand}>
              <span className={styles.brandPart1}>Emerald&nbsp;</span>
              <span className={styles.brandPart2}>Wallet</span>
            </div>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs className={styles.message}>
        <div className={classNames(styles.messageLevel, level === 3 ? styles.messageLevel3 : styles.messageLevel1)}>
          <CircularProgress className={styles.loader} size={24} />
          {message}
        </div>
      </Grid>
    </Grid>
  );
};

export default connect<StateProps, unknown, OwnProps, IState>((state, ownProps: OwnProps): StateProps => {
  const message = application.selectors.getMessage(state);

  return {
    ...message,
    needSetup:
      application.selectors.isConfigured(state) && application.selectors.terms(state) !== ownProps.currentTermsVersion,
  };
})(Welcome);
