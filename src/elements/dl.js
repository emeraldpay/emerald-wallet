// @flow
import React from 'react';

import { Card, CardHeader } from 'material-ui/Card';
import { noShadow, link } from 'lib/styles';

export const DescriptionList = (props: {children: any}) => {
  const style = {
    width: '100%',
    overflow: 'hidden',
  };
  return (
    <dl style={style} {...props}>
      {props.children}
      <br />
    </dl>
  );
};

export const DescriptionTitle = (props: {children: any}) => {
  const style = {
    float: 'left',
    width: '35%',
    textAlign: 'right',
    margin: 0,
    padding: '0 5px 0 0',
    fontWeight: 900,
  };
  return (
    <dt style={style} {...props}>
      {props.children}
    </dt>
  );
};

export const DescriptionData = (props: {children: any}) => {
  const style = {
    float: 'left',
    width: '60%',
    margin: 0,
    padding: '0 0 0 5px',
  };
  return (
    <dd style={style} {...props}>
      {props.children}
    </dd>
  );
};

