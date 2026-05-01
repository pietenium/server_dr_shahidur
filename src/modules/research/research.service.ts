import { Research } from "./research.model";
import type { IResearch, CreateResearchPayload } from "./research.interface";

export const researchService = {
  create: async (payload: CreateResearchPayload): Promise<IResearch> => {
    return Research.create(payload);
  },
};
