import type mongoose from "mongoose";
import { Research } from "./research.model";
import type {
  IResearch,
  CreateResearchPayload,
  UpdateResearchPayload,
  ResearchFilterQuery,
} from "./research.interface";
import { generateSlug } from "@utils/slugify";
import { getCache, setCache, deleteCache, deleteCachePattern } from "@utils/cache";
import { ApiError } from "@utils/ApiError";
import { StatusCodes } from "http-status-codes";
import { imagekit } from "@config/imagekit";
import { logger } from "@utils/logger";
import { validateDOI, normalizeDOI } from "@utils/validateDOI";


const CACHE_TTL_LIST = 300; // 5 minutes
const CACHE_TTL_DETAIL = 600; // 10 minutes

export const researchService = {
  create: async (payload: CreateResearchPayload): Promise<IResearch> => {
    const slug = generateSlug(payload.title);
    const existing = await Research.findOne({ slug });
    if (existing) {
      throw new ApiError(StatusCodes.CONFLICT, "Research with this title already exists");
    }

    let finalDoiUrl = payload.doiUrl;
    let finalDoiNumber = undefined;

    if (payload.uploadType === "DOI") {
      if (!payload.doiUrl) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "DOI URL is required for DOI upload type");
      }
      if (!validateDOI(payload.doiUrl)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid DOI format");
      }
      finalDoiUrl = normalizeDOI(payload.doiUrl);
      // Extract the DOI number (e.g. 10.xxxx/yyyy from https://doi.org/10.xxxx/yyyy)
      const doiMatch = finalDoiUrl.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i);
      if (doiMatch) {
        finalDoiNumber = doiMatch[0];
      }
    }

    const research = await Research.create({
      ...payload,
      slug,
      doiUrl: finalDoiUrl,
      doiNumber: finalDoiNumber,
    });

    // Invalidate caches
    void deleteCachePattern("cache:research:*");
    void deleteCachePattern("cache:research-slug:*");

    return research;
  },

  getResearchList: async (query: ResearchFilterQuery, isAdmin = false): Promise<mongoose.PaginateResult<IResearch>> => {
    const { status, uploadType, search, page = 1, limit = 10 } = query;
    
    const filter: Record<string, unknown> = {};
    
    if (!isAdmin) {
      filter.status = "PUBLISHED";
    } else if (status) {
      filter.status = status.toUpperCase();
    }

    if (uploadType) {filter.uploadType = uploadType.toUpperCase();}
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const cacheKey = `cache:research:${JSON.stringify({ filter, page, limit })}`;

    // Try cache if not admin
    if (!isAdmin) {
      const cached = await getCache<unknown>(cacheKey);
      if (cached) {return cached as mongoose.PaginateResult<IResearch>;}
    }

    const options = {
      page,
      limit,
      sort: "-createdAt",
    };

    const model = Research;
    const results = await model.paginate(filter, options);

    if (!isAdmin) {
      void setCache(cacheKey, results, CACHE_TTL_LIST);
    }

    return results;
  },

  getBySlug: async (slug: string, isPublic = true): Promise<IResearch> => {
    const cacheKey = `cache:research-slug:${slug}`;

    if (isPublic) {
      const cached = await getCache<IResearch>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const research = await Research.findOne({ slug });
    if (!research) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Research not found");
    }

    if (isPublic && research.status !== "PUBLISHED") {
      throw new ApiError(StatusCodes.FORBIDDEN, "This research is not published");
    }

    if (isPublic) {
      void setCache(cacheKey, research, CACHE_TTL_DETAIL);
    }

    return research;
  },

  update: async (id: string, payload: UpdateResearchPayload): Promise<IResearch> => {
    if (typeof id !== "string") {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid research id");
    }
    const existingResearch = await Research.findOne({ _id: { $eq: id } });
    if (!existingResearch) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Research not found");
    }

    const updateData: Partial<IResearch> = {};

    if (payload.title !== undefined) {
      if (typeof payload.title !== "string") {throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid title");}
      const newSlug = generateSlug(payload.title);
      const slugExists = await Research.findOne({ slug: newSlug, _id: { $ne: id } });
      if (slugExists) {
        throw new ApiError(StatusCodes.CONFLICT, "A research item with a similar title already exists");
      }
      updateData.title = payload.title;
      updateData.slug = newSlug;
    }

    if (payload.description !== undefined) {
      if (typeof payload.description !== "string" && payload.description !== null) {throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid description");}
      updateData.description = payload.description;
    }

    if (payload.uploadType !== undefined) {
      if (payload.uploadType !== "PDF" && payload.uploadType !== "DOI") {throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid uploadType");}
      updateData.uploadType = payload.uploadType;
    }

    if (payload.status !== undefined) {
      if (payload.status !== "DRAFT" && payload.status !== "PUBLISHED") {throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid status");}
      updateData.status = payload.status;
    }

    if (payload.publishedAt !== undefined) {
      const publishedAt =
        (payload.publishedAt as unknown) instanceof Date
          ? (payload.publishedAt as unknown as Date)
          : new Date(payload.publishedAt);
      if (Number.isNaN(publishedAt.getTime())) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid publishedAt");
      }
      updateData.publishedAt = publishedAt;
    }

    if (payload.doiUrl !== undefined) {
      if (typeof payload.doiUrl !== "string") {throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid doiUrl");}
      if (!validateDOI(payload.doiUrl)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid DOI format");
      }
      updateData.doiUrl = normalizeDOI(payload.doiUrl);
      const doiMatch = updateData.doiUrl.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i);
      if (doiMatch) {
        updateData.doiNumber = doiMatch[0];
      }
    }

    if (payload.pdfFile !== undefined) {
      if (existingResearch.pdfFile?.fileId) {
        void imagekit.files.delete(existingResearch.pdfFile.fileId).catch(() => {});
      }
      updateData.pdfFile = payload.pdfFile;
    }
    if (payload.thumbnailImage !== undefined) {
      if (existingResearch.thumbnailImage?.fileId) {
        void imagekit.files.delete(existingResearch.thumbnailImage.fileId).catch(() => {});
      }
      updateData.thumbnailImage = payload.thumbnailImage;
    }

    // Verify upload type constraints if updating to DOI
    const finalUploadType = payload.uploadType || existingResearch.uploadType;
    if (finalUploadType === "DOI") {
      const finalDoiUrl = updateData.doiUrl || existingResearch.doiUrl;
      if (!finalDoiUrl) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "DOI URL is required for DOI upload type");
      }
    }

    const research = await Research.findOneAndUpdate({ _id: { $eq: id } }, { $set: updateData }, {
      new: true,
      runValidators: true,
    });

    if (!research) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Research not found");
    }

    // Invalidate caches
    void deleteCachePattern("cache:research:*");
    void deleteCachePattern("cache:research-slug:*");
    void deleteCache(`cache:research-slug:${research.slug}`);
    if (existingResearch.slug !== research.slug) {
      void deleteCache(`cache:research-slug:${existingResearch.slug}`);
    }

    return research;
  },

  delete: async (id: string): Promise<void> => {
    if (typeof id !== "string") {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid research id");
    }
    const research = await Research.findOne({ _id: { $eq: id } });
    if (!research) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Research not found");
    }

    // Delete images/pdfs from ImageKit
    const deletePromises: Promise<unknown>[] = [];
    if (research.pdfFile?.fileId) {
      deletePromises.push(imagekit.files.delete(research.pdfFile.fileId));
    }
    if (research.thumbnailImage?.fileId) {
      deletePromises.push(imagekit.files.delete(research.thumbnailImage.fileId));
    }

    try {
      await Promise.all(deletePromises);
    } catch (err) {
      logger.error("Error deleting Research assets from ImageKit:", err);
    }

    await Research.findOneAndDelete({ _id: { $eq: id } });

    // Invalidate caches
    void deleteCachePattern("cache:research:*");
    void deleteCachePattern("cache:research-slug:*");
    void deleteCache(`cache:research-slug:${research.slug}`);
  },
};
