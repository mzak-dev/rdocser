/** Creates the browser runtime dependency container. */
import { RuntimeContainer } from "./RuntimeContainer";
export class AppBootstrap { create(){return new RuntimeContainer();} }
