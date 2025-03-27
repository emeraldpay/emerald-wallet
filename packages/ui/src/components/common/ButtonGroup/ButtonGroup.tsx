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

import { ClassNameMap } from '@mui/material';
import classNames from 'classnames';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

type ClassKeys = 'container' | 'firstItem' | 'restItem';
type ClassKeysVertical = 'containerVertical' | 'firstItemVertical' | 'restItemVertical';

const useStyles = makeStyles()({
  container: {
    alignItems: 'center',
    display: 'flex',
  },
  containerVertical: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  firstItem: {
    marginLeft: 0,
  },
  restItem: {
    marginLeft: 10,
  },
  firstItemVertical: {
    marginTop: 0,
  },
  restItemVertical: {
    marginTop: 10,
  },
});

interface OwnProps {
  children?: React.ReactNode;
  classes?: Partial<ClassNameMap<ClassKeys | ClassKeysVertical>>;
  style?: React.CSSProperties;
  vertical?: boolean;
}

export const ButtonGroup: React.FC<OwnProps> = ({ classes: classesOverride, children, style, vertical = false }) => {
  const { classes } = useStyles();
  const classesToUse = classesOverride || classes;

  if (children == null) {
    return null;
  }

  const isVertical = vertical !== false;

  return (
    <div className={classNames(classesToUse?.container, isVertical ? classesToUse?.containerVertical : null)} style={style}>
      {Array.isArray(children) ? (
        children
          .filter((button) => button != null && button !== false)
          .map((button, index) => {
            let className: string;

            if (index === 0) {
              className = isVertical ? classesToUse?.firstItemVertical : classesToUse?.firstItem;
            } else {
              className = isVertical ? classesToUse?.restItemVertical : classesToUse?.restItem;
            }

            return (
              <div key={button.key ?? `group-button[${button.props.label ?? index}]`} className={className}>
                {button}
              </div>
            );
          })
      ) : (
        <div className={isVertical ? classesToUse?.firstItemVertical : classesToUse?.firstItem}>{children}</div>
      )}
    </div>
  );
};

export default ButtonGroup;
