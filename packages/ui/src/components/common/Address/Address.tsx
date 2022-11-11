/*
Copyright 2019 ETCDEV GmbH

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { Theme } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import { createStyles, makeStyles } from '@material-ui/styles';
import * as React from 'react';
import { Check1 as CheckCircle, Copytoclipboard as CloneIcon } from '../../../icons';
import ToggledIconButton from '../ToggledIconButton';

export const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      alignItems: 'center',
      display: 'flex',
      height: 28,
      width: '100%',
    },
    fullAddress: {
      ...theme.monotype,
      fontSize: 15,
      fontWeight: 500,
    },
    shortenedAddress: {
      ...theme.monotype,
      fontSize: 15,
      fontWeight: 500,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      width: '100%',
    },
    toggledIcon: {
      cursor: 'pointer',
    },
  }),
);

interface OwnProps {
  hideCopy?: boolean;
  id: string;
  shortened?: boolean;
}

const Address: React.FC<OwnProps> = ({ hideCopy, id, shortened }) => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <Typography className={shortened === true ? styles.shortenedAddress : styles.fullAddress}>{id}</Typography>
      {hideCopy === true ? null : (
        <ToggledIconButton
          icon={<CloneIcon color="secondary" />}
          toggledIcon={<CheckCircle color="primary" />}
          onClick={() => navigator.clipboard.writeText(id)}
        />
      )}
    </div>
  );
};

export default Address;
