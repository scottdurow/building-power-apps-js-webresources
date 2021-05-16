/* eslint-disable*/
import { WebApiExecuteRequest } from "dataverse-ify";
import { StructuralProperty } from "dataverse-ify";
import { OperationType } from "dataverse-ify";

// Action WinOpportunity
export const WinOpportunityMetadata = {
  parameterTypes: {
    "OpportunityClose": {
      typeName: "mscrm.opportunityclose",
      structuralProperty: StructuralProperty.EntityType
      },		
      "Caller": {
      typeName: "Edm.String",
      structuralProperty: StructuralProperty.PrimitiveType
      },		
      "Status": {
      typeName: "Edm.Int32",
      structuralProperty: StructuralProperty.PrimitiveType
      },		
  
  },
  operationType: OperationType.Action,
  operationName: "WinOpportunity"
};

export interface WinOpportunityRequest extends WebApiExecuteRequest {
  OpportunityClose?: import("dataverse-ify").EntityReference | import("../entities/OpportunityClose").OpportunityClose;
  Caller?: string;
  Status?: number;
}