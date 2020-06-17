import {action} from '@storybook/addon-actions';
import {storiesOf} from '@storybook/react';
import * as React from 'react';
import ImportPk from "../../src/components/accounts/ImportPk";

storiesOf('ImportPk', module)
  .add('default', () => (
    <ImportPk onChange={action("onChange")}/>
  ));
