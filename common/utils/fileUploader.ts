import { S3 } from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { Request } from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Configuration interface for DigitalOcean Spaces
 */
interface SpacesConfig {
  accessKeyId: string;
  secretAccessKey: string;
  endpoint: string;  // e.g. "nyc3.digitaloceanspaces.com"
  region?: string;   // e.g. "us-east-1"
  spaceName: string; // The name of your Space
}

/**
 * Upload options for files
 */
interface UploadOptions {
  path?: string;       // Path within the Space (folder structure)
  acl?: string;        // Access control (default: 'public-read')
  contentType?: string; // MIME type of the file
  metadata?: Record<string, string>; // Additional metadata
}

/**
 * Result of file upload
 */
interface UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: Error;
}

/**
 * DigitalOcean Spaces file uploader utility for Express.js
 */
class SpacesUploader {
  private s3: S3;
  private spaceName: string;
  private baseUrl: string;

  /**
   * Create a new SpacesUploader instance
   * @param config DigitalOcean Spaces configuration
   */
  constructor(config: SpacesConfig) {
    this.spaceName = config.spaceName;
    
    // Build the base URL for the space
    const regionPart = config.endpoint.includes('digitaloceanspaces') 
      ? config.endpoint 
      : `${config.endpoint}.digitaloceanspaces.com`;
    this.baseUrl = `https://${this.spaceName}.${regionPart}`;
    
    this.s3 = new S3({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      endpoint: `https://${config.endpoint}`,
      region: config.region || 'us-east-1',
      s3ForcePathStyle: false, // Set to false for DigitalOcean Spaces
    });
  }

  /**
   * Upload a file from a local path to DigitalOcean Spaces
   * @param filePath Path to the local file
   * @param fileName Name to save the file as in Spaces
   * @param options Upload options
   * @returns Promise with upload result
   */
  async uploadFile(
    filePath: string,
    fileName: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      // Generate a key for the file
      const fileKey = options.path
        ? `${options.path.replace(/^\/|\/$/g, '')}/${fileName}`
        : fileName;

      // Read the file
      const fileContent = fs.readFileSync(filePath);
      
      // Get content type
      const contentType = options.contentType || this.getMimeType(filePath);

      // Upload to DO Spaces
      const params: S3.PutObjectRequest = {
        Bucket: this.spaceName,
        Key: fileKey,
        Body: fileContent,
        ACL: options.acl || 'public-read',
        ContentType: contentType,
        Metadata: options.metadata,
      };

      const result = await this.s3.upload(params).promise();

      return {
        success: true,
        url: result.Location || `${this.baseUrl}/${fileKey}`,
        key: result.Key,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Upload a buffer to DigitalOcean Spaces
   * @param buffer The buffer to upload
   * @param fileName Name to save the file as
   * @param options Upload options
   * @returns Promise with upload result
   */
  async uploadBuffer(
    buffer: Buffer,
    fileName: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      // Generate a key for the file
      const fileKey = options.path
        ? `${options.path.replace(/^\/|\/$/g, '')}/${fileName}`
        : fileName;

      // Upload to DO Spaces
      const params: S3.PutObjectRequest = {
        Bucket: this.spaceName,
        Key: fileKey,
        Body: buffer,
        ACL: options.acl || 'public-read',
        ContentType: options.contentType || this.getMimeType(fileName),
        Metadata: options.metadata,
      };

      const result = await this.s3.upload(params).promise();

      return {
        success: true,
        url: result.Location || `${this.baseUrl}/${fileKey}`,
        key: result.Key,
      };
    } catch (error) {
      console.error('Error uploading buffer:', error);
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Create a multer middleware for handling file uploads directly to DigitalOcean Spaces
   * @param options Upload options
   * @returns Configured multer middleware
   */
  createMulterUploader(options: UploadOptions = {}): {
    upload: multer.Multer;
    handleUpload: (req: Request, fieldName: string) => Promise<UploadResult | null>;
  } {
    // Set up multer with a memory storage
    const storage = multer.memoryStorage();
    const upload = multer({ storage });

    // Handler function to process the upload after multer
    const handleUpload = async (req: Request, fieldName: string): Promise<UploadResult | null> => {
      const file = req.file || (req.files as any)?.[fieldName]?.[0];
      
      if (!file) {
        console.error('No file found in request');
        return null;
      }

      // Get the original filename or generate one
      const fileName = file.originalname || `${Date.now()}-file`;
      
      return this.uploadBuffer(
        file.buffer,
        fileName,
        {
          ...options,
          contentType: file.mimetype || options.contentType,
        }
      );
    };

    return { upload, handleUpload };
  }

  /**
   * Delete a file from DigitalOcean Spaces
   * @param fileKey Key of the file to delete
   * @returns Promise with deletion result
   */
  async deleteFile(fileKey: string): Promise<{ success: boolean; error?: Error }> {
    try {
      await this.s3.deleteObject({
        Bucket: this.spaceName,
        Key: fileKey,
      }).promise();

      return { success: true };
    } catch (error) {
      console.error('Error deleting file:', error);
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * List files in a directory of the Space
   * @param prefix Directory path prefix
   * @returns Promise with array of file data
   */
  async listFiles(prefix: string = ''): Promise<S3.ObjectList> {
    try {
      const result = await this.s3.listObjects({
        Bucket: this.spaceName,
        Prefix: prefix,
      }).promise();

      return result.Contents || [];
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  /**
   * Generate a signed URL for temporary access to a private file
   * @param fileKey Key of the file
   * @param expiresInSeconds URL expiration time in seconds (default: 1 hour)
   * @returns Signed URL
   */
  getSignedUrl(fileKey: string, expiresInSeconds: number = 3600): string {
    const params = {
      Bucket: this.spaceName,
      Key: fileKey,
      Expires: expiresInSeconds,
    };

    return this.s3.getSignedUrl('getObject', params);
  }

  /**
   * Get MIME type based on file extension
   * @param filePath Path or name of the file
   * @returns MIME type string
   */
  private getMimeType(filePath: string): string {
    const extension = path.extname(filePath).toLowerCase();
    
    const mimeTypes: Record<string, string> = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.zip': 'application/zip',
      '.mp3': 'audio/mpeg',
      '.mp4': 'video/mp4',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.txt': 'text/plain',
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  }
}

// Create and export a singleton instance of the SpacesUploader
const spacesUploader = new SpacesUploader({
  accessKeyId: process.env.DO_SPACES_KEY as string,
  secretAccessKey: process.env.DO_SPACES_SECRET as string,
  endpoint: process.env.DO_SPACES_ENDPOINT as string,
  spaceName: process.env.DO_SPACES_NAME as string,
  region: process.env.DO_SPACES_REGION || 'us-east-1',
});

// Also export the class in case someone needs to create their own instance
export { SpacesUploader, SpacesConfig, UploadOptions, UploadResult };

// Export the pre-configured instance as the default export
export default spacesUploader;