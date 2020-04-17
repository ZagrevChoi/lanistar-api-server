import { ApiGuard } from "./api.guard";

describe("AuthGuard", () => {
  it("should be defined", () => {
    expect(new ApiGuard()).toBeDefined();
  });
});
