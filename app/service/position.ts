import { notFound, unprocessableEntity } from "~/common/response";
import { PositionModel } from "../entity/gov-board-member";
import { CreatePositionPayload } from "../dto/position";

export class PositionService {
  async create(payload: CreatePositionPayload) {
    const position = await PositionModel.findOne({ title: payload.title });
    if (position) {
      throw unprocessableEntity("message.position_already_exist");
    }
    return await PositionModel.create(payload);
  }

  async getAll() {
    return await PositionModel.find({ deleted_at: null });
  }

  async get(id: string) {
    const position = await PositionModel.findOne({ _id: id });
    if (!position) {
      throw notFound("message.not_found");
    }
    return position;
  }

  async update(id: string, title?: string, level?: number) {
    const position = await PositionModel.findOne({ _id: id });
    if (!position) {
      throw notFound("message.not_found");
    }
    if (title) position.title = title;
    if (level !== undefined) position.level = level;
    return await position.save();
  }

  async softDelete(id: string) {
    const position = await PositionModel.findById(id);
    if (!position) {
      throw notFound("message.not_found");
    }
    return await position.save();
  }
}
