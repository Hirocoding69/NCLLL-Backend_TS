import { Type } from "class-transformer";

export class EditWebsiteSettingsPayload {
  @Type(() => Boolean)
  maintenanceMode: Boolean;
}