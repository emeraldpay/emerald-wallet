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

import { withStyles } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/styles';
import classNames from 'classnames';
import * as React from 'react';
import styles from './styles';

type ClassKeys = 'container' | 'firstItem' | 'restItem';
type ClassKeysVertical = 'containerVertical' | 'firstItemVertical' | 'restItemVertical';

interface OwnProps {
  children?: React.ReactNode;
  classes?: ClassNameMap<ClassKeys | ClassKeysVertical>;
  style?: React.CSSProperties;
  vertical?: boolean;
}

export const ButtonGroup: React.FC<OwnProps> = ({ classes, children, style, vertical = false }) => {
  if (children == null) {
    return null;
  }

  const isVertical = vertical !== false;

  return (
    <div className={classNames(classes?.container, isVertical ? classes?.containerVertical : null)} style={style}>
      {Array.isArray(children) ? (
        children
          .filter((button) => button != null && button !== false)
          .map((button, index) => {
            let className: string;

            if (index === 0) {
              className = isVertical ? classes?.firstItemVertical : classes?.firstItem;
            } else {
              className = isVertical ? classes?.restItemVertical : classes?.restItem;
            }

            return (
              <div key={button.key ?? `group-button[${button.props.label ?? index}]`} className={className}>
                {button}
              </div>
            );
          })
      ) : (
        <div className={isVertical ? classes?.firstItemVertical : classes?.firstItem}>{children}</div>
      )}
    </div>
  );
};

export default withStyles<ClassKeys>(styles)(ButtonGroup);
