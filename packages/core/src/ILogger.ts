export default interface ILogger {
  debug: (...params: any[]) => void;
  error: (...params: any[]) => void;
  warn: (...params: any[]) => void;
  info: (...params: any[]) => void;
}
