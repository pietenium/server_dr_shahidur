import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { imagekit } from "@config/imagekit";
import { cloudinaryUploader } from "@config/cloudinary";
import { ApiError } from "@utils/ApiError";
import { asyncHandler } from "@utils/asyncHandler";
import { ApiResponse } from "@utils/ApiResponse";
import { Readable } from "stream";
import type { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

interface ImageKitUploadResponse {
  url: string;
  fileId: string;
  [key: string]: unknown;
}

interface ImageKitInstance {
  upload(params: {
    file: string | Buffer;
    fileName: string;
    folder?: string;
    [key: string]: unknown;
  }): Promise<ImageKitUploadResponse>;
}

export const uploadController = {
  uploadImage: asyncHandler(async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "No image file uploaded");
    }

    const ik = imagekit as unknown as ImageKitInstance;
    const result = await ik.upload({
      file: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      fileName: file.originalname,
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
    const file = req.file;
    if (!file) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "No PDF file uploaded");
    }

    const ik = imagekit as unknown as ImageKitInstance;
    const result = await ik.upload({
      file: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      fileName: file.originalname,
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
    const file = req.file;
    if (!file) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "No video file uploaded");
    }

    const uploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        const uploadStream = cloudinaryUploader.upload_stream(
          { resource_type: "video", folder: "videos" },
          (
            error: UploadApiErrorResponse | undefined,
            result: UploadApiResponse | undefined,
          ) => {
            if (error) {
              reject(
                new ApiError(
                  StatusCodes.INTERNAL_SERVER_ERROR,
                  "Cloudinary upload failed: " + error.message,
                ),
              );
            } else if (result) {
              resolve(result);
            } else {
              reject(
                new ApiError(
                  StatusCodes.INTERNAL_SERVER_ERROR,
                  "Cloudinary upload failed with unknown error",
                ),
              );
            }
          },
        );
        Readable.from(file.buffer).pipe(uploadStream);
      },
    );

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
