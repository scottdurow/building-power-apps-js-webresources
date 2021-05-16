/* eslint-disable camelcase */
import { XrmMockGenerator } from "xrm-mock";
import { SetupGlobalContext } from "dataverse-ify/lib/webapi";
import { Opportunity, OpportunityAttributes, opportunityMetadata } from "../../dataverse-gen/entities/Opportunity";
import { Account, accountMetadata } from "../../dataverse-gen/entities/Account";
import { Entity, setMetadataCache, XrmContextCdsServiceClient } from "dataverse-ify";
import { AccountRibbon } from "../AccountRibbon";
import { opportunity_opportunity_statecode } from "../../dataverse-gen/enums/opportunity_opportunity_statecode";
import { metadataCache } from "../../dataverse-gen/metadata";
describe("AccountRibbon", () => {
  beforeEach(async () => {
    XrmMockGenerator.initialise();
    await SetupGlobalContext();
    setMetadataCache(metadataCache);
    Xrm.Utility.showProgressIndicator = jest.fn();
    Xrm.Utility.closeProgressIndicator = jest.fn();
    Xrm.Navigation.openAlertDialog = jest.fn();
    Xrm.Navigation.openErrorDialog = jest.fn().mockImplementation((ex) => console.debug(JSON.stringify(ex)));
    Xrm.Navigation.openConfirmDialog = jest.fn().mockReturnValue({ confirmed: true } as Xrm.Navigation.ConfirmResult);
  });

  it("closes open opportunities", async () => {
    // Arrange
    const serviceClient = new XrmContextCdsServiceClient(Xrm.WebApi);

    const opportunity1 = {
      logicalName: opportunityMetadata.logicalName,
      name: "Opportunity Integration Test",
    } as Opportunity;

    const account1 = {
      logicalName: accountMetadata.logicalName,
      name: "Account Integration Test",
    } as Account;

    // Act
    try {
      account1.id = await serviceClient.create(account1);
      opportunity1.customerid = Entity.toEntityReference(account1);
      opportunity1.id = await serviceClient.create(opportunity1);

      await AccountRibbon.closeOpportunitiesInternal(serviceClient, account1.id);

      // Assert
      // Check that the opportunity is closed
      const closedOp = await serviceClient.retrieve<Opportunity>(opportunityMetadata.logicalName, opportunity1.id, [
        OpportunityAttributes.StateCode,
        OpportunityAttributes.StatusCode,
      ]);
      expect(closedOp.statecode).toBe(opportunity_opportunity_statecode.Won);
    } catch (ex) {
      fail(ex);
    } finally {
      // Tidy up
      if (opportunity1.id) await serviceClient.delete(opportunity1);
      if (account1.id) await serviceClient.delete(account1);
    }
  }, 100000);
});
