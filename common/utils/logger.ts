import { createLogger, format, transports } from "winston";
import TransportStream from "winston-transport";
// import WinstonCloudWatch from "winston-cloudwatch";
import moment from "moment";
import { SelectQueryBuilder } from "typeorm";

const env = process.env.APP_ENV || "local";
// const cloudwatchGroupName = process.env.AWS_CLOUDWATCH_GROUP_NAME;
// const awsRegion = process.env.AWS_REGION;
const transportStreams: TransportStream[] = [];

// if (
//   ["staging", "production"].includes(env) &&
//   cloudwatchGroupName &&
//   awsRegion
// ) {
//   transportStreams.push(
//     new WinstonCloudWatch({
//       logGroupName: process.env.CLOUDWATCH_GROUP_NAME,
//       logStreamName: `${process.env.CLOUDWATCH_GROUP_NAME}-${process.env.APP_ENV}`,
//       awsRegion: process.env.CLOUDWATCH_REGION,
//       messageFormatter: ({ level, message }) => `[${level}]: ${message}}`,
//     })
//   );
// }

transportStreams.push(
  new transports.Console({
    format: format.combine(format.colorize(), format.simple()),
    log: (info: any, next) => {
      console.log(
        `[${moment().utc().format()}] ${info.level} - ${info.message}`
      );
      next();
    },
  })
);

const winstonLogger = createLogger({
  transports: transportStreams,
});

const logger = {
  info: (...message: any) => {
    winstonLogger.info(message);
  },
  sql: (qb: SelectQueryBuilder<any>) => {
    let query = qb.getQuery();
    const parameters = qb.getParameters();

    Object.keys(parameters).forEach((key) => {
      const value = parameters[key];
      const regex = new RegExp(`:${key}`, "g");
      query = query.replace(regex, !isNaN(+value) ? `${value}` : `'${value}'`);
    });

    winstonLogger.info(query);
  },
  warn: (...message: any) => {
    winstonLogger.warn(message);
  },
  error: (...message: any) => {
    winstonLogger.error(message);
  },
};

export default logger;
