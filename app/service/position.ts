import { notFound, unprocessableEntity } from "~/common/response";
import { PositionModel } from "../entity/gov-board-member";
import { CreatePositionPayload, EditPositionPayload } from "../dto/position";

export class PositionService {
  async create(payload: CreatePositionPayload) {
    const existingPosition = await PositionModel.findOne({
      $or: [
        { "en.title": payload.en.title, "en.level": payload.en.level },
        { "kh.title": payload.kh.title, "kh.level": payload.kh.level },
      ],
    });

    if (existingPosition) {
      throw unprocessableEntity("message.position_already_exist");
    }

    try {
      return await PositionModel.create(payload);
    } catch (error:any) {
      if (error.code === 11000) { // Handle MongoDB unique constraint error
        throw unprocessableEntity("message.position_already_exist");
      }
      throw error;
    }
}


  async getAll() {
    return await PositionModel.find({ deleted_at: null });
  }

  async get(id: string) {
    const position = await PositionModel.findById(id);
    if (!position) {
      throw notFound("message.not_found");
    }
    return position;
  }

  async update(payload: EditPositionPayload) {
    const { id, en, kh } = payload;
    const position = await PositionModel.findById(id);
    if (!position) {
      throw notFound("message.not_found");
    }
  
    if (en || kh) {
      const queryConditions: any[] = [];
  
      if (en?.title !== undefined && en?.level !== undefined) {
        queryConditions.push({ "en.title": en.title, "en.level": en.level });
      }
  
      if (kh?.title !== undefined && kh?.level !== undefined) {
        queryConditions.push({ "kh.title": kh.title, "kh.level": kh.level });
      }
  
      if (queryConditions.length > 0) {
        const existingPosition = await PositionModel.findOne({
          _id: { $ne: id },
          $or: queryConditions,
        });
  
        if (existingPosition) {
          throw unprocessableEntity("message.position_already_exist");
        }
      }
    }
  
    // Apply the updates
    if (en) {
      if (en.title) position.en.title = en.title;
      if (en.level !== undefined) position.en.level = en.level;
    }
  
    if (kh) {
      if (kh.title) position.kh.title = kh.title;
      if (kh.level !== undefined) position.kh.level = kh.level;
    }
  
    try {
      return await position.save();
    } catch (error:any) {
      if (error.code === 11000) {
        throw unprocessableEntity("message.position_already_exist");
      }
      throw error;
    }
  }
  

  async delete(id: string) {
   await PositionModel.findOneAndDelete({ _id: id });
  }
}
