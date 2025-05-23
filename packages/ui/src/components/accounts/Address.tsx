import {Box, Typography, ClassNameMap} from '@mui/material';
import classNames from 'classnames';
import * as React from 'react';
import { Check1 as CheckCircle, Copytoclipboard as CloneIcon } from '../../icons';
import ToggledIconButton from '../common/ToggledIconButton';
import {makeStyles} from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
    root: {
      alignItems: 'center',
      display: 'flex',
      height: 28,
      minWidth: 380,
      width: '100%',
    },
    address: {
      fontSize: 15,
      fontWeight: 500,
      ...theme.monotype,
    },
    loadingIcon: {
      marginLeft: 4,
    },
    toggledIcon: {
      cursor: 'pointer',
    },
  }
));

interface OwnProps {
  address: string;
  classes?: Partial<ClassNameMap<'root' | 'address'>>;
  disableCopy?: boolean;
  label?: string;
  loading?: boolean;
  loadingIcon?: React.ReactElement;
  onCopy?(address: string): void;
}

const Component: React.FC<OwnProps> = ({ address, classes, disableCopy, label, loading, loadingIcon, onCopy }) => {
  const styles = useStyles().classes;

  return (
    <Box className={classNames(styles.root, classes?.root)}>
      <Typography className={classNames(styles.address, classes?.address)}>{label ?? address}</Typography>
      {loading === true ? (
        <div className={styles.loadingIcon}>{loadingIcon}</div>
      ) : (
        disableCopy !== true && (
          <ToggledIconButton
            onClick={async () => {
              await navigator.clipboard.writeText(address);

              onCopy?.(address);
            }}
            icon={<CloneIcon color="secondary" />}
            toggledIcon={<CheckCircle color="primary" />}
          />
        )
      )}
    </Box>
  );
};

export default Component;
