import moment from "moment-timezone";

import { appConfig } from "~/common/config/app";

moment.tz.setDefault(appConfig.timezone);

export default moment;
