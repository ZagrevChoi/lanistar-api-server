import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Connection } from "typeorm";

import { ApiGuard } from "../api.guard";
import { Influencer } from "../models/entities/Influencer";
import { InfluencersController } from "./influencers.controller";
import { InfluencersService } from "./influencers.service";

export const InfluencerRepositoryProvider = {
  provide: "InfluencerRepositoryProvider",
  useFactory: (connection: Connection) => connection.getRepository(Influencer),
  inject: [Connection]
};

@Module({
  imports: [TypeOrmModule.forFeature([Influencer])],
  providers: [InfluencersService, InfluencerRepositoryProvider, ApiGuard],
  controllers: [InfluencersController]
})
export class InfluencersModule {}
