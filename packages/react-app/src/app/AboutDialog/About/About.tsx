import { Logo } from '@emeraldwallet/ui';
import { withStyles } from '@material-ui/core/styles';
import * as React from 'react';

const year = new Date().getFullYear();

export const styles = (theme?: any) => ({
  appName: {
    color: theme.palette.primary.main,
    fontWeight: 200,
    paddingBottom: '0px',
    marginBottom: '5px'
  },
  componentsVer: {
    color: theme.palette.secondary.main,
    fontWeight: 100,
    lineHeight: '26px',
    maxWidth: '580px'
  },
  links: {
    color: theme.palette.secondary.main
  }
});

interface IProps {
  appVersion?: string;
  gitVersion?: any;
  osVersion?: any;
  onButtonClick?: any;
  onHelpClick?: any;
  onLicenseClick?: any;
  classes?: any;
}

export class About extends React.Component<IProps> {
  public render () {
    const {
      classes, onButtonClick, onHelpClick, onLicenseClick
    } = this.props;
    const { appVersion } = this.props;
    const gitVersion = this.props.gitVersion || {};
    const osVersion = this.props.osVersion || {};

    return (
      <div style={{ padding: '30px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-185px' }}>
          <Logo height='350px' width='350px'/>
        </div>
        <h2 className={classes.appName}>Emerald Wallet</h2>
        <div style={{ marginBottom: '20px' }}>{appVersion}</div>
        <div className={classes.componentsVer}>
          Full Version: {gitVersion.FullSemVer}<br/>
          Build: {gitVersion.BuildMetaDataPadded} {gitVersion.ShortSha} {gitVersion.CommitDate}<br/>
          OS: {osVersion.arch} {osVersion.platform} {osVersion.release}<br/>
        </div>
        <div style={{ fontSize: '14px', marginTop: '80px' }}>
          <div style={{ paddingBottom: '5px' }}>
            Website <a onClick={onButtonClick} href='#' className={classes.links}>https://emeraldwallet.io</a>
          </div>
          <div style={{ paddingBottom: '5px' }}>Copyright &copy; 2017-{year} ETCDEV GmbH</div>
          <div> Licensed under <a onClick={onLicenseClick} className={classes.links} href='#'>Apache License 2.0</a>
            <span style={{ float: 'right', textAlign: 'right' }}>
              <a onClick={onHelpClick} href='#' className={classes.links}>Help & Support</a>
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(About);
