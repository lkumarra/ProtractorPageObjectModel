import { configure, getLogger, Logger } from "log4js";
export class Log4j {
  public static log(className: string): Logger {
    configure({
      appenders: {
        console: {
          type: "console",
          category: "console",
          pattern: "%d{dd/MM hh:mm}:: %l:: %c:: %-5p:: %m",
        },

        file: {
          category: "test-file-appender",
          type: "file",
          filename: "./Guru99Bank.log",
          maxLogSize: 10240,
          backups: 3,
          pattern: "%d{dd/MM hh:mm}",
        },
      },
      categories: {
        default: { appenders: ["console", "file"], level: "DEBUG" },
        file: { appenders: ["file"], level: "DEBUG" },
      },
    });
    let logger: Logger = getLogger(className);
    return logger;
  }
}
