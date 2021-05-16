/* eslint-disable*/
import { IEntity } from "dataverse-ify";
// Entity Email
export const emailMetadata = {
  typeName: "mscrm.email",
  logicalName: "email",
  collectionName: "emails",
  primaryIdAttribute: "activityid",
  attributeTypes: {
    // Numeric Types
    actualdurationminutes: "Integer",
    attachmentcount: "Integer",
    attachmentopencount: "Integer",
    baseconversationindexhash: "Integer",
    deliveryattempts: "Integer",
    exchangerate: "Decimal",
    importsequencenumber: "Integer",
    isunsafe: "Integer",
    linksclickedcount: "Integer",
    onholdtime: "Integer",
    opencount: "Integer",
    replycount: "Integer",
    scheduleddurationminutes: "Integer",
    timezoneruleversionnumber: "Integer",
    utcconversiontimezonecode: "Integer",
    versionnumber: "BigInt",
    // Optionsets
    correlationmethod: "Optionset",
    deliveryprioritycode: "Optionset",
    emailreminderstatus: "Optionset",
    emailremindertype: "Optionset",
    notifications: "Optionset",
    prioritycode: "Optionset",
    statecode: "Optionset",
    statuscode: "Optionset",
    // Date Formats
    actualend: "DateOnly:UserLocal",
    actualstart: "DateOnly:UserLocal",
    createdon: "DateAndTime:UserLocal",
    delayedemailsendtime: "DateAndTime:UserLocal",
    emailreminderexpirytime: "DateAndTime:UserLocal",
    lastonholdtime: "DateAndTime:UserLocal",
    lastopenedtime: "DateAndTime:UserLocal",
    modifiedon: "DateAndTime:UserLocal",
    overriddencreatedon: "DateOnly:UserLocal",
    postponeemailprocessinguntil: "DateAndTime:UserLocal",
    scheduledend: "DateAndTime:UserLocal",
    scheduledstart: "DateAndTime:UserLocal",
    senton: "DateAndTime:UserLocal",
    sortdate: "DateAndTime:UserLocal",
  },
  navigation: {
    templateid: ["mscrm.template"],
    stageid_processstage: ["mscrm.processstage"],
    sla_email_sla: ["mscrm.sla"],
    sendersaccount: ["mscrm.account"],
    parentactivityid: ["mscrm.email"],
    ownerid_email: ["mscrm.principal"],
    activityid_activitypointer: ["mscrm.activitypointer"],
    acceptingentityid: ["mscrm.queue"],
    ReceivingMailboxId_Email: ["mscrm.mailbox"],
    CorrelatedActivityId_Email: ["mscrm.email"],
    createdby: ["systemuser"],
    createdonbehalfby: ["systemuser"],
    emailsender: ["account","contact","equipment","lead","queue","systemuser"],
    modifiedby: ["systemuser"],
    modifiedonbehalfby: ["systemuser"],
    owningbusinessunit: ["businessunit"],
    owningteam: ["team"],
    owninguser: ["systemuser"],
    regardingobjectid: ["account","asyncoperation","bookableresourcebooking","bookableresourcebookingheader","bulkoperation","campaign","campaignactivity","contact","contract","entitlement","entitlementtemplate","incident","invoice","knowledgearticle","knowledgebaserecord","lead","msdyn_agreement","msdyn_agreementbookingdate","msdyn_agreementbookingincident","msdyn_agreementbookingproduct","msdyn_agreementbookingservice","msdyn_agreementbookingservicetask","msdyn_agreementbookingsetup","msdyn_agreementinvoicedate","msdyn_agreementinvoiceproduct","msdyn_agreementinvoicesetup","msdyn_bookingalertstatus","msdyn_bookingrule","msdyn_bookingtimestamp","msdyn_customerasset","msdyn_fieldservicesetting","msdyn_incidenttypecharacteristic","msdyn_incidenttypeproduct","msdyn_incidenttypeservice","msdyn_inventoryadjustment","msdyn_inventoryadjustmentproduct","msdyn_inventoryjournal","msdyn_inventorytransfer","msdyn_payment","msdyn_paymentdetail","msdyn_paymentmethod","msdyn_paymentterm","msdyn_playbookinstance","msdyn_postalbum","msdyn_postalcode","msdyn_processnotes","msdyn_productinventory","msdyn_projectteam","msdyn_purchaseorder","msdyn_purchaseorderbill","msdyn_purchaseorderproduct","msdyn_purchaseorderreceipt","msdyn_purchaseorderreceiptproduct","msdyn_purchaseordersubstatus","msdyn_quotebookingincident","msdyn_quotebookingproduct","msdyn_quotebookingservice","msdyn_quotebookingservicetask","msdyn_resourceterritory","msdyn_rma","msdyn_rmaproduct","msdyn_rmareceipt","msdyn_rmareceiptproduct","msdyn_rmasubstatus","msdyn_rtv","msdyn_rtvproduct","msdyn_rtvsubstatus","msdyn_shipvia","msdyn_systemuserschedulersetting","msdyn_timegroup","msdyn_timegroupdetail","msdyn_timeoffrequest","msdyn_warehouse","msdyn_workorder","msdyn_workordercharacteristic","msdyn_workorderincident","msdyn_workorderproduct","msdyn_workorderresourcerestriction","msdyn_workorderservice","msdyn_workorderservicetask","opportunity","quote","salesorder","site"],
    sendermailboxid: ["mailbox"],
    serviceid: ["service"],
    slainvokedid: ["sla"],
    transactioncurrencyid: ["transactioncurrency"],
  },
};

// Attribute constants
export const enum EmailAttributes {
  AcceptingEntityId = "acceptingentityid",
  AcceptingEntityIdName = "acceptingentityidname",
  AcceptingEntityTypeCode = "acceptingentitytypecode",
  ActivityAdditionalParams = "activityadditionalparams",
  ActivityId = "activityid",
  ActivityTypeCode = "activitytypecode",
  ActualDurationMinutes = "actualdurationminutes",
  ActualEnd = "actualend",
  ActualStart = "actualstart",
  AttachmentCount = "attachmentcount",
  AttachmentOpenCount = "attachmentopencount",
  BaseConversationIndexHash = "baseconversationindexhash",
  bcc = "bcc",
  Category = "category",
  cc = "cc",
  Compressed = "compressed",
  ConversationIndex = "conversationindex",
  ConversationTrackingId = "conversationtrackingid",
  CorrelatedActivityId = "correlatedactivityid",
  CorrelatedActivityIdName = "correlatedactivityidname",
  CorrelationMethod = "correlationmethod",
  CreatedBy = "createdby",
  CreatedByName = "createdbyname",
  CreatedByYomiName = "createdbyyominame",
  CreatedOn = "createdon",
  CreatedOnBehalfBy = "createdonbehalfby",
  CreatedOnBehalfByName = "createdonbehalfbyname",
  CreatedOnBehalfByYomiName = "createdonbehalfbyyominame",
  DelayedEmailSendTime = "delayedemailsendtime",
  DeliveryAttempts = "deliveryattempts",
  DeliveryPriorityCode = "deliveryprioritycode",
  DeliveryReceiptRequested = "deliveryreceiptrequested",
  Description = "description",
  DirectionCode = "directioncode",
  EmailReminderExpiryTime = "emailreminderexpirytime",
  EmailReminderStatus = "emailreminderstatus",
  EmailReminderText = "emailremindertext",
  EmailReminderType = "emailremindertype",
  EmailSender = "emailsender",
  EmailSenderName = "emailsendername",
  EmailSenderObjectTypeCode = "emailsenderobjecttypecode",
  EmailSenderYomiName = "emailsenderyominame",
  EmailTrackingId = "emailtrackingid",
  ExchangeRate = "exchangerate",
  FollowEmailUserPreference = "followemailuserpreference",
  from = "from",
  ImportSequenceNumber = "importsequencenumber",
  InReplyTo = "inreplyto",
  IsBilled = "isbilled",
  IsEmailFollowed = "isemailfollowed",
  IsEmailReminderSet = "isemailreminderset",
  IsRegularActivity = "isregularactivity",
  IsUnsafe = "isunsafe",
  IsWorkflowCreated = "isworkflowcreated",
  LastOnHoldTime = "lastonholdtime",
  LastOpenedTime = "lastopenedtime",
  LinksClickedCount = "linksclickedcount",
  MessageId = "messageid",
  MessageIdDupCheck = "messageiddupcheck",
  MimeType = "mimetype",
  ModifiedBy = "modifiedby",
  ModifiedByName = "modifiedbyname",
  ModifiedByYomiName = "modifiedbyyominame",
  ModifiedOn = "modifiedon",
  ModifiedOnBehalfBy = "modifiedonbehalfby",
  ModifiedOnBehalfByName = "modifiedonbehalfbyname",
  ModifiedOnBehalfByYomiName = "modifiedonbehalfbyyominame",
  Notifications = "notifications",
  OnHoldTime = "onholdtime",
  OpenCount = "opencount",
  OverriddenCreatedOn = "overriddencreatedon",
  OwnerId = "ownerid",
  OwnerIdName = "owneridname",
  OwnerIdType = "owneridtype",
  OwnerIdYomiName = "owneridyominame",
  OwningBusinessUnit = "owningbusinessunit",
  OwningTeam = "owningteam",
  OwningUser = "owninguser",
  ParentActivityId = "parentactivityid",
  ParentActivityIdName = "parentactivityidname",
  PostponeEmailProcessingUntil = "postponeemailprocessinguntil",
  PriorityCode = "prioritycode",
  ProcessId = "processid",
  ReadReceiptRequested = "readreceiptrequested",
  ReceivingMailboxId = "receivingmailboxid",
  ReceivingMailboxIdName = "receivingmailboxidname",
  RegardingObjectId = "regardingobjectid",
  RegardingObjectIdName = "regardingobjectidname",
  RegardingObjectIdYomiName = "regardingobjectidyominame",
  RegardingObjectTypeCode = "regardingobjecttypecode",
  ReminderActionCardId = "reminderactioncardid",
  ReplyCount = "replycount",
  ReservedForInternalUse = "reservedforinternaluse",
  SafeDescription = "safedescription",
  ScheduledDurationMinutes = "scheduleddurationminutes",
  ScheduledEnd = "scheduledend",
  ScheduledStart = "scheduledstart",
  Sender = "sender",
  SenderMailboxId = "sendermailboxid",
  SenderMailboxIdName = "sendermailboxidname",
  SendersAccount = "sendersaccount",
  SendersAccountName = "sendersaccountname",
  SendersAccountObjectTypeCode = "sendersaccountobjecttypecode",
  SendersAccountYomiName = "sendersaccountyominame",
  SentOn = "senton",
  ServiceId = "serviceid",
  ServiceIdName = "serviceidname",
  SLAId = "slaid",
  SLAInvokedId = "slainvokedid",
  SLAInvokedIdName = "slainvokedidname",
  SLAName = "slaname",
  SortDate = "sortdate",
  StageId = "stageid",
  StateCode = "statecode",
  StatusCode = "statuscode",
  Subcategory = "subcategory",
  Subject = "subject",
  SubmittedBy = "submittedby",
  TemplateId = "templateid",
  TemplateIdName = "templateidname",
  TimeZoneRuleVersionNumber = "timezoneruleversionnumber",
  to = "to",
  ToRecipients = "torecipients",
  TrackingToken = "trackingtoken",
  TransactionCurrencyId = "transactioncurrencyid",
  TransactionCurrencyIdName = "transactioncurrencyidname",
  TraversedPath = "traversedpath",
  UTCConversionTimeZoneCode = "utcconversiontimezonecode",
  VersionNumber = "versionnumber",
}

// Early Bound Interface
export interface Email extends IEntity {
  // Accepting Entity LookupType The Entity that Accepted the Email
  acceptingentityid?: import("dataverse-ify").EntityReference | null;
  // Accepting Entity Name StringType Accepting Entity Name
  acceptingentityidname?: string | null;
  // Accepting User Or Queue Object Type EntityNameType Accepting Entity Object Type.
  acceptingentitytypecode?: string | null;
  // Additional Parameters MemoType For internal use only.
  activityadditionalparams?: string | null;
  // Email Message UniqueidentifierType Unique identifier of the email activity.
  activityid?: import("dataverse-ify").Guid | null;
  // Activity Type EntityNameType Shows the type of activity.
  activitytypecode?: string | null;
  // Duration IntegerType Type the number of minutes spent creating and sending the email. The duration is used in reporting.
  actualdurationminutes?: number | null;
  // Actual End DateTimeType Enter the actual end date and time of the email. By default, it displays the date and time when the activity was completed or canceled, but can be edited to capture the actual time to create and send the email. DateOnly:UserLocal
  actualend?: Date | null;
  // Actual Start DateTimeType Enter the actual start date and time for the email. By default, it displays the date and time when the activity was created, but can be edited to capture the actual time to create and send the email. DateOnly:UserLocal
  actualstart?: Date | null;
  // Attachment Count IntegerType Shows the umber of attachments of the email message.
  attachmentcount?: number | null;
  // Attachment Open Count IntegerType Shows the number of times an email attachment has been viewed.
  attachmentopencount?: number | null;
  // Conversation Index (Hash) IntegerType Hash of base of conversation index.
  baseconversationindexhash?: number | null;
  // Bcc PartyListType Enter the recipients that are included on the email distribution, but are not displayed to other recipients.
  bcc?: import("dataverse-ify").ActivityParty[] | null;
  // Category StringType Type a category to identify the email type, such as lead outreach, customer follow-up, or service alert, to tie the email to a business group or function.
  category?: string | null;
  // Cc PartyListType Enter the recipients that should be copied on the email.
  cc?: import("dataverse-ify").ActivityParty[] | null;
  // Compression BooleanType Indicates if the body is compressed.
  compressed?: boolean | null;
  // Conversation Index StringType Identifier for all the email responses for this conversation.
  conversationindex?: string | null;
  // Conversation Tracking Id UniqueidentifierType Conversation Tracking Id.
  conversationtrackingid?: import("dataverse-ify").Guid | null;
  // Correlated Activity Id LookupType Correlated Activity Id
  correlatedactivityid?: import("dataverse-ify").EntityReference | null;
  //  StringType
  correlatedactivityidname?: string | null;
  // Correlation Method email_email_correlationmethod Shows how an email is matched to an existing email in Microsoft Dynamics 365. For system use only.
  correlationmethod?: import("../enums/email_email_correlationmethod").email_email_correlationmethod | null;
  // Created By LookupType Shows who created the record.
  createdby?: import("dataverse-ify").EntityReference | null;
  //  StringType
  createdbyname?: string | null;
  //  StringType
  createdbyyominame?: string | null;
  // Created On DateTimeType Shows the date and time when the record was created. The date and time are displayed in the time zone selected in Microsoft Dynamics 365 options. DateAndTime:UserLocal
  createdon?: Date | null;
  // Created By (Delegate) LookupType Shows who created the record on behalf of another user.
  createdonbehalfby?: import("dataverse-ify").EntityReference | null;
  //  StringType
  createdonbehalfbyname?: string | null;
  //  StringType
  createdonbehalfbyyominame?: string | null;
  // Send Later DateTimeType Enter the expected date and time when email will be sent. DateAndTime:UserLocal
  delayedemailsendtime?: Date | null;
  // No. of Delivery Attempts IntegerType Shows the count of the number of attempts made to send the email. The count is used as an indicator of email routing issues.
  deliveryattempts?: number | null;
  // Delivery Priority activitypointer_deliveryprioritycode Select the priority of delivery of the email to the email server.
  deliveryprioritycode?: import("../enums/activitypointer_deliveryprioritycode").activitypointer_deliveryprioritycode | null;
  // Delivery Receipt Requested BooleanType Select whether the sender should receive confirmation that the email was delivered.
  deliveryreceiptrequested?: boolean | null;
  // Description MemoType Type the greeting and message text of the email.
  description?: string | null;
  // Direction BooleanType Select the direction of the email as incoming or outbound.
  directioncode?: boolean | null;
  // Email Reminder Expiry Time DateTimeType Shows the date and time when an email reminder expires. DateAndTime:UserLocal
  emailreminderexpirytime?: Date | null;
  // Email Reminder Status email_email_reminderstatus Shows the status of the email reminder.
  emailreminderstatus?: import("../enums/email_email_reminderstatus").email_email_reminderstatus | null;
  // Email Reminder Text StringType For internal use only.
  emailremindertext?: string | null;
  // Email Reminder Type email_email_remindertype Shows the type of the email reminder.
  emailremindertype?: import("../enums/email_email_remindertype").email_email_remindertype | null;
  // Sender LookupType Shows the sender of the email.
  emailsender?: import("dataverse-ify").EntityReference | null;
  // Email Sender Name StringType Shows the name of the sender of the email.
  emailsendername?: string | null;
  // Email Sender Type EntityNameType Shows the object type of sender of the email.
  emailsenderobjecttypecode?: string | null;
  // Email Sender yomi Name StringType Shows the yomi name of the email sender
  emailsenderyominame?: string | null;
  // Email Tracking Id UniqueidentifierType Email Tracking Id.
  emailtrackingid?: import("dataverse-ify").Guid | null;
  // Exchange Rate DecimalType Shows the conversion rate of the record's currency. The exchange rate is used to convert all money fields in the record from the local currency to the system's default currency.
  exchangerate?: number | null;
  // Following BooleanType Select whether the email allows following recipient activities sent from Microsoft Dynamics 365.This is user preference state which can be overridden by system evaluated state.
  followemailuserpreference?: boolean | null;
  // From PartyListType Enter the sender of the email.
  from?: import("dataverse-ify").ActivityParty[] | null;
  // Import Sequence Number IntegerType Unique identifier of the data import or data migration that created this record.
  importsequencenumber?: number | null;
  // In Reply To Message StringType Type the ID of the email message that this email activity is a response to.
  inreplyto?: string | null;
  // Is Billed BooleanType Information regarding whether the email activity was billed as part of resolving a case.
  isbilled?: boolean | null;
  // Followed BooleanType For internal use only. Shows whether this email is followed. This is evaluated state which overrides user selection of follow email.
  isemailfollowed?: boolean | null;
  // Reminder Set BooleanType For internal use only. Shows whether this email Reminder is Set.
  isemailreminderset?: boolean | null;
  // Is Regular Activity BooleanType Information regarding whether the activity is a regular activity type or event type.
  isregularactivity?: boolean | null;
  // IsUnsafe IntegerType For internal use only.
  isunsafe?: number | null;
  // Is Workflow Created BooleanType Indication if the email was created by a workflow rule.
  isworkflowcreated?: boolean | null;
  // Last On Hold Time DateTimeType Contains the date and time stamp of the last on hold time. DateAndTime:UserLocal
  lastonholdtime?: Date | null;
  // Last Opened Time DateTimeType Shows the latest date and time when email was opened. DateAndTime:UserLocal
  lastopenedtime?: Date | null;
  // Links Clicked Count IntegerType Shows the number of times a link in an email has been clicked.
  linksclickedcount?: number | null;
  // Message ID StringType Unique identifier of the email message. Used only for email that is received.
  messageid?: string | null;
  // Message ID Dup Check UniqueidentifierType For internal use only.
  messageiddupcheck?: import("dataverse-ify").Guid | null;
  // Mime Type StringType MIME type of the email message data.
  mimetype?: string | null;
  // Modified By LookupType Shows who last updated the record.
  modifiedby?: import("dataverse-ify").EntityReference | null;
  //  StringType
  modifiedbyname?: string | null;
  //  StringType
  modifiedbyyominame?: string | null;
  // Modified On DateTimeType Shows the date and time when the record was last updated. The date and time are displayed in the time zone selected in Microsoft Dynamics 365 options. DateAndTime:UserLocal
  modifiedon?: Date | null;
  // Modified By (Delegate) LookupType Shows who last updated the record on behalf of another user.
  modifiedonbehalfby?: import("dataverse-ify").EntityReference | null;
  //  StringType
  modifiedonbehalfbyname?: string | null;
  //  StringType
  modifiedonbehalfbyyominame?: string | null;
  // Notifications email_email_notifications Select the notification code to identify issues with the email recipients or attachments, such as blocked attachments.
  notifications?: import("../enums/email_email_notifications").email_email_notifications | null;
  // On Hold Time (Minutes) IntegerType Shows how long, in minutes, that the record was on hold.
  onholdtime?: number | null;
  // Open Count IntegerType Shows the number of times an email has been opened.
  opencount?: number | null;
  // Record Created On DateTimeType Date and time that the record was migrated. DateOnly:UserLocal
  overriddencreatedon?: Date | null;
  // Owner OwnerType Enter the user or team who is assigned to manage the record. This field is updated every time the record is assigned to a different user.
  ownerid?: import("dataverse-ify").EntityReference | null;
  //  StringType
  owneridname?: string | null;
  //  EntityNameType
  owneridtype?: string | null;
  //  StringType
  owneridyominame?: string | null;
  // Owning Business Unit LookupType Unique identifier of the business unit that owns the email activity.
  owningbusinessunit?: import("dataverse-ify").EntityReference | null;
  // Owning Team LookupType Unique identifier of the team who owns the email activity.
  owningteam?: import("dataverse-ify").EntityReference | null;
  // Owning User LookupType Unique identifier of the user who owns the email activity.
  owninguser?: import("dataverse-ify").EntityReference | null;
  // Parent Activity Id LookupType Select the activity that the email is associated with.
  parentactivityid?: import("dataverse-ify").EntityReference | null;
  // Parent Activity Name StringType Parent Activity Name
  parentactivityidname?: string | null;
  // Delay email processing until DateTimeType For internal use only. DateAndTime:UserLocal
  postponeemailprocessinguntil?: Date | null;
  // Priority email_email_prioritycode Select the priority so that preferred customers or critical issues are handled quickly.
  prioritycode?: import("../enums/email_email_prioritycode").email_email_prioritycode | null;
  // Process UniqueidentifierType Shows the ID of the process.
  processid?: import("dataverse-ify").Guid | null;
  // Read Receipt Requested BooleanType Indicates that a read receipt is requested.
  readreceiptrequested?: boolean | null;
  // Receiving Mailbox LookupType The Mailbox that Received the Email.
  receivingmailboxid?: import("dataverse-ify").EntityReference | null;
  //  StringType
  receivingmailboxidname?: string | null;
  // Regarding LookupType Choose the record that the email relates to.
  regardingobjectid?: import("dataverse-ify").EntityReference | null;
  //  StringType
  regardingobjectidname?: string | null;
  //  StringType
  regardingobjectidyominame?: string | null;
  //  EntityNameType
  regardingobjecttypecode?: string | null;
  // Reminder Action Card Id. UniqueidentifierType Reminder Action Card Id.
  reminderactioncardid?: import("dataverse-ify").Guid | null;
  // Reply Count IntegerType Shows the number of replies received for an email.
  replycount?: number | null;
  // Reserved for internal use MemoType For internal use only
  reservedforinternaluse?: string | null;
  // Safe Description MemoType Safe body text of the e-mail.
  safedescription?: string | null;
  // Scheduled Duration IntegerType Scheduled duration of the email activity, specified in minutes.
  scheduleddurationminutes?: number | null;
  // Due Date DateTimeType Enter the expected due date and time for the activity to be completed to provide details about when the email will be sent. DateAndTime:UserLocal
  scheduledend?: Date | null;
  // Start Date DateTimeType Enter the expected start date and time for the activity to provide details about the tentative time when the email activity must be initiated. DateAndTime:UserLocal
  scheduledstart?: Date | null;
  // From StringType Sender of the email.
  sender?: string | null;
  // Sender's Mailbox LookupType Select the mailbox associated with the sender of the email message.
  sendermailboxid?: import("dataverse-ify").EntityReference | null;
  //  StringType
  sendermailboxidname?: string | null;
  // Senders Account LookupType Shows the parent account of the sender of the email.
  sendersaccount?: import("dataverse-ify").EntityReference | null;
  // Email Sender Account Name StringType Shows the name of the sender account of the email.
  sendersaccountname?: string | null;
  //  SendersAccount Type EntityNameType Shows the parent account type code of the sender of the email.
  sendersaccountobjecttypecode?: string | null;
  // Email Sender Account yomi Name StringType Shows the name of the sender account yomi name 
  sendersaccountyominame?: string | null;
  // Date Sent DateTimeType Shows the date and time that the email was sent. DateAndTime:UserLocal
  senton?: Date | null;
  // Service LookupType Unique identifier for the associated service.
  serviceid?: import("dataverse-ify").EntityReference | null;
  //  StringType
  serviceidname?: string | null;
  // SLA LookupType Choose the service level agreement (SLA) that you want to apply to the email record.
  slaid?: import("dataverse-ify").EntityReference | null;
  // Last SLA applied LookupType Last SLA that was applied to this email. This field is for internal use only.
  slainvokedid?: import("dataverse-ify").EntityReference | null;
  //  StringType
  slainvokedidname?: string | null;
  //  StringType
  slaname?: string | null;
  // Sort Date DateTimeType Shows the date and time by which the activities are sorted. DateAndTime:UserLocal
  sortdate?: Date | null;
  // (Deprecated) Process Stage UniqueidentifierType Shows the ID of the stage.
  stageid?: import("dataverse-ify").Guid | null;
  // Activity Status email_email_statecode Shows whether the email is open, completed, or canceled. Completed and canceled email is read-only and can't be edited.
  statecode?: import("../enums/email_email_statecode").email_email_statecode | null;
  // Status Reason email_email_statuscode Select the email's status.
  statuscode?: import("../enums/email_email_statuscode").email_email_statuscode | null;
  // Sub-Category StringType Type a subcategory to identify the email type and relate the activity to a specific product, sales region, business group, or other function.
  subcategory?: string | null;
  // Subject StringType Type a short description about the objective or primary topic of the email.
  subject?: string | null;
  // Submitted By StringType Shows the Microsoft Office Outlook account for the user who submitted the email to Microsoft Dynamics 365.
  submittedby?: string | null;
  // ID for template used. LookupType For internal use only. ID for template used in email.
  templateid?: import("dataverse-ify").EntityReference | null;
  //  StringType
  templateidname?: string | null;
  // Time Zone Rule Version Number IntegerType For internal use only.
  timezoneruleversionnumber?: number | null;
  // To PartyListType Enter the account, contact, lead, queue, or user recipients for the email.
  to?: import("dataverse-ify").ActivityParty[] | null;
  // To Recipients StringType Shows the email addresses corresponding to the recipients.
  torecipients?: string | null;
  // Tracking Token StringType Shows the tracking token assigned to the email to make sure responses are automatically tracked in Microsoft Dynamics 365.
  trackingtoken?: string | null;
  // Currency LookupType Choose the local currency for the record to make sure budgets are reported in the correct currency.
  transactioncurrencyid?: import("dataverse-ify").EntityReference | null;
  //  StringType
  transactioncurrencyidname?: string | null;
  // (Deprecated) Traversed Path StringType For internal use only.
  traversedpath?: string | null;
  // UTC Conversion Time Zone Code IntegerType Time zone code that was in use when the record was created.
  utcconversiontimezonecode?: number | null;
  // Version Number BigIntType Version number of the email message.
  versionnumber?: number | null;
}
