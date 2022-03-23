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
import {withStyles} from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import * as React from 'react';
import ToggledIconButton from '../ToggledIconButton';

import {Check1 as CheckCircle, Copytoclipboard as CloneIcon} from '../../../icons';

const copy = require('copy-to-clipboard');

export const getStyles = (theme?: any) => ({
  container: {
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    width: '100%'
  },
  fullAddress: {
    fontFamily: [
      '"Roboto Mono"',
      'monospace'
    ].join(','),
    fontSize: '15px',
    fontWeight: 500
  },
  shortenedAddress: {
    fontFamily: [
      '"Roboto Mono"',
      'monospace'
    ].join(','),
    fontSize: '15px',
    fontWeight: 500,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    width: '100%'
  },
  toggledIcon: {
    cursor: 'pointer'
  }
});

export interface IAddressProps {
  hideCopy?: boolean;
  onCopyClick?: any;
  id?: string;
  shortened?: boolean;
  classes: any;
  muiTheme?: any;
}

export function Address(props: IAddressProps) {
  const {classes, shortened, hideCopy} = props;
  const addressClassname = shortened ? classes.shortenedAddress : classes.fullAddress;
  const idProp = props.id;
  const id = (idProp.startsWith('0x') ? idProp : `0x${idProp}`);

  function handleOnCopyClick() {
    copy(props.id);
    if (props.onCopyClick) {
      props.onCopyClick(props.id);
    }
  }

  return (
    <div className={classes.container}>
      <Typography className={addressClassname}>{id}</Typography>
      {hideCopy ? null : (
        <ToggledIconButton
          onClick={handleOnCopyClick}
          icon={<CloneIcon color='secondary'/>}
          toggledIcon={<CheckCircle color='primary'/>}
        />
      )}
    </div>
  );
}

export default withStyles(getStyles)(Address);
