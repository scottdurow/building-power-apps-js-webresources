# Part 6 - Calling the WebApi using dataverse-ify

This post is part of the series 'Scott's guide to building Power Apps JavaScript Web Resources using TypeScript'.

In this sixth part we will cover calling the `WebApi` with easy using `dataverse-ify`. You can find full details about how the `WepApi` works at https://docs.microsoft.com/en-us/powerapps/developer/model-driven-apps/clientapi/reference/xrm-webapi. 

`Dataverse-ify` is an open source library that aims to provide an interface to the Dataverse `WebApi` from TypeScript that works in a similar way to the C\# `IOrganisationService` so that you do not need to code around the complexities of the native `WebApi` syntax. See <https://github.com/scottdurow/dataverse-ify/wiki>

## Calling the `WebApi` using `CdsService`

Now that you have generated the early-bound types, you can:

-   easily call the `WebApi` without the hassle of understanding the complexity it’s type system

-   perform integration testing against dataverse from inside VSCode

We are going to create a Command Bar button to simply query all the opportunities regarding the account and then close each of them as Won.

Although `dataverse-ify` provides an implementation of `CdsService` - you don't need to use it but instead use the `Xrm.WebApi` functions in combination with `odataify` and `sdkify`. For more information on the `dataverse-ify` implementation of `CdsService` and it's alternatives, see https://github.com/scottdurow/dataverse-ify/wiki/Using-dataverse%E2%80%90ify-without-the-CdsServiceClient

### Add the Ribbon Script to the Exports

To your `src/index.ts` add:

```typescript
export * from "./Ribbon/AccountRibbon";
```

This will ensure that `AccountRibbon` class is available in the global scope along with the `AccountForm` class. If you don’t export the class, then it will only be accessible to internal code. This is a good way of ensuring you don’t overlap with any other libraries that are loaded.

### Add the `AccountRibbon.ts`

Add a file `Ribbon/AccountRibbon.ts`

```typescript
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

```

Note that we are exporting a class with static methods - if you preferred you could simply export functions. I find that classes are a convenient way of naming a module export when you want to group together related functionality that is called by a Model Driven App. Of course, in other places you will be using classes in the conventional way!

The first thing you might notice is there is an async function called `closeOpportunitiesInternal` that is called from a non-async function `closeOpporunities`. This is a common technique to provide an external function that accepts the parameters passed via the Ribbon (the `PrimaryControl` Form context in this case), and then an internal implementation that can be used in Unit Tests that accepts the services that are mockable. This is an alternative to a technique called `inversion of control`.

The key part of this code is:

```typescript
const serviceClient = new XrmContextCdsServiceClient(Xrm.WebApi);
```

This is creating an instance of `dataverse-ify's` service client that isolates you from the complexity of the WebApi and provides a very similar API to the C# SDK `IOrganizationService`.

Before you can use it however, you must make a call to:

```typescript
 setMetadataCache(metadataCache);
```

This adds the additional information about the early-bound types generated earlier using dataverse-gen. For more info - see https://github.com/scottdurow/dataverse-ify/wiki/Why-generate-metadata%3F

Notice that we have a simple interface for `WinOpportunityRequest` that provides the necessarily information - greatly simplifying the different ways that the `WebApi` accepts parameters and types. If you were creating activities, you will also find that the `dataverse-ify` types simplify other complex areas such as `activity parties`.

## Adding Unit Tests

Update `package.json` with integration and unit tests

```json
"scripts": {
    "build": "webpack --config webpack.dev.js",
    "start": "webpack --config webpack.dev.js --watch",
    "dist": "webpack --config webpack.prod.js",
    "test": "jest unit.",
    "integrationtests": "jest integration."
  },
```

This allows us to run integration tests separately from unit tests since they are very different in nature.

### Create Mock `ServiceClient`

One of the principles of unit testing is that we only want to exercise the code we want to test. For this reason, we mock other code units so that we can control the behaviour and monitor calls.

The `dataverse-ify` `CdsServiceClient` is an interface that can be implemented in order to add mock implementations using jest.

Add a new file `src/Mocks/MockServiceClient.ts`

To this file, add the code found at:<https://github.com/scottdurow/dataverse-jswebresource-template/blob/master/src/Mocks/MockCdsServiceClient.ts>

You can see that this class does nothing other than implement the `CdsServiceClient` interface. Later we will use jest to add mock implementations and expectations. Code such as this that is used only by our unit tests will not be exported or included in the webpack bundle created for our JavaScript webresource.

### Add the AccountRibbon Unit tests

Add a new file `src\Ribbon\__tests__\unit.AccountRibbon.test.ts`

To this file add the code:

```typescript
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
```

The key part of this test is that it first arranges the mock implementations needed.  `beforeEach` is run before each `it()` test and calls `xrm-mock` to create a mock `Xrm` context in a similar way to when we were testing the `AccountForm` code.

We also mock the calls to Navigation methods. The following will simulate the user clicking OK on the confirmation dialog.

```typescript
Xrm.Navigation.openConfirmDialog = jest.fn().mockReturnValue({ confirmed: true } as Xrm.Navigation.ConfirmResult);
```

Because we are calling the `WebApi.retrieveMultiple` and `WebApi.execute`, we also have to mock these functions. The `retreiveMultiple` call simulates a single opportunity being returned.

```typescript
mockServiceClient.retrieveMultiple = jest.fn().mockImplementation(() => {
      return new EntityCollection([
        {
          logicalName: opportunityMetadata.logicalName,
          opportunityid: "111",
          name: "AAA",
        } as Opportunity,
      ]);
    });
```

The execute call is simply a jest mock function that allows us to assert that the right calls were made.

```typescript
mockServiceClient.execute = jest.fn();
```

### Expectations

Once we have called the `AccountRibbon.closeOpportunitiesInternal` we can call the expectations to ensure that the execute method was called with the correct arguments:

```typescript
expect(mockServiceClient.execute).toHaveBeenCalledWith(
    expect.objectContaining({
      Status: opportunity_opportunity_statuscode.Won,
      OpportunityClose: expect.objectContaining({
        logicalName: opportunitycloseMetadata.logicalName,
        opportunityid: new EntityReference(opportunityMetadata.logicalName, "111"),
      } as OpportunityClose),
    } as WinOpportunityRequest),
  );
```

You can run your unit tests in the same way we did in Part 3, either by pressing F5 with the unit test file open, or at the command line:

```shell
jest unit.AccountRibbon
```

## Adding Integration Tests 

Unit tests will enable you to quickly ensure that your code is functioning as expected - however the one unknown is how Dataverse will behave when calling the `WebApi`. Mocking assumes that it returns what you are expected, however an integration test will ensure it functions according to those expectations and can be a very effective way of ensure your code covers all scenarios and edge-cases. The principle of an integration test is that it should create the data necessary to run the test, and then delete it afterwards so that it leaves no footprint.

### Calling Dataverse from inside VSCode

`dataverse-ify` contains an implementation of the `WebApi` that allows you to use the `Xrm.WebApi` API from inside your VSCode integration tests running locally without debugging inside the browser. This can reduce the amount of time it takes to develop and debug your code.

Inside your VSCode project, add an file `config\test.yaml`

```yaml
nodewebapi:
 logging: verbose
 server:
  host: https://org.crm.dynamics.com
  version: 9.1
```

Replace `org.crm.dynamics.com` with the URL of your environment.

### Add Integration Test

Now we have configured connectivity to our Dataverse environment, we can create a integration test similar to our unit test, however this one will actually communicate with the server.

Add a new file `src\Ribbon\__tests__\integration.AccountRibbon.test.ts`

```typescript
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

```

> **Note** The 100000 at the end of the test code is the timeout in milliseconds that we allow for the test to run.

### SetupGlobalContext

The key part to our integration test is the call to `await SetupGlobalContext();`This is a function that is imported via `import { SetupGlobalContext } from "dataverse-ify/lib/webapi"` and is responsible for replacing the `Xrm.WebApi` implementation locally to point to an implementation that uses the `config/test.yaml` file and call the corresponding Dataverse environment. You don't need to be using `Dataverse-ify's` `CdsService` to use this - it works for normal `Xrm.WebApi` calls. 

> **Note:** `SetupGlobalContext` only ever needs to be called inside your unit tests, however `setMetadataCache` will need to be called before you make calls to `dataverse-ify` even in your web resource code.

### Asserting integration test results

In our integration tests, we can easily query dataverse to check that the necessary operations have been carried out. This is similar to the mock exceptions we added to our unit tests earlier. These expectations use the `serviceClient` in a similar way to the code we are testing does!

```typescript
const closedOp = await serviceClient.retrieve<Opportunity>(opportunityMetadata.logicalName, opportunity1.id, [
        OpportunityAttributes.StateCode,
        OpportunityAttributes.StatusCode,
      ]);
expect(closedOp.statecode).toBe(opportunity_opportunity_statecode.Won);
```

## Running Integration tests

Once you have written your integration tests, you can debug using F5 (with the test open) in the same way that you did for the unit tests. This has the advantage that you can check how your code works against your dataverse environment without continuously setting up records in the user interface. Once your integration tests work inside jest, you should have a high degree of confidence that the code will work once deployed to the Model Driven App!

Once you have debugged your tests, you can run them all using:

```shell
jest interation
```

## Next Up

Now that we've created some fairly complex JavaScript logic and tested it (unit and integration) we are ready to deploy and test inside our Model Driven App.

