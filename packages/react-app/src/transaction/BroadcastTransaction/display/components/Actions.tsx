import { Button, ButtonGroup, FormRow } from '@emeraldwallet/ui';
import { Box, CircularProgress, Grid, Typography, createStyles, makeStyles } from '@material-ui/core';
import * as React from 'react';

const useStyles = makeStyles(() =>
  createStyles({
    buttons: {
      display: 'flex',
      justifyContent: 'end',
      width: '100%',
    },
  }),
);

interface OwnProps {
  onBroadcast(): Promise<void>;
  onCancel(): void;
}

export const Actions: React.FC<OwnProps> = ({ onBroadcast, onCancel }) => {
  const styles = useStyles();

  const mounted = React.useRef(true);

  const [broadcasting, setBroadcasting] = React.useState(false);

  const handleBroadcastTx = async (): Promise<void> => {
    setBroadcasting(true);

    await onBroadcast();

    if (mounted.current) {
      setBroadcasting(false);
    }
  };

  React.useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  return (
    <>
      {broadcasting && (
        <Box mb={2}>
          <Grid container alignItems="center" justifyContent="center">
            <Grid item>
              <Box pr={2}>
                <CircularProgress />
              </Box>
            </Grid>
            <Grid item>
              <Typography variant="h5">Broadcasting...</Typography>
              <Typography>Please wait while transaction being broadcasted.</Typography>
            </Grid>
          </Grid>
        </Box>
      )}
      <FormRow last>
        <ButtonGroup classes={{ container: styles.buttons }}>
          <Button label="Cancel" onClick={onCancel} />
          {!broadcasting && <Button primary label="Send" onClick={handleBroadcastTx} />}
        </ButtonGroup>
      </FormRow>
    </>
  );
};
