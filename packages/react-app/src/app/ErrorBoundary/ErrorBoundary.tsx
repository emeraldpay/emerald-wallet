import { Button, Page } from '@emeraldwallet/ui';
import { Accordion, AccordionDetails, AccordionSummary, TextField, Typography, createStyles } from '@material-ui/core';
import ExpandIcon from '@material-ui/icons/ExpandMore';
import { Alert } from '@material-ui/lab';
import { ClassNameMap, withStyles } from '@material-ui/styles';
import { clipboard, shell } from 'electron';
import * as React from 'react';
import { connect } from 'react-redux';

const styles = createStyles({
  container: {
    margin: '0 auto',
    maxWidth: 1150,
    overflow: 'hidden',
    padding: 20,
    width: '100%',
  },
  link: {
    color: 'inherit',
  },
  stacktrace: {
    marginTop: 20,
  },
  stacktraceButtons: {
    display: 'flex',
    justifyContent: 'end',
    marginTop: 20,
  },
  stacktraceDetails: {
    flexDirection: 'column',
    justifyContent: 'end',
  },
  stacktraceText: {
    overflow: 'auto !important',
  },
});

interface DispatchProps {
  gotoSupport(event: React.MouseEvent<HTMLAnchorElement>): void;
}

interface Props extends DispatchProps {
  classes: ClassNameMap<keyof typeof styles>;
}

interface State {
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  onCopy = (): void => {
    const { error } = this.state;

    if (error?.stack != null) {
      clipboard.writeText(error.stack);
    }
  };

  render(): React.ReactNode {
    const { children, classes, gotoSupport } = this.props;
    const { error } = this.state;

    if (error == null) {
      return children;
    }

    return (
      <div className={classes.container}>
        <Page title="Application error">
          <Alert severity="warning">
            An unexpected error has occurred. Please restart the Emerald Wallet.
            <br />
            If this problem occurs again, please send the following Problem Report to the{' '}
            <a href="#" className={classes.link} onClick={gotoSupport}>
              Emerald Support
            </a>
            .
          </Alert>
          <Accordion className={classes.stacktrace}>
            <AccordionSummary expandIcon={<ExpandIcon />}>
              <Typography>Problem Report</Typography>
            </AccordionSummary>
            <AccordionDetails
              classes={{
                root: classes.stacktraceDetails,
              }}
            >
              <TextField
                fullWidth
                multiline
                disabled
                value={error.stack}
                InputProps={{
                  classes: {
                    input: classes.stacktraceText,
                  },
                }}
              />
              <div className={classes.stacktraceButtons}>
                <Button primary={true} label="Copy to clipboard" onClick={this.onCopy} />
              </div>
            </AccordionDetails>
          </Accordion>
        </Page>
      </div>
    );
  }
}

export default connect<unknown, DispatchProps>(null, () => ({
  async gotoSupport() {
    await shell.openExternal('https://go.emrld.io/support');
  },
}))(withStyles(styles)(ErrorBoundary));
