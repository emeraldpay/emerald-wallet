export function getMessage (state: any): any {
  return state.launcher.get('message').toJSON();
}
export function isConnecting (state: any): boolean {
  return state.launcher.get('connecting');
}
