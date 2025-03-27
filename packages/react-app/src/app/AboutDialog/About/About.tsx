import { Versions } from '@emeraldwallet/core';
import { Logo } from '@emeraldwallet/ui';
import type { Theme } from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import * as React from 'react';

interface OwnProps {
  versions: Versions;
  onHelpClick(): void;
  onLicenseClick(): void;
  onWebsiteClick(): void;
}

const useStyles = makeStyles()((theme: Theme) => ({
  container: {
    padding: 30,
    position: 'relative',
    zIndex: 0,
  },
  logo: {
    opacity: 0.75,
    position: 'absolute',
    right: -35,
    top: -22,
    zIndex: -1,
  },
  appName: {
    color: theme.palette.primary.main,
    fontWeight: 200,
    paddingBottom: 0,
    marginBottom: 5,
  },
  appVersion: {
    marginBottom: 20,
  },
  gitVersion: {
    color: theme.palette.secondary.main,
    fontWeight: 100,
    lineHeight: '26px',
    maxWidth: 580,
  },
  info: {
    fontSize: 14,
    marginTop: 80,
  },
  infoBlock: {
    paddingBottom: 5,
  },
  infoLink: {
    color: theme.palette.secondary.main,
  },
  infoHelp: {
    float: 'right',
    textAlign: 'right',
  },
}));

const About: React.FC<OwnProps> = ({ versions, onWebsiteClick, onHelpClick, onLicenseClick }) => {
  const { classes } = useStyles();
  const year = new Date().getFullYear();

    return (
      <div className={classes.container}>
        <div className={classes.logo}>
          <Logo height="350px" width="350px" />
        </div>
        <h2 className={classes.appName}>Emerald Wallet</h2>
        <div className={classes.appVersion}>{versions.appVersion}</div>
        <div className={classes.gitVersion}>
          Build: {versions.commitData.shortSha} ({versions.commitData.commitDate})
          <br />
          OS: {versions.osVersion.platform} {versions.osVersion.arch} {versions.osVersion.release}
          <br />
        </div>
        <div className={classes.info}>
          <div className={classes.infoBlock}>
            Website{' '}
            <a onClick={onWebsiteClick} href="#" className={classes.infoLink}>
              https://emerald.cash
            </a>
          </div>
          <div className={classes.infoBlock}>Copyright &copy; {year} EmeraldPay</div>
          <div>
            Licensed under{' '}
            <a onClick={onLicenseClick} className={classes.infoLink} href="#">
              Apache License 2.0
            </a>
            <span className={classes.infoHelp}>
              <a onClick={onHelpClick} href="#" className={classes.infoLink}>
                Help & Support
              </a>
            </span>
          </div>
        </div>
      </div>
    );
};

export default About;
