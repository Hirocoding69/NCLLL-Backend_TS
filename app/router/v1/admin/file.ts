import express from 'express';
import multer from 'multer';
import { UploadController } from '~/app/controller/v1/admin/file';
import fuckMulter from '~/common/middleware/multer';
import { bindCtx } from '~/common/utils/bind';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const ctrl = bindCtx(new UploadController());
// Route for handling file uploads
router.post('/', fuckMulter, ctrl.upload);

export default router;