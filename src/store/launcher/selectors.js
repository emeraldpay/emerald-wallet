// @flow
export const getChainName: any => string = (state) => state.launcher.get('chain').get('name') || '';
