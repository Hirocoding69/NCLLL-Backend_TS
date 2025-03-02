import {
  LoginPayload,
  RegisterPayload,
} from "../dto/auth";
import moment from 'moment-timezone';
import { AdminModel } from "../entity/admin";
import { encrypt } from "~/common/helper/hash";


export class AuthService {
  constructor() {
  }

  async seedAdminAccount() {
    let existingAdmin = await AdminModel.findOne({ name: 'admin' });
    const defaultPassword = encrypt("1234");
    if (!existingAdmin) {
      await AdminModel.create({
        name: 'admin',
        email: 'admin@gmail.com',
        password: defaultPassword,
        role: 'admin',
      });
    } else {
      existingAdmin.password = defaultPassword;
      await existingAdmin.save();
    }
  }
  async login(payload: LoginPayload) {
    const token = '';
    return token;
  }


}
