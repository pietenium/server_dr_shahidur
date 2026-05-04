import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { imagekit } from "@config/imagekit";
import { cloudinaryUploader } from "@config/cloudinary";
import { ApiError } from "@utils/ApiError";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { Readable } from "stream";
import type { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

export const uploadController = {
  uploadImage: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "No image file uploaded");
    }
    
    const result = await (imagekit as any).upload({
      file: `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      fileName: req.file.originalname,
      folder: "/images",
    });

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: result.url,
        fileId: result.fileId,
      },
    });
  }),

  uploadPdf: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "No PDF file uploaded");
    }
    
    const result = await (imagekit as any).upload({
      file: `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
      fileName: req.file.originalname,
      folder: "/pdfs",
    });

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "PDF uploaded successfully",
      data: {
        url: result.url,
        fileId: result.fileId,
      },
    });
  }),

  uploadVideo: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "No video file uploaded");
    }

    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinaryUploader.upload_stream(
        { resource_type: "video", folder: "videos" },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Cloudinary upload failed: " + error.message));
          } else if (result) {
            resolve(result);
          } else {
            reject(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Cloudinary upload failed with unknown error"));
          }
        }
      );
      Readable.from(req.file!.buffer).pipe(uploadStream);
    });

    ApiResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Video uploaded successfully",
      data: {
        url: uploadResult.secure_url,
        fileId: uploadResult.public_id,
      },
    });
  }),
};
