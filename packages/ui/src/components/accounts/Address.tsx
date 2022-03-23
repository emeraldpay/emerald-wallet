import {makeStyles} from '@material-ui/core/styles';
import * as React from 'react';
import {Box, createStyles, Theme, Typography} from "@material-ui/core";
import {ClassNameMap} from "@material-ui/styles";
import {WithDefaults} from "@emeraldwallet/core";
import classNames from "classnames";
import {Check1 as CheckCircle, Copytoclipboard as CloneIcon} from '../../icons';
import * as clipboard from "clipboard-polyfill/text";
import ToggledIconButton from "../common/ToggledIconButton";

const useStyles = makeStyles<Theme>((theme) =>
  createStyles({
    root: {
      height: '28px',
      display: 'flex',
      alignItems: 'center',
      width: '100%'
    },
    address: {
      fontFamily: [
        '"Roboto Mono"',
        'monospace'
      ].join(','),
      fontSize: '15px',
      fontWeight: 500
    },
    toggledIcon: {
      cursor: 'pointer'
    }
  })
);

// Component properties
interface OwnProps {
  address: string,
  classes?: Partial<ClassNameMap<ClassKey>>;
  disableCopy?: boolean;
  onCopy?: (address: string) => void;
}

const defaults: Partial<OwnProps> = {
  disableCopy: false
}

type ClassKey = 'root' | 'address';

/**
 *
 */
const Component = ((props: OwnProps) => {
  props = WithDefaults(props, defaults);
  const styles = useStyles();
  const {classes} = props;

  function handleOnCopyClick() {
    clipboard.writeText(props.address)
      .catch((err) => console.error("Failed to copy address to clipboard", err));
    if (props.onCopy) {
      props.onCopy(props.address);
    }
  }

  return <Box className={classNames(styles.root, classes?.root)}>
    <Typography className={classNames(styles.address, classes?.address)}>{props.address}</Typography>
    {props.disableCopy ? null : (
      <ToggledIconButton
        onClick={handleOnCopyClick}
        icon={<CloneIcon color='secondary'/>}
        toggledIcon={<CheckCircle color='primary'/>}
      />
    )}
  </Box>
})

export default Component;
