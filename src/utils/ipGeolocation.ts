import path from "path";

import { Reader } from "@maxmind/geoip2-node";

let geoReader = null;

const getCountryFromIp = async (ip: string) => {
  if (geoReader == null) {
    geoReader = await Reader.open(path.resolve("data/country.mmdb"), {});
  }
  return geoReader.country(ip);
};

export default getCountryFromIp;
