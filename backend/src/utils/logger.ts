import pino from "pino";
import { createLoggerOptions } from "./logRedaction";

export const logger = pino(createLoggerOptions());

