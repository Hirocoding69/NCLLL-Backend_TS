import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { unprocessableEntity, ok } from 'response';
import path from 'path';
import dotenv from 'dotenv';
import { SpacesUploader } from '~/common/utils/fileUploader';

// Load environment variables
dotenv.config();

export class UploadController {
  private spacesUploader: SpacesUploader;
  
  constructor() {
    // Initialize the SpacesUploader with your DigitalOcean credentials
    this.spacesUploader = new SpacesUploader({
      accessKeyId: process.env.DO_SPACES_KEY as string,
      secretAccessKey: process.env.DO_SPACES_SECRET as string,
      endpoint: process.env.DO_SPACES_ENDPOINT as string, // e.g. "sgp1.digitaloceanspaces.com"
      spaceName: process.env.DO_SPACES_NAME as string,    // e.g. "nclll"
      region: process.env.DO_SPACES_REGION || 'us-east-1' // Optional, defaults to us-east-1
    });
  }
  
  /**
   * Validate that the file is an image and under the size limit
   */
   validateImage(
    file: Express.Multer.File,
    fieldName: string,
    maxSizeBytes: number
  ) {
    if (!file || file.fieldname !== fieldName) {
      throw unprocessableEntity(`The field '${fieldName}' is required.`);
    }
    
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.png', '.jpeg', '.jpg', '.gif'].includes(ext)) {
      throw unprocessableEntity('The uploaded file is not a valid image');
    }
    
    if (file.size > maxSizeBytes) {
      throw unprocessableEntity(
        `The file size exceeds the maximum allowed size of ${(
          maxSizeBytes / 1024 / 1024
        ).toFixed(2)} MB.`
      );
    }
    
    const mimeType = file.mimetype;
    if (!mimeType.startsWith('image/')) {
      throw unprocessableEntity('The uploaded file is not a valid image');
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
      
      // Validate the image
      const validatedFile = this.validateImage(req.file, "file", 5 * 1024 * 1024);
      
      // Generate a unique filename
      const fileName = `${Date.now()}-${uuidv4()}-${validatedFile.originalname}`;
      
      // Use the SpacesUploader to upload the buffer
      const result = await this.spacesUploader.uploadBuffer(
        validatedFile.buffer,
        fileName,
        {
          path: 'uploads', // Optional subdirectory in your Space
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

// Export an instance of the controller
export default new UploadController();