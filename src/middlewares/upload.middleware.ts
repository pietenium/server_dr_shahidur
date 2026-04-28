import multer, { FileFilterCallback } from "multer";
import { Request } from "express";
import { ApiError } from "@utils/ApiError";

const ALLOWED_IMAGE_TYPES: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const ALLOWED_PDF_TYPE: readonly string[] = ["application/pdf"];

const ALLOWED_VIDEO_TYPES: readonly string[] = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const storage = multer.memoryStorage();

const imageFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `Invalid image type: ${file.mimetype}`));
  }
};

const pdfFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  if (ALLOWED_PDF_TYPE.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new ApiError(
        400,
        `Invalid file type: ${file.mimetype}. Only PDF allowed.`,
      ),
    );
  }
};

const videoFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, `Invalid video type: ${file.mimetype}`));
  }
};

const imageAndVideoFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
): void => {
  if (file.fieldname === "image") {
    imageFilter(req, file, cb);
  } else if (file.fieldname === "video") {
    videoFilter(req, file, cb);
  } else {
    cb(new ApiError(400, "Unexpected field"));
  }
};

export const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadPDF = multer({
  storage,
  fileFilter: pdfFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

export const uploadVideo = multer({
  storage,
  fileFilter: videoFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

export const uploadImageAndVideo = multer({
  storage,
  fileFilter: imageAndVideoFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});
