import { AccountAttributes } from "../dataverse-gen/entities/Account";

export class AccountForm {
  static async onload(context: Xrm.Events.EventContext): Promise<void> {
    context.getFormContext().getAttribute(AccountAttributes.WebSiteURL).addOnChange(AccountForm.onWebsiteChanged);
  }
  static onWebsiteChanged(context: Xrm.Events.EventContext): void {
    const formContext = context.getFormContext();
    const websiteAttribute = formContext.getAttribute(AccountAttributes.WebSiteURL);
    const websiteRegex = /^(https?:\/\/)?([\w\d]+\.)?[\w\d]+\.\w+\/?.+$/g;
    let isValid = true;
    if (websiteAttribute && websiteAttribute.getValue()) {
      const match = websiteAttribute.getValue().match(websiteRegex);
      isValid = match != null;
    }

    websiteAttribute.controls.forEach((c) => {
      if (isValid) {
        (c as Xrm.Controls.StringControl).clearNotification(AccountAttributes.WebSiteURL);
      } else {
        (c as Xrm.Controls.StringControl).setNotification("Invalid Website Address", AccountAttributes.WebSiteURL);
      }
    });
  }
}
