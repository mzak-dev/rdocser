/** Prints concise status messages for headless CLI runs. */
export class CliReporter { info(message:string){console.log(`[rdocser] ${message}`);} error(message:string){console.error(`[rdocser] ${message}`);} }
