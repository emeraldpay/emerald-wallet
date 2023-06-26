export default interface ILogger {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debug: (...params: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: (...params: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info: (...params: any[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn: (...params: any[]) => void;
}
