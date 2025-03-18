import {
  LoginPayload,
} from "../dto/auth";
import moment from 'moment-timezone';
import { AdminModel } from "../entity/admin";
import { encrypt } from "~/common/helper/hash";
import { JwtUtils } from "~/common/utils/jwt";
import { notFound, unauthorized } from "~/common/response";
import { compare } from "bcrypt";
import { log } from "console";

export class AuthService {

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
    const admin = await AdminModel.findOne({ name: payload.username });
    if (!admin) {
      throw notFound('User not found');
    }
    const isValid = compare(payload.password, admin.password);
    if (!isValid) {
      throw unauthorized("message.invalid_username_password");
    }
    const token = JwtUtils.sign({ userId: admin.id });
    
    return token;
  }


}
