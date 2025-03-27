import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, PutObjectCommandOutput } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import dotenv from 'dotenv'

dotenv.config()

const bucketName = process.env.AWS_S3_BUCKET_NAME
const publicBucketName = process.env.AWS_S3_PUBLIC_BUCKET_NAME
const region = process.env.AWS_S3_REGION
const accessKeyId = process.env.AWS_S3_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_S3_SECRET_ACCESS_KEY

const s3Client = new S3Client({
  credentials: {
    accessKeyId: accessKeyId || "",
    secretAccessKey: secretAccessKey || "",
  },
  region: region,
});

interface UploadResult {
  url: string;
  key: string;
}

interface PresignedUrlResult {
  uploadUrl: string;
  key: string;
  downloadUrl: string;
}

export async function generatePresignedUrl(
  fileName: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<PresignedUrlResult> {
  if (!bucketName) {
    throw new Error('AWS S3 Bucket name is not configured');
  }

  const key = `${Date.now()}-${fileName}`;
  
  try {
    // Generate upload URL
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType
    });
    
    const uploadUrl = await getSignedUrl(s3Client, uploadCommand, { expiresIn });
    
    // Generate download URL
    const downloadCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });
    
    const downloadUrl = await getSignedUrl(s3Client, downloadCommand, { expiresIn });

    return {
      uploadUrl,
      key,
      downloadUrl
    };
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
}

export async function uploadFile(fileBuffer: Buffer, fileName: string, mimetype: string, bucketType?: 'public' | 'private'): Promise<UploadResult> {
  const currentBucketName = bucketType === 'public' ? publicBucketName : bucketName

  if (!currentBucketName) {
    throw new Error('AWS S3 Bucket name is not configured');
  }

  const uploadParams = {
    Bucket: currentBucketName,
    Body: fileBuffer,
    Key: fileName,
    ContentType: mimetype
  }

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));

    // Construct the S3 URL manually
    const imageUrl = `https://${currentBucketName}.s3.${region}.amazonaws.com/${fileName}`;

    return {
      url: imageUrl,
      key: fileName
    };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw error;
  }
}

export async function generatePresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  if (!bucketName) {
    throw new Error('AWS S3 Bucket name is not configured');
  }

  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });
    
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating presigned download URL:', error);
    throw error;
  }
}

export function deleteFile(fileName: string) {
  const deleteParams = {
    Bucket: bucketName,
    Key: fileName,
  }

  return s3Client.send(new DeleteObjectCommand(deleteParams));
}