import S3 from "aws-sdk/clients/s3";
import path from "path";
import { badRequest, internalServerError } from "response";
import logger from "~/common/utils/logger";

interface ValidatedFile {
  extension: string;
  file: Express.Multer.File;
  buffer: Buffer;
}

export class FileService {
  private s3: S3;

  constructor() {
    const REGION = process.env.AWS_REGION || "sgp1"; // Default to sgp1 for Singapore
    const ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID || "";
    const SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY || "";
    
    const SPACES_ENDPOINT = `https://${REGION}.digitaloceanspaces.com`;

    this.s3 = new S3({
      endpoint: SPACES_ENDPOINT,
      region: REGION,
      credentials: {
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_KEY,
      },
      s3ForcePathStyle: false,
      signatureVersion: 'v4'
    });

    logger.info(`S3 client initialized with endpoint: ${SPACES_ENDPOINT}`);
  }

  async validateImage(
    file: Express.Multer.File,
    key: string,
    maxSizeBytes: number
  ) {
    if (!file || file.fieldname !== key) {
      throw badRequest(`The field '${key}' is required.`);
    }
    
    const ext = path.extname(file.originalname).toLowerCase();
    if (![".png", ".jpeg", ".jpg", ".gif"].includes(ext)) {
      throw badRequest(`The uploaded file is not a valid image`);
    }
    
    if (file.size > maxSizeBytes) {
      throw new Error(
        `The file size exceeds the maximum allowed size of ${(
          maxSizeBytes / 1024 / 1024
        ).toFixed(2)} MB.`
      );
    }
    
    const mimeType = file.mimetype;
    if (!mimeType.startsWith("image/")) {
      throw badRequest(`The uploaded file is not a valid image`);
    }
    
    const buffer = file.buffer;
    return {
      extension: ext,
      file,
      buffer,
    };
  }

  async uploadFile(file: ValidatedFile, key: string) {
    try {
      const bucket = process.env.AWS_S3_BUCKET || "";
      
      if (!bucket) {
        logger.error("[uploadFile] AWS_S3_BUCKET environment variable is not set");
        throw internalServerError("Storage configuration error");
      }

      // Prepare upload parameters
      const params: S3.Types.PutObjectRequest = {
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.file.mimetype,
        ACL: 'public-read',
        Metadata: {
          filename: file.file.originalname,
          size: file.file.size.toString(),
        },
      };

      logger.info(`[uploadFile] Uploading file to bucket: ${bucket}, key: ${key}`);
      
      // Upload file
      const result = await this.s3.upload(params).promise();
      logger.info(`[uploadFile] File uploaded successfully, location: ${result.Location}`);
      
      const region = process.env.AWS_REGION || "sgp1";
      const fileUrl = `https://${bucket}.${region}.digitaloceanspaces.com/${key}`;
      
      return fileUrl;
    } catch (e: any) {
      logger.error(`[uploadFile] Error when uploading. Message: ${e.message}`);
      logger.error(`[uploadFile] Error stack: ${e.stack}`);
      throw internalServerError("Failed to upload file");
    }
  }

  async checkFileExists(key: string): Promise<boolean> {
    try {
      const bucket = process.env.AWS_S3_BUCKET || "";
      
      const params = {
        Bucket: bucket,
        Key: key,
      };
      
      await this.s3.headObject(params).promise();
      return true;
    } catch (error: any) {
      if (error.code === "NotFound") {
        return false;
      }
      logger.error(`[checkFileExists] Error checking file: ${error.message}`);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const bucket = process.env.AWS_S3_BUCKET || "";
      
      const params = {
        Bucket: bucket,
        Key: key,
      };
      
      await this.s3.deleteObject(params).promise();
      logger.info(`[deleteFile] File deleted successfully`);
    } catch (error: any) {
      logger.error(`[deleteFile] Error deleting file: ${error.message}`);
      throw internalServerError("Failed to delete file");
    }
  }
}