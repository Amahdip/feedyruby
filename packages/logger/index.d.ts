// Minimal type declarations for @feedyruby/logger
// This file provides basic typings so TypeScript can compile imports.

declare module "@feedyruby/logger" {
  export interface Logger {
    info(message?: any, ...optionalParams: any[]): void;
    warn(message?: any, ...optionalParams: any[]): void;
    error(message?: any, ...optionalParams: any[]): void;
    debug?(message?: any, ...optionalParams: any[]): void;
  }
  const logger: Logger;
  export default logger;
}
