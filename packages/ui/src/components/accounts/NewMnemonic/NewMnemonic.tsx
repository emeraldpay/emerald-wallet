import { WithDefaults } from "@emeraldwallet/core";
import { Box, Button, Chip, createStyles, Grid, Typography } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import { Alert } from "@material-ui/lab";
import * as React from 'react';
import { useEffect, useState } from 'react';
import { ReactSortable } from "react-sortablejs";
import { ConfirmedPasswordInput } from "../../../index";

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
  onGenerate?: () => Promise<string>;
  onContinue?: (value: string, password: string | undefined) => void;
  classes?: any;
}

interface MnemonicPartType {
  id: number;
  name: string;
  chosen?: boolean;
}

const defaults = {
  classes: {}
}

/**
 *
 */
const Component = ((props: OwnProps) => {
  props = WithDefaults(props, defaults);
  const styles = useStyles();

  const [mnemonic, setMnemonic] = React.useState("");
  const [confirming, setConfirming] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState("");
  const [expectPassword, setExpectPassword] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [done, setDone] = React.useState(false);

  const { onContinue, onGenerate } = props;

  const hasMnemonic = typeof mnemonic == 'string' && mnemonic.length > 0;
  const confirmed = hasMnemonic && confirmation.toLowerCase().replace(/\s+/g, " ").trim() == mnemonic.toLowerCase();

  let passwordField;

  if (expectPassword) {
    if (password && password.length > 0) {
      passwordField = <Alert severity="success">
        Phrase protection password is set.
        <Button variant={"text"} disabled={done} onClick={() => {
          setPassword("");
          setExpectPassword(false);
        }}>Reset</Button>
      </Alert>
    } else {
      passwordField =
        <ConfirmedPasswordInput helperText={"(optional) Additional passphrase to protect the secret mnemonic phrase."}
                                disabled={done}
                                buttonLabel={"Set password"}
                                onChange={setPassword}/>
    }
  } else {
    passwordField = <Alert severity="info">
      You may set an additional passphrase to your secret phrase.
      <Button variant={"text"} disabled={done} onClick={() => setExpectPassword(true)}>Set Passphrase</Button>
    </Alert>
  }

  let content;
  let title: string;

  const [mnemonicRandomParts, setMnemonicRandomParts] = useState<string[]>([]);
  const [mnemonicSelectedParts, setMnemonicSelectedParts] = useState<MnemonicPartType[]>([]);

  useEffect(() => {
    let mnemonicParts = [];

    if (confirming) {
      mnemonicParts = mnemonic
        .split(' ')
        .map((part) => ({ sort: Math.random(), part }))
        .sort((first, second) => first.sort - second.sort)
        .map(({ part }) => part);

      setMnemonicSelectedParts([]);
    }

    setMnemonicRandomParts(mnemonicParts);
  }, [confirming, mnemonic]);

  useEffect(() => {
    setConfirmation(mnemonicSelectedParts.map((selected) => selected.name).join(' '))
  }, [mnemonicSelectedParts]);

  if (confirming) {
    title = "Confirm generated phrase";
    content = <Grid container={true}>
      <Grid item={true} xs={12}>
        <ReactSortable
          className={`${styles.mnemonicGrid} ${styles.mnemonicGridBorder}`}
          forceFallback={true}
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
              onDelete={() => setMnemonicSelectedParts(mnemonicSelectedParts.filter(
                (item) => item.name !== selected.name),
              )}
            />
          ))}
        </ReactSortable>
      </Grid>
      <Grid item={true} xs={12}>
        <div className={styles.mnemonicGrid}>
          {mnemonicRandomParts.map(
            (part, index) => mnemonicSelectedParts.find((item) => item.name === part) == null ? (
              <Chip
                key={`mnemonic-random-${part}[${index}]`}
                classes={{ root: styles.mnemonicPart, label: styles.mnemonicPartLabel }}
                label={part}
                onClick={() => setMnemonicSelectedParts([
                  ...mnemonicSelectedParts,
                  {
                    id: mnemonicSelectedParts.length + 1,
                    name: part,
                  },
                ])}
              />
            ) : (
              <div key={`mnemonic-random-${part}[${index}]`}>&nbsp;</div>
            ),
          )}
        </div>
      </Grid>
      <Grid item={true} xs={9}>
        {passwordField}
      </Grid>
      <Grid item={true} xs={3} className={styles.confirmButtons}>
        <Button color={"primary"}
                disabled={!confirmed || done}
                variant={"contained"}
                onClick={() => {
                  onContinue(mnemonic, password.length > 0 ? password : undefined);
                  setDone(true);
                }}>Confirm</Button>
        <Button variant={"text"}
                disabled={done}
                onClick={() => setConfirming(false)}>Cancel</Button>
      </Grid>
    </Grid>
  } else {
    title = "Create secret \"mnemonic\" phrase";

    if (hasMnemonic) {
      const words = mnemonic.split(" ")
        .map((word, i) =>
          <Grid item={true} xs={3} key={"word-" + i}>
            <Typography variant={"body2"}><span className={styles.wordIndex}>{i + 1}.</span> {word}</Typography>
          </Grid>
        )

      const message = <Box>
        <Alert severity="error">
          <Box className={styles.writeMessage}>
            Please write the phrase ("Mnemonic Phrase") and keep it in a safe place.
            Never tell it to anyone.
            Don't enter it anywhere online. It's the key to spend your funds.
            If you lose this phrase, you will not be able to recover your account.
          </Box>
          <Box className={styles.writeButtons}>
            <Button color={"primary"}
                    disabled={done}
                    className={styles.button}
                    variant={"contained"}
                    onClick={() => setConfirming(true)}>Yes, I wrote it down</Button>
          </Box>
        </Alert>
      </Box>

      content = <Grid container={true} className={styles.mnemonic}>
        {words}
        <Grid item={true} xs={8}/>
        <Grid item={true} xs={4}>
          <Button color={"primary"}
                  className={styles.button}
                  variant={"text"}
                  onClick={() => onGenerate().then(setMnemonic).catch(console.error)}>
            Generate New
          </Button>
        </Grid>
        <Grid item={true} xs={12}>{message}</Grid>
      </Grid>
    } else {
      content = <Box className={styles.mnemonic + " " + styles.mnemonicEmpty}>
        <Typography>Click "Generate Phrase" to create a new secret phrase that will be a key to spend your
          cryptocurrencies.</Typography>
        <Button color={"primary"}
                className={styles.button}
                variant={"text"}
                onClick={() => onGenerate().then(setMnemonic).catch(console.error)}>
          Generate Phrase
        </Button>
      </Box>
    }
  }

  return <Grid container={true}>
    <Grid item={true} xs={12}><Typography variant={"h6"}>{title}</Typography></Grid>
    <Grid item={true} xs={12}>{content}</Grid>
    </Grid>
})

export default Component;
