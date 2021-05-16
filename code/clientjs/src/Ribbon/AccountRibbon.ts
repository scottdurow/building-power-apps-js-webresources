/* eslint-disable camelcase */
import {
  CdsServiceClient,
  EntityCollection,
  EntityReference,
  setMetadataCache,
  XrmContextCdsServiceClient,
} from "dataverse-ify";
import { WinOpportunityMetadata, WinOpportunityRequest } from "../dataverse-gen/actions/WinOpportunity";
import { Opportunity } from "../dataverse-gen/entities/Opportunity";
import { opportunitycloseMetadata } from "../dataverse-gen/entities/OpportunityClose";
import { opportunity_opportunity_statuscode } from "../dataverse-gen/enums/opportunity_opportunity_statuscode";
import { metadataCache } from "../dataverse-gen/metadata";

export class AccountRibbon {
  static closeOpporunities2(context: Xrm.FormContext): void {
    const serviceClient = new XrmContextCdsServiceClient(Xrm.WebApi);
    Promise.resolve(AccountRibbon.closeOpportunitiesInternal(serviceClient, context.data.entity.getId()));
  }
  static async closeOpporunities(context: Xrm.FormContext): Promise<void> {
    const serviceClient = new XrmContextCdsServiceClient(Xrm.WebApi);
    await AccountRibbon.closeOpportunitiesInternal(serviceClient, context.data.entity.getId());
  }
  static async closeOpportunitiesInternal(serviceClient: CdsServiceClient, accountid: string): Promise<void> {
    setMetadataCache(metadataCache);
    // Get a list of all open opportunities
    const openOps = await serviceClient.retrieveMultiple<Opportunity>(`<fetch top="10" >
    <entity name="opportunity" >
      <attribute name="opportunityid" />
      <attribute name="name" />
      <filter>
        <condition attribute="customerid" operator="eq" value="${accountid}" />
        <condition attribute="statecode" operator="eq" value="0" />
      </filter>
    </entity>
  </fetch>`);
    if (openOps.entities.length == 0) {
      await Xrm.Navigation.openAlertDialog({ text: `There are no open opportunties!` });
      return;
    }
    const result = await Xrm.Navigation.openConfirmDialog({
      title: "Close All Open Opportunities?",
      text: `Are you sure you want to close the ${openOps.entities.length} open opportunities?`,
    });
    if (!result.confirmed) return;

    try {
      // For each Opportunity, Close as Won
      const opportunityCount = await AccountRibbon.closeOpportunities(openOps, serviceClient);
      Xrm.Utility.closeProgressIndicator();
      await Xrm.Navigation.openAlertDialog({ title: "Success", text: `${opportunityCount} Opportunities closed` });
    } catch (ex) {
      Xrm.Utility.closeProgressIndicator();
      Xrm.Navigation.openErrorDialog({
        details: ex,
        message: `Could not close opportunites:\n${ex.message}\n`,
      });
    }
  }

  private static async closeOpportunities(openOps: EntityCollection<Opportunity>, serviceClient: CdsServiceClient) {
    let opportunityCount = 0;
    for (const openOpportunity of openOps.entities) {
      opportunityCount++;
      Xrm.Utility.showProgressIndicator(
        `Closing Opportunity ${opportunityCount} of ${openOps.entities.length} - '${openOpportunity.name}', Please Wait...`,
      );
      const winRequest = {
        logicalName: WinOpportunityMetadata.operationName,
        Status: opportunity_opportunity_statuscode.Won,
        OpportunityClose: {
          logicalName: opportunitycloseMetadata.logicalName,
          subject: "Opportunity Won",
          opportunityid: new EntityReference(openOpportunity.logicalName, openOpportunity.opportunityid),
        },
      } as WinOpportunityRequest;
      await serviceClient.execute(winRequest);
    }
    return opportunityCount;
  }
}
