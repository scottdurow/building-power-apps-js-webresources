# Part 5 - Early bound types using Dataverse-ify

This post is part of the series 'Scott's guide to building Power Apps JavaScript Web Resources using TypeScript'.

In this fifth part we will cover creating a early bound types so that you can call the reference attribute names in form scripts and call the `WebApi` with ease. 

`Dataverse-ify` is an open source library that aims to provide an interface to the Dataverse `WebApi` from TypeScript that works in a similar way to the C\# `IOrganisationService` so that you do not need to code around the complexities of the native `WebApi` syntax.

**Design Goals**

-   Implement an API for use from TypeScript that is close to `IOrganizationService` for use in Model-Driven Form JS Web-Resources or PCF controls.

-   Cross-Platform - pure NodeJS - runs inside VSCode on Windows/Mac/Linux

-   Early bound generation of Entities/Actions/Functions with customizable templates.

-   Be as unopinionated as possible - but still promote TypeScript best practices.

-   Allow integration testing from inside VSCode/NodeJS tests.

See <https://github.com/scottdurow/dataverse-ify/wiki>

## Adding `dataverse-ify` to your JavaScript Webresource TypeScript Project

### Authenticate against your environment

`Dataverse-ify` uses a authentication token that is encrypted and stored on your machine using a library called `dataverse-auth`.

At your VSCode command line run:

```shell
npx dataverse-auth myorg.crm.dynamics.com
```

Replace `myorg.crm.dyanmics.com` with the URL of your tenant (without the `https://`)

You will be prompted to login - if you have MFA enabled you will also need to provide the necessary details.

Once you have logged in, a authentication token will be saved and you should not need to login again unless it expires (usually 90 days) or is invalidated (e.g. by your administrator making changes)

### Installing `Dataverse-ify`

To use the `WebApi` using early-bound types you will need to install the `dataverse-ify` library using the following at your VSCode command line:

```shell
npm install dataverse-ify --save
```

#### Generating early-bound types

To initialise your early-bound type generation, use the following at the VSCode command line:

```shell
npx dataverse-gen init
```

You will be asked to select from the environments you have authenticated against (if you have more than one).

Select the Entities that you wish to generate types for. In this example we will select account, `opportunity`, `email` & `activityparty`<img src="media/Part 5 - Earlybound Types and the WebApi/a577fec6dc0cef026a376e47808783fb.png" style="zoom:50%;" />

Next you will be prompted to select the actions you wish to generate types for, we will select `WinOpportunity`. You can also select from any custom actions or custom APIs you have created.
<img src="media/Part 5 - Earlybound Types and the WebApi/02a54b090272a722073f769cc3e96466.png" style="zoom:50%;" />

Lastly you are asked to select any functions – we will not select any just yet.

You are then prompted if you want to generate the types. Select Yes 
<img src="media/d00ae9a1bdcd9741a805cb7f4cdb3cc1.png" style="zoom:50%;" />

In the root of your project you should now see a file called `.dataverse-gen.json` that looks like this:

```json
{
  "entities": [
    "account",
    "activityparty",
    "email",
    "opportunity"
  ],
  "actions": [
    "WinOpportunity"
  ],
  "functions": [],
  "output": {
    "outputRoot": "./src/dataverse-gen"
  }
}
```

There will also be a new folder called dataverse-gen under your src folder. This will contain the early-bound types and attribute constants.
<img src="media/df10f5ab8582f9ffcb51b388e7fdda7e.png" style="zoom:50%;" />

We can now update our `AccountForm.ts` with the attribute name constants `AccountAttributes.WebSiteURL`

```typescript
static async onload(context: Xrm.Events.EventContext): Promise<void> {
    context.getFormContext().getAttribute(AccountAttributes.WebSiteURL).addOnChange(AccountForm.onWebsiteChanged);
}
```

VSCode should automatically import the `AccountAttributes` for you:

```typescript
import { AccountAttributes } from "../dataverse-gen/entities/Account";
```

Using this approach will result in less errors due to logical name inconsistencies. Additionally, if any attributes are deleted that are referenced by your code, when you re-run the dataverse-gen you will see build errors.

You can re-generate the types at any time using:

```shell
npx dataverse-gen
```

If you want to add to the metadata added, you can simply re-run:

```shell
npx dataverse-gen init
```

or you can simply edit the `.dataverse-gen.json` file and run `npx dataverse-gen`

## Next Up

Now that we've created early bound types, we will use `dataverse-ify` to call the `Xrm WebApi` with ease!

