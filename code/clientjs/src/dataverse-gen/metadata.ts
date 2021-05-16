/* eslint-disable*/
import { accountMetadata } from "./entities/Account";
import { activitypartyMetadata } from "./entities/ActivityParty";
import { emailMetadata } from "./entities/Email";
import { opportunityMetadata } from "./entities/Opportunity";
import { opportunitycloseMetadata } from "./entities/OpportunityClose";
import { WinOpportunityMetadata } from "./actions/WinOpportunity";

export const Entities = {
  Account: "account",
  ActivityParty: "activityparty",
  Email: "email",
  Opportunity: "opportunity",
  OpportunityClose: "opportunityclose",
};

// Setup Metadata
// Usage: setMetadataCache(metadataCache);
export const metadataCache = {
  entities: {
    account: accountMetadata,
    activityparty: activitypartyMetadata,
    email: emailMetadata,
    opportunity: opportunityMetadata,
    opportunityclose: opportunitycloseMetadata,
  },
  actions: {
    WinOpportunity: WinOpportunityMetadata,
  }
};