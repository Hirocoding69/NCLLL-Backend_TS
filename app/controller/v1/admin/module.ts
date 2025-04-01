import { Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { ModuleService } from "~/app/service/module";
import { ok } from "~/common/response";
import { CreateModulePayload, EditModulePayload, ModuleQueryDto } from "~/app/dto/module";

export class ModuleController {
    private moduleService = new ModuleService();

    async create(req: Request, res: Response) {
        const payload = plainToInstance(CreateModulePayload, req.body);
        const module = await this.moduleService.createModule(payload);
        return res.send(ok(module));
    }

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

    async update(req: Request, res: Response) {
        const payload = plainToInstance(EditModulePayload, req.body);
        const module = await this.moduleService.updateModule(payload);
        return res.send(ok(module));
    }

    async softDelete(req: Request, res: Response) {
        const id = req.params.id;
        await this.moduleService.deleteModule(id);
        return res.send(ok());
    }

    async getMainCategories(req: Request, res: Response) {
        const categories = await this.moduleService.getMainCategories();
        return res.send(ok(categories));
    }

    async getSubCategories(req: Request, res: Response) {
        const mainCategory = req.params.mainCategory;
        const subCategories = await this.moduleService.getSubCategories(mainCategory);
        return res.send(ok(subCategories));
    }
}