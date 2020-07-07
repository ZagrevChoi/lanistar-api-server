export class LSLoginReq {
  email: string;
  password: string;
}

export class LSLoginRes {
  token: string;
}

export class LSCreateUserReq {
  email: string;
  password: string;
  fullname: string;
  role: number;
  id: string;
}

export class LSCreateUserRes {
  id: string;
  email: string;
  fullname: string;
  role: number;
  statusCode: number;
}
