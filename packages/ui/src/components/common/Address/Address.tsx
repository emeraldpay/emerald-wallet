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

import { Typography } from '@mui/material';
import * as React from 'react';
import { Check1 as CheckCircle, Copytoclipboard as CloneIcon } from '../../../icons';
import ToggledIconButton from '../ToggledIconButton';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
    container: {
      alignItems: 'center',
      display: 'flex',
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
  }
));

interface OwnProps {
  address: string;
  hideCopy?: boolean;
  shortened?: boolean;
}

const Address: React.FC<OwnProps> = ({ address, hideCopy, shortened }) => {
  const styles = useStyles().classes;

  return (
    <div className={styles.container}>
      <Typography className={shortened === true ? styles.shortenedAddress : styles.fullAddress}>{address}</Typography>
      {hideCopy === true ? null : (
        <ToggledIconButton
          icon={<CloneIcon color="secondary" />}
          toggledIcon={<CheckCircle color="primary" />}
          onClick={() => navigator.clipboard.writeText(address)}
        />
      )}
    </div>
  );
};

export default Address;
