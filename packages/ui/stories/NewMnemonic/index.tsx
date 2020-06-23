import {action} from '@storybook/addon-actions';
import {storiesOf} from '@storybook/react';
import * as React from 'react';
import NewMnemonic from '../../src/components/accounts/NewMnemonic';


const mnemonics = [
  'vacant seven lend obscure clinic record insect female stumble kick close moral maple reward crime buddy lobster blood violin ensure mutual flag drink toy',
  'endless grief cannon ankle job puppy credit clap arrange else gain fade enlist auction total gravity bitter coast athlete easy win deal trade jacket',
  'artist liquid enact viable spoon beef luggage flavor february between humble brick exhaust outer veteran butter upon mask scatter hill thumb average confirm galaxy',
  'confirm lake captain primary clever dance mercy merge pupil window spring festival battle renew daring fame police aisle stage notice nominee morning tilt debris',
  'drift alarm join mercy sibling curtain return mistake double crunch attitude biology someone torch liberty hour cage episode dinner window trouble surprise agree polar',
  'ability insect laugh mercy attend split glare hamster olympic wasp stay riot mercy diagram tomorrow visual road tongue avoid myself easy unfair hospital nurse'
];

var seq = 0;

const generate = () => {
  const i: number = seq % mnemonics.length;
  seq++;
  return Promise.resolve(mnemonics[i]);
}

storiesOf('NewMnemonic', module)
  .add('default', () => (
    <NewMnemonic
      onGenerate={generate}
      onContinue={action('Result')}
    />
  ));
