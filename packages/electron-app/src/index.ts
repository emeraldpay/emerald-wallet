export { createServices } from './createServices';
export { getMainWindow } from './windows/MainWindow';
export { assertSingletonWindow } from './windows/singletonWindow';

import * as protocol from './protocol';
export { protocol };

export { default as ElectronLogger } from './logging/ElectronLogger';

export { default as Application } from './application/Application';
