/* eslint-disable*/
import { IEntity } from "dataverse-ify";
// Entity ActivityParty
export const activitypartyMetadata = {
  typeName: "mscrm.activityparty",
  logicalName: "activityparty",
  collectionName: "activityparties",
  primaryIdAttribute: "activitypartyid",
  attributeTypes: {
    // Numeric Types
    addressusedemailcolumnnumber: "Integer",
    effort: "Double",
    versionnumber: "BigInt",
    // Optionsets
    instancetypecode: "Optionset",
    participationtypemask: "Optionset",
    // Date Formats
    scheduledend: "DateOnly:UserLocal",
    scheduledstart: "DateOnly:UserLocal",
  },
  navigation: {
    resourcespecid: ["mscrm.resourcespec"],
    activityid: ["activitypointer"],
    partyid: ["account","bulkoperation","campaign","campaignactivity","contact","contract","entitlement","equipment","incident","invoice","knowledgearticle","lead","opportunity","queue","quote","salesorder","systemuser"],
  },
};

// Attribute constants
export const enum ActivityPartyAttributes {
  ActivityId = "activityid",
  ActivityPartyId = "activitypartyid",
  AddressUsed = "addressused",
  AddressUsedEmailColumnNumber = "addressusedemailcolumnnumber",
  DoNotEmail = "donotemail",
  DoNotFax = "donotfax",
  DoNotPhone = "donotphone",
  DoNotPostalMail = "donotpostalmail",
  Effort = "effort",
  ExchangeEntryId = "exchangeentryid",
  InstanceTypeCode = "instancetypecode",
  IsPartyDeleted = "ispartydeleted",
  OwnerId = "ownerid",
  OwnerIdType = "owneridtype",
  OwningBusinessUnit = "owningbusinessunit",
  OwningUser = "owninguser",
  ParticipationTypeMask = "participationtypemask",
  PartyId = "partyid",
  PartyIdName = "partyidname",
  PartyObjectTypeCode = "partyobjecttypecode",
  ResourceSpecId = "resourcespecid",
  ResourceSpecIdName = "resourcespecidname",
  ScheduledEnd = "scheduledend",
  ScheduledStart = "scheduledstart",
  VersionNumber = "versionnumber",
}

// Early Bound Interface
export interface ActivityParty extends IEntity {
  // Activity LookupType Unique identifier of the activity associated with the activity party. (A "party" is any person who is associated with an activity.)
  activityid?: import("dataverse-ify").EntityReference | null;
  // Activity Party UniqueidentifierType Unique identifier of the activity party.
  activitypartyid?: import("dataverse-ify").Guid | null;
  // Address  StringType Email address to which an email is delivered, and which is associated with the target entity.
  addressused?: string | null;
  // Email column number of party IntegerType Email address column number from associated party.
  addressusedemailcolumnnumber?: number | null;
  // Do not allow Emails BooleanType Information about whether to allow sending email to the activity party.
  donotemail?: boolean | null;
  // Do not allow Faxes BooleanType Information about whether to allow sending faxes to the activity party.
  donotfax?: boolean | null;
  // Do not allow Phone Calls BooleanType Information about whether to allow phone calls to the lead.
  donotphone?: boolean | null;
  // Do not allow Postal Mails BooleanType Information about whether to allow sending postal mail to the lead.
  donotpostalmail?: boolean | null;
  // Effort DoubleType Amount of effort used by the resource in a service appointment activity.
  effort?: number | null;
  // Exchange Entry StringType For internal use only.
  exchangeentryid?: string | null;
  // Appointment Type activityparty_activityparty_instancetypecode Type of instance of a recurring series.
  instancetypecode?: import("../enums/activityparty_activityparty_instancetypecode").activityparty_activityparty_instancetypecode | null;
  // Is Party Deleted BooleanType Information about whether the underlying entity record is deleted.
  ispartydeleted?: boolean | null;
  // Owner [Required] OwnerType Unique identifier of the user or team who owns the activity_party.
  ownerid?: import("dataverse-ify").EntityReference;
  //  EntityNameType
  owneridtype?: string | null;
  //  UniqueidentifierType
  owningbusinessunit?: import("dataverse-ify").Guid | null;
  //  UniqueidentifierType
  owninguser?: import("dataverse-ify").Guid | null;
  // Participation Type activityparty_activityparty_participationtypemask Role of the person in the activity, such as sender, to, cc, bcc, required, optional, organizer, regarding, or owner.
  participationtypemask?: import("../enums/activityparty_activityparty_participationtypemask").activityparty_activityparty_participationtypemask | null;
  // Party LookupType Unique identifier of the party associated with the activity.
  partyid?: import("dataverse-ify").EntityReference | null;
  //  StringType
  partyidname?: string | null;
  //  EntityNameType
  partyobjecttypecode?: string | null;
  // Resource Specification LookupType Unique identifier of the resource specification for the activity party.
  resourcespecid?: import("dataverse-ify").EntityReference | null;
  //  StringType
  resourcespecidname?: string | null;
  // Scheduled End DateTimeType Scheduled end time of the activity. DateOnly:UserLocal
  scheduledend?: Date | null;
  // Scheduled Start DateTimeType Scheduled start time of the activity. DateOnly:UserLocal
  scheduledstart?: Date | null;
  //  BigIntType
  versionnumber?: number | null;
}
