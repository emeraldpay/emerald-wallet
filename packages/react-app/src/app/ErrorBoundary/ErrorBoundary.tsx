import { Button, Page } from '@emeraldwallet/ui';
import { Accordion, AccordionDetails, AccordionSummary, TextField, Typography } from '@mui/material';
import ExpandIcon from '@mui/icons-material/ExpandMore';
import { Alert } from '@mui/lab';
import { clipboard, shell } from 'electron';
import * as React from 'react';
import { connect } from 'react-redux';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()({
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

interface ErrorDisplayProps {
  error: Error;
  gotoSupport: DispatchProps['gotoSupport'];
  onCopy: () => void;
}

// Separate component for displaying the error
const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, gotoSupport, onCopy }) => {
  const { classes } = useStyles();

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
              <Button primary={true} label="Copy to clipboard" onClick={onCopy} />
            </div>
          </AccordionDetails>
        </Accordion>
      </Page>
    </div>
  );
};

interface Props extends DispatchProps {
  children: React.ReactNode;
}

// Error boundaries need to be classes in React
// This is one React feature that still requires class components
class ErrorBoundary extends React.Component<Props, { error: Error | null }> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  onCopy = (): void => {
    const { error } = this.state;

    if (error?.stack != null) {
      clipboard.writeText(error.stack);
    }
  };

  render() {
    const { children, gotoSupport } = this.props;
    const { error } = this.state;

    if (error == null) {
      return children;
    }

    return <ErrorDisplay error={error} gotoSupport={gotoSupport} onCopy={this.onCopy} />;
  }
}

export default connect<unknown, DispatchProps>(null, () => ({
  async gotoSupport() {
    await shell.openExternal('https://go.emrld.io/support');
  },
}))(ErrorBoundary);
