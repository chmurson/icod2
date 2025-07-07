import { LeaderService, SignalingService } from ".";

export const leaderService = new LeaderService(new SignalingService());
