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
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';
import blockies from './blockies';

const useStyles = makeStyles()({
  clickable: {
    '&:hover': {
      cursor: 'pointer'
    }
  }
});

interface IIdentityIconProps {
  id: string;
  size?: number;
  onClick?: any;
}

export function IdentityIcon(props: IIdentityIconProps) {
  const { classes } = useStyles();
  const {
    id, size, onClick
  } = props;

  const seed = id.toLowerCase();
  const icon = blockies.create({seed}).toDataURL();
  const iconSize = Number.isInteger(size) ? size : 40;
  const mainStyle = {
    height: `${iconSize}px`,
    width: `${iconSize}px`,
    minWidth: `${iconSize}px`,
    background: `url(${icon})`,
    borderRadius: '50%',
    position: 'relative'
  };

  const identIconProps = {
    onClick,
    className: onClick ? classes.clickable : ''
  };

  return (
    <div style={mainStyle as React.CSSProperties} {...identIconProps} />
  );
}

export default IdentityIcon;
