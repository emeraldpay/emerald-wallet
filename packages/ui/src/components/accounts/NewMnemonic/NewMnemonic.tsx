import { Box, Button, Chip, Grid, Typography, createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Alert } from '@material-ui/lab';
import * as React from 'react';
import { ReactSortable } from 'react-sortablejs';
import { ConfirmedPasswordInput } from '../../../index';

const useStyles = makeStyles(
  createStyles({
    controls: {
      padding: '25px 0 0 20px',
      alignItems: 'center',
    },
    mnemonic: {
      fontSize: '0.9em',
      border: '1px solid #f0f0f0',
      padding: '20px 20px',
      margin: '10px 0px',
      backgroundColor: '#f0faff',
    },
    mnemonicEmpty: {
      textAlign: 'center',
    },
    button: {
      width: '220px',
      margin: '5px',
    },
    wordIndex: {
      display: 'inline-block',
      width: '24px',
      opacity: '75%',
      fontSize: '0.8em',
    },
    writeMessage: {
      width: '600px',
      float: 'left',
    },
    writeButtons: {
      width: '200px',
      float: 'left',
    },
    confirmButtons: {
      padding: '16px',
    },
    mnemonicGrid: {
      boxSizing: 'border-box',
      display: 'grid',
      gap: '10px',
      gridTemplateColumns: 'repeat(6, 1fr)',
      gridTemplateRows: 'repeat(4, 1fr)',
      marginBottom: '15px',
      minHeight: '170px',
      padding: '5px',
      width: '100%',
    },
    mnemonicGridBorder: {
      border: '1px solid #f0f0f0',
    },
    mnemonicDraggableDrag: {
      opacity: '1 !important',
    },
    mnemonicDraggableGhost: {
      opacity: 0,
    },
    mnemonicPart: {
      justifyContent: 'space-between',
    },
    mnemonicPartLabel: {
      flex: '1 0 auto',
      textAlign: 'center',
    },
  }),
);

// Component properties
interface OwnProps {
  onGenerate?(): Promise<string>;
  onContinue?(value: string, password: string | undefined): void;
}

interface MnemonicRandomPartType {
  id: number;
  name: string;
}

interface MnemonicSelectedPartType extends MnemonicRandomPartType {
  chosen?: boolean;
}

const Component: React.FC<OwnProps> = ({ onContinue, onGenerate }) => {
  const styles = useStyles();

  const [mnemonic, setMnemonic] = React.useState('');

  const [password, setPassword] = React.useState('');
  const [confirmation, setConfirmation] = React.useState('');

  const [confirming, setConfirming] = React.useState(false);
  const [expectPassword, setExpectPassword] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const hasMnemonic = typeof mnemonic === 'string' && mnemonic.length > 0;
  const confirmed = hasMnemonic && confirmation.toLowerCase().replace(/\s+/g, ' ').trim() === mnemonic.toLowerCase();

  let passwordField;

  if (expectPassword) {
    if (password && password.length > 0) {
      passwordField = (
        <Alert severity="success">
          Phrase protection password is set.
          <Button
            variant="text"
            disabled={done}
            onClick={() => {
              setPassword('');
              setExpectPassword(false);
            }}
          >
            Reset
          </Button>
        </Alert>
      );
    } else {
      passwordField = (
        <ConfirmedPasswordInput
          buttonLabel="Set password"
          disabled={done}
          helperText="(optional) Additional passphrase to protect the secret mnemonic phrase."
          minLength={1}
          onChange={setPassword}
        />
      );
    }
  } else {
    passwordField = (
      <Alert severity="info">
        You may set an additional passphrase to your secret phrase.
        <Button variant="text" disabled={done} onClick={() => setExpectPassword(true)}>
          Set Passphrase
        </Button>
      </Alert>
    );
  }

  let content;
  let title: string;

  const [mnemonicRandomParts, setMnemonicRandomParts] = React.useState<MnemonicRandomPartType[]>([]);
  const [mnemonicSelectedParts, setMnemonicSelectedParts] = React.useState<MnemonicSelectedPartType[]>([]);

  React.useEffect(() => {
    let mnemonicParts: MnemonicRandomPartType[] = [];

    if (confirming) {
      mnemonicParts = mnemonic
        .split(' ')
        .map((part) => ({ sort: Math.random(), part }))
        .sort((first, second) => first.sort - second.sort)
        .map(({ part }, index) => ({ id: index, name: part }));

      setMnemonicSelectedParts([]);
    }

    setMnemonicRandomParts(mnemonicParts);
  }, [confirming, mnemonic]);

  React.useEffect(() => {
    setConfirmation(mnemonicSelectedParts.map((selected) => selected.name).join(' '));
  }, [mnemonicSelectedParts]);

  if (confirming) {
    title = 'Confirm generated phrase';

    content = (
      <Grid container>
        <Grid item xs={12}>
          <ReactSortable
            forceFallback
            className={`${styles.mnemonicGrid} ${styles.mnemonicGridBorder}`}
            dragClass={styles.mnemonicDraggableDrag}
            ghostClass={styles.mnemonicDraggableGhost}
            list={mnemonicSelectedParts}
            setList={setMnemonicSelectedParts}
          >
            {mnemonicSelectedParts.map((selected) => (
              <Chip
                key={`mnemonic-selected-${selected.name}[${selected.id}]`}
                classes={{ root: styles.mnemonicPart, label: styles.mnemonicPartLabel }}
                color={selected.chosen ? 'primary' : 'default'}
                label={selected.name}
                onDelete={() =>
                  setMnemonicSelectedParts(mnemonicSelectedParts.filter((item) => item.name !== selected.name))
                }
              />
            ))}
          </ReactSortable>
        </Grid>
        <Grid item xs={12}>
          <div className={styles.mnemonicGrid}>
            {mnemonicRandomParts.map((part) =>
              mnemonicSelectedParts.find((item) => part.id === item.id) == null ? (
                <Chip
                  key={`mnemonic-random[${part.id}]`}
                  classes={{ root: styles.mnemonicPart, label: styles.mnemonicPartLabel }}
                  label={part.name}
                  onClick={() => setMnemonicSelectedParts([...mnemonicSelectedParts, part])}
                />
              ) : (
                <div key={`mnemonic-random[${part.id}]`}>&nbsp;</div>
              ),
            )}
          </div>
        </Grid>
        <Grid item xs={9}>
          {passwordField}
        </Grid>
        <Grid item className={styles.confirmButtons} xs={3}>
          <Button
            disabled={!confirmed || done}
            color="primary"
            variant="contained"
            onClick={() => {
              onContinue(mnemonic, password.length > 0 ? password : undefined);

              setDone(true);
            }}
          >
            Confirm
          </Button>
          <Button variant="text" disabled={done} onClick={() => setConfirming(false)}>
            Cancel
          </Button>
        </Grid>
      </Grid>
    );
  } else {
    title = 'Create secret "mnemonic" phrase';

    if (hasMnemonic) {
      const words = mnemonic.split(' ').map((word, i) => (
        <Grid key={`word-${i}`} item xs={3}>
          <Typography variant="body2">
            <span className={styles.wordIndex}>{i + 1}.</span> {word}
          </Typography>
        </Grid>
      ));

      const message = (
        <Box>
          <Alert severity="error">
            <Box className={styles.writeMessage}>
              Please write the phrase (&quot;Mnemonic Phrase&quot;) and keep it in a safe place. Never tell it to
              anyone. Don&apos;t enter it anywhere online. It&apos;s the key to spend your funds. If you lose this
              phrase, you will not be able to recover your account.
            </Box>
            <Box className={styles.writeButtons}>
              <Button
                disabled={done}
                className={styles.button}
                color="primary"
                variant="contained"
                onClick={() => setConfirming(true)}
              >
                Yes, I wrote it down
              </Button>
            </Box>
          </Alert>
        </Box>
      );

      content = (
        <Grid container className={styles.mnemonic}>
          {words}
          <Grid item xs={8} />
          <Grid item xs={4}>
            <Button
              className={styles.button}
              color="primary"
              variant="text"
              onClick={() => onGenerate().then(setMnemonic).catch(console.error)}
            >
              Generate New
            </Button>
          </Grid>
          <Grid item xs={12}>
            {message}
          </Grid>
        </Grid>
      );
    } else {
      content = (
        <Box className={styles.mnemonic + ' ' + styles.mnemonicEmpty}>
          <Typography>
            Click &quot;Generate Phrase&quot; to create a new secret phrase that will be a key to spend your
            cryptocurrencies.
          </Typography>
          <Button
            className={styles.button}
            color="primary"
            variant="text"
            onClick={() => onGenerate().then(setMnemonic).catch(console.error)}
          >
            Generate Phrase
          </Button>
        </Box>
      );
    }
  }

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography variant="h6">{title}</Typography>
      </Grid>
      <Grid item xs={12}>
        {content}
      </Grid>
    </Grid>
  );
};

export default Component;
