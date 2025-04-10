import { TextDecoder, TextEncoder } from 'util';
import * as Enzyme from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import 'jest-canvas-mock';

Object.defineProperties(globalThis, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
});

Enzyme.configure({ adapter: new Adapter() });
