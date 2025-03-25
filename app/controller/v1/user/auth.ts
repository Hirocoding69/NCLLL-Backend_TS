import { AuthService } from "~/app/service/auth";
import _ from "lodash";

export class AuthController {
  private svc: AuthService;
  constructor() {
    this.svc = new AuthService();
  }

}
