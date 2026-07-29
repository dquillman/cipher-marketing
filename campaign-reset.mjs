export {
  RESET_CONFIRMATION,
  buildCompetitorReports,
  buildFreshCompetitors,
  buildFreshPosts,
  buildFreshState,
  validateCampaignStart,
} from "./functions/campaign-blueprint.js";

import { buildFreshState } from "./functions/campaign-blueprint.js";

export function resetCampaignState(state, startDate, now = new Date()) {
  return buildFreshState(state, startDate, now);
}
