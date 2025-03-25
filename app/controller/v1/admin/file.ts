import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { unprocessableEntity, ok } from 'response';
import dotenv from 'dotenv';
import { SpacesUploader } from '~/common/utils/fileUploader';

dotenv.config();

export class UploadController {
  private spacesUploader: SpacesUploader;
  
  constructor() {
    this.spacesUploader = new SpacesUploader({
      accessKeyId: process.env.DO_SPACES_KEY as string,
      secretAccessKey: process.env.DO_SPACES_SECRET as string,
      endpoint: process.env.DO_SPACES_ENDPOINT as string,
      spaceName: process.env.DO_SPACES_NAME as string,
      region: process.env.DO_SPACES_REGION || 'us-east-1'
    });
  }
  
  /**
   * Basic file validation - only checks if file exists and optionally validates size
   */
  validateFile(
    file: Express.Multer.File,
    fieldName: string,
    maxSizeBytes?: number
  ) {
    if (!file || file.fieldname !== fieldName) {
      throw unprocessableEntity(`The field '${fieldName}' is required.`);
    }

    if (maxSizeBytes && file.size > maxSizeBytes) {
      throw unprocessableEntity(
        `The file size exceeds the maximum allowed size of ${(
          maxSizeBytes / 1024 / 1024
        ).toFixed(2)} MB.`
      );
    }
    
    return file;
  }
  
  /**
   * Handle the upload request
   */
  async upload(req: Request, res: Response) {
    try {
      if (!req.file) {
        throw unprocessableEntity("File not found");
      }
      
      const validatedFile = this.validateFile(req.file, "file", 10 * 1024 * 1024);
      const fileName = `${Date.now()}-${uuidv4()}-${validatedFile.originalname}`;
      
      const result = await this.spacesUploader.uploadBuffer(
        validatedFile.buffer,
        fileName,
        {
          path: 'uploads',
          contentType: validatedFile.mimetype,
          metadata: {
            originalName: validatedFile.originalname,
            size: validatedFile.size.toString()
          }
        }
      );
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to upload file');
      }
      
      return res.send(ok({ url: result.url }));
    } catch (error: any) {
      console.error('[upload] Error:', error.message);
      if (error.statusCode) {
        return res.status(error.statusCode).json({ error: error.message });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new UploadController();