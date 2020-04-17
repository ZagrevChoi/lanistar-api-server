import getCountryFromIp from "../src/utils/ipGeolocation";

describe("getCountryFromIp", () => {
  test("should resolve 144.76.217.123 to DE", async () => {
    const res = await getCountryFromIp("144.76.217.123");
    expect(res.country.isoCode).toBe("DE");
  });
});
