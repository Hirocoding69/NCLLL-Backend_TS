import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { ModuleService } from "~/app/service/module";
import { ok } from "~/common/response";
import { ModuleQueryDto } from "~/app/dto/module";

export class ModuleController {
    private moduleService = new ModuleService();
    async getAll(req: Request, res: Response) {
        const queryDto = plainToInstance(ModuleQueryDto, req.query);
        const paginatedResult = await this.moduleService.getModules(queryDto);
        return res.send(ok(paginatedResult));
    }

    async getById(req: Request, res: Response) {
        const id = req.params.id;
        const module = await this.moduleService.getModuleById(id);
        return res.send(ok(module));
    }

}