import { TextDecoder, TextEncoder } from 'util';
import * as Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'jest-canvas-mock';

Object.defineProperties(globalThis, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
});

Enzyme.configure({ adapter: new Adapter() });
