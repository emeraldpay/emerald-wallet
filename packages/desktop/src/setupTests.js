const Enzyme = require('enzyme'); // eslint-disable-line import/no-extraneous-dependencies
const EnzymeAdapter = require('enzyme-adapter-react-16'); // eslint-disable-line import/no-extraneous-dependencies

// Setup enzyme's react adapter
Enzyme.configure({ adapter: new EnzymeAdapter() });

jest.mock('node-fetch');
