import { RESEARCH_MESSAGES } from "@constants/messages.constant";
import { ApiError } from "@utils/ApiError";
import {
  deleteCache,
  deleteCachePattern,
  getCache,
  setCache,
} from "@utils/cache";
import { generateSlug } from "@utils/slugify";
import { normalizeDOI, validateDOI } from "@utils/validateDOI";
import type { Types } from "mongoose";
import type {
  CreateResearchPayload,
  IResearch,
  ResearchFilterQuery,
  UpdateResearchPayload,
} from "./research.interface";
import { Research } from "./research.model";

export class ResearchService {
  private getSafeString(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
  }

  public async getResearchList(query: ResearchFilterQuery): Promise<{
    papers: IResearch[];
    totalDocs: number;
    totalPages: number;
    currentPage: number;
  }> {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;

    const cacheKey = `cache:research:${JSON.stringify({ ...query, page, limit })}`;
    const cached = await getCache<{
      papers: IResearch[];
      totalDocs: number;
      totalPages: number;
      currentPage: number;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    const filter: Record<string, unknown> = {};

    const safeStatus = this.getSafeString(query.status);
    if (safeStatus) {
      filter.status = safeStatus;
    }

    const safeUploadType = this.getSafeString(query.uploadType);
    if (safeUploadType) {
      filter.uploadType = safeUploadType;
    }

    const safeSearch = this.getSafeString(query.search);
    if (safeSearch) {
      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const [papers, totalDocs] = await Promise.all([
      Research.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Research.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalDocs / limit);

    const data = {
      papers: papers as IResearch[],
      totalDocs,
      totalPages,
      currentPage: page,
    };

    if (query.status === "PUBLISHED") {
      await setCache(cacheKey, data, 300);
    }

    return data;
  }

  public async getResearchBySlug(slug: string): Promise<IResearch> {
    const cacheKey = `cache:research-slug:${slug}`;
    const cached = await getCache<IResearch>(cacheKey);

    if (cached) {
      return cached;
    }

    const paper = await Research.findOne({ slug });

    if (!paper) {
      throw new ApiError(404, RESEARCH_MESSAGES.NOT_FOUND);
    }

    const paperData = paper.toJSON();
    await setCache(cacheKey, paperData, 600);

    return paper;
  }

  public async createResearch(
    payload: CreateResearchPayload,
    pdfFile?: Express.Multer.File,
    thumbnailImage?: Express.Multer.File,
  ): Promise<IResearch> {
    const slug = generateSlug(payload.title);

    const existingResearch = await Research.findOne({ slug });
    if (existingResearch) {
      throw new ApiError(409, "Research paper with this title already exists");
    }

    const researchData: Partial<IResearch> = {
      title: payload.title,
      slug,
      description: payload.description,
      uploadType: payload.uploadType,
      status: payload.status || "DRAFT",
      publishedAt: payload.publishedAt
        ? new Date(payload.publishedAt)
        : undefined,
    };

    if (payload.uploadType === "DOI") {
      if (!payload.doiUrl || !validateDOI(payload.doiUrl)) {
        throw new ApiError(400, RESEARCH_MESSAGES.INVALID_DOI);
      }
      researchData.doiUrl = normalizeDOI(payload.doiUrl);
      researchData.doiNumber = payload.doiUrl.replace("https://doi.org/", "");
    } else if (payload.uploadType === "PDF") {
      if (!pdfFile) {
        throw new ApiError(400, "PDF file is required for PDF upload type");
      }
      const { imagekit } = await import("@config/imagekit");
      const result = await imagekit.files.upload({
        file: pdfFile.buffer.toString("base64"),
        fileName: `research-${slug}-${Date.now()}.pdf`,
        folder: "/research-papers",
      });
      researchData.pdfFile = { url: result.url, fileId: result.fileId };
    }

    if (thumbnailImage) {
      const { imagekit } = await import("@config/imagekit");
      const result = await imagekit.files.upload({
        file: thumbnailImage.buffer.toString("base64"),
        fileName: `research-thumb-${slug}-${Date.now()}`,
        folder: "/research-thumbnails",
      });
      researchData.thumbnailImage = { url: result.url, fileId: result.fileId };
    }

    const paper = await Research.create(researchData);

    // Invalidate cache
    await deleteCachePattern("cache:research:*");

    return paper;
  }

  public async updateResearch(
    slug: string,
    payload: UpdateResearchPayload,
    pdfFile?: Express.Multer.File,
    thumbnailImage?: Express.Multer.File,
  ): Promise<IResearch> {
    const paper = await Research.findOne({ slug });

    if (!paper) {
      throw new ApiError(404, RESEARCH_MESSAGES.NOT_FOUND);
    }

    if (payload.title && payload.title !== paper.title) {
      const newSlug = generateSlug(payload.title);
      const existing = await Research.findOne({
        slug: newSlug,
        _id: { $ne: paper._id },
      });
      if (existing) {
        throw new ApiError(
          409,
          "Research paper with this title already exists",
        );
      }
      paper.title = payload.title;
      paper.slug = newSlug;
    }

    if (payload.description !== undefined) {
      paper.description = payload.description;
    }
    if (payload.status) {
      paper.status = payload.status;
    }
    if (payload.publishedAt) {
      paper.publishedAt = new Date(payload.publishedAt);
    }

    if (payload.uploadType) {
      paper.uploadType = payload.uploadType;
      if (payload.uploadType === "DOI" && payload.doiUrl) {
        if (!validateDOI(payload.doiUrl)) {
          throw new ApiError(400, RESEARCH_MESSAGES.INVALID_DOI);
        }
        paper.doiUrl = normalizeDOI(payload.doiUrl);
        paper.doiNumber = payload.doiUrl.replace("https://doi.org/", "");
        // Remove PDF if switching to DOI
        if (paper.pdfFile?.fileId) {
          const { imagekit } = await import("@config/imagekit");
          await imagekit.files.delete(paper.pdfFile.fileId).catch(() => {});
          paper.pdfFile = undefined;
        }
      } else if (payload.uploadType === "PDF") {
        paper.doiUrl = undefined;
        paper.doiNumber = undefined;
      }
    }

    // Handle PDF upload
    if (pdfFile) {
      // Delete old PDF
      if (paper.pdfFile?.fileId) {
        const { imagekit } = await import("@config/imagekit");
        await imagekit.files.delete(paper.pdfFile.fileId).catch(() => {});
      }
      const { imagekit } = await import("@config/imagekit");
      const result = await imagekit.files.upload({
        file: pdfFile.buffer.toString("base64"),
        fileName: `research-${paper.slug}-${Date.now()}.pdf`,
        folder: "/research-papers",
      });
      paper.pdfFile = { url: result.url, fileId: result.fileId };
    }

    // Handle thumbnail upload
    if (thumbnailImage) {
      if (paper.thumbnailImage?.fileId) {
        const { imagekit } = await import("@config/imagekit");
        await imagekit.files
          .delete(paper.thumbnailImage.fileId)
          .catch(() => {});
      }
      const { imagekit } = await import("@config/imagekit");
      const result = await imagekit.files.upload({
        file: thumbnailImage.buffer.toString("base64"),
        fileName: `research-thumb-${paper.slug}-${Date.now()}`,
        folder: "/research-thumbnails",
      });
      paper.thumbnailImage = { url: result.url, fileId: result.fileId };
    }

    await paper.save();

    // Invalidate caches
    await deleteCache(`cache:research-slug:${slug}`);
    await deleteCachePattern("cache:research:*");

    return paper;
  }

  public async deleteResearch(slug: string): Promise<void> {
    const paper = await Research.findOne({ slug });

    if (!paper) {
      throw new ApiError(404, RESEARCH_MESSAGES.NOT_FOUND);
    }

    // Delete files from ImageKit
    const { imagekit } = await import("@config/imagekit");
    if (paper.pdfFile?.fileId) {
      await imagekit.files.delete(paper.pdfFile.fileId).catch(() => {});
    }
    if (paper.thumbnailImage?.fileId) {
      await imagekit.files.delete(paper.thumbnailImage.fileId).catch(() => {});
    }

    await paper.deleteOne();

    // Invalidate caches
    await deleteCache(`cache:research-slug:${slug}`);
    await deleteCachePattern("cache:research:*");
  }

  public async getResearchById(id: Types.ObjectId): Promise<IResearch> {
    const paper = await Research.findById(id);

    if (!paper) {
      throw new ApiError(404, RESEARCH_MESSAGES.NOT_FOUND);
    }

    return paper;
  }
}
