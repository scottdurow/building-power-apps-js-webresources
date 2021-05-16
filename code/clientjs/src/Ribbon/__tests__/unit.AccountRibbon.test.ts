/* eslint-disable camelcase */
import { EntityCollection, EntityReference } from "dataverse-ify";
import { XrmMockGenerator } from "xrm-mock";
import { WinOpportunityRequest } from "../../dataverse-gen/actions/WinOpportunity";
import { Opportunity, opportunityMetadata } from "../../dataverse-gen/entities/Opportunity";
import { OpportunityClose, opportunitycloseMetadata } from "../../dataverse-gen/entities/OpportunityClose";
import { opportunity_opportunity_statuscode } from "../../dataverse-gen/enums/opportunity_opportunity_statuscode";
import { MockServiceClient } from "../../Mocks/MockServiceClient";
import { AccountRibbon } from "../AccountRibbon";

describe("AccountRibbon", () => {
  beforeEach(() => {
    XrmMockGenerator.initialise();
    Xrm.Utility.showProgressIndicator = jest.fn();
    Xrm.Utility.closeProgressIndicator = jest.fn();
    Xrm.Navigation.openAlertDialog = jest.fn();
    Xrm.Navigation.openErrorDialog = jest.fn().mockImplementation((ex) => console.debug(JSON.stringify(ex)));
  });

  it("closes open opportunities", async () => {
    // Arrange
    const mockServiceClient = new MockServiceClient();

    mockServiceClient.retrieveMultiple = jest.fn().mockImplementation(() => {
      return new EntityCollection([
        {
          logicalName: opportunityMetadata.logicalName,
          opportunityid: "111",
          name: "AAA",
        } as Opportunity,
      ]);
    });
    mockServiceClient.execute = jest.fn();
    Xrm.Navigation.openConfirmDialog = jest.fn().mockReturnValue({ confirmed: true } as Xrm.Navigation.ConfirmResult);

    // Act
    await AccountRibbon.closeOpportunitiesInternal(mockServiceClient, "222");

    // Assert
    expect(Xrm.Navigation.openErrorDialog).toHaveBeenCalledTimes(0);
    expect(mockServiceClient.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        Status: opportunity_opportunity_statuscode.Won,
        OpportunityClose: expect.objectContaining({
          logicalName: opportunitycloseMetadata.logicalName,
          opportunityid: new EntityReference(opportunityMetadata.logicalName, "111"),
        } as OpportunityClose),
      } as WinOpportunityRequest),
    );
  });
});
