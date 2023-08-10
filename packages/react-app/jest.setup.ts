import { TextDecoder, TextEncoder } from 'util';
import * as Enzyme from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import 'jest-canvas-mock';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

Enzyme.configure({ adapter: new Adapter() });
