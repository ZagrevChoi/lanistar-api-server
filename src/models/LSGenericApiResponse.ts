export class LSGenericApiResponse<T = {}> {
  payload?: T;
  result: "created" | "updated";
  // errors?: LSApiError[];
}
