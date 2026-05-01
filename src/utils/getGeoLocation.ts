import axios from "axios";
import type { GeoLocation } from "@types-app/global.types";

interface IpWhoResponse {
  ip: string;
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
}

export const getGeoLocation = async (ip: string): Promise<GeoLocation> => {
  try {
    if (ip === "::1" || ip === "127.0.0.1" || ip === "localhost") {
      return {
        country: "Unknown",
        region: "Unknown",
        city: "Unknown",
        lat: 0,
        lon: 0,
        ip,
      };
    }

    const response = await axios.get<IpWhoResponse>(`https://ipwho.is/${ip}`);
    const data = response.data;

    return {
      country: data.country || "Unknown",
      region: data.region || "Unknown",
      city: data.city || "Unknown",
      lat: data.latitude || 0,
      lon: data.longitude || 0,
      ip: data.ip || ip,
    };
  } catch (_error) {
    return {
      country: "Unknown",
      region: "Unknown",
      city: "Unknown",
      lat: 0,
      lon: 0,
      ip,
    };
  }
};
