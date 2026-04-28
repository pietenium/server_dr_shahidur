import ImageKit from "@imagekit/nodejs";
import { env } from "./env";

const imagekitConfig = {
  publicKey: env.IMAGEKIT_PUBLIC_KEY,
  privateKey: env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
};

export const imagekit = new ImageKit(imagekitConfig);
