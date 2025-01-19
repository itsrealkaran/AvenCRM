import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, PutObjectCommandOutput } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import dotenv from 'dotenv'

dotenv.config()

const bucketName = process.env.AWS_S3_BUCKET_NAME
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

export async function uploadFile(fileBuffer: Buffer, fileName: string, mimetype: string): Promise<UploadResult> {
  if (!bucketName) {
    throw new Error('AWS S3 Bucket name is not configured');
  }

  const uploadParams = {
    Bucket: bucketName,
    Body: fileBuffer,
    Key: fileName,
    ContentType: mimetype
  }

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));

    // Construct the S3 URL manually
    const imageUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;

    return {
      url: imageUrl,
      key: fileName
    };
  } catch (error) {
    console.error('S3 Upload Error:', error);
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