import { Injectable } from "@nestjs/common";

export class ServerTime {
  static date: Date;
}

@Injectable()
export class AppService {
  getServerTime(): string {
    return ServerTime.date.toISOString();
  }
}
