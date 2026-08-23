import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Every 6 hours, prune leaderboard entries to keep DB lean
crons.interval("prune leaderboards", { hours: 6 }, internal.rng.pruneAllLeaderboards);

export default crons;

