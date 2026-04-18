import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary-v2";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.dhrnuq5ve!,
  api_key: process.env.941921533592923!,
  api_secret: process.env.dKjjM5ADOs1JYV_8Gwbi9xJPBBY!,
});

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "dispatch/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face" }],
  } as object,
});

const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "dispatch/documents",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    resource_type: "auto",
  } as object,
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export { cloudinary };
