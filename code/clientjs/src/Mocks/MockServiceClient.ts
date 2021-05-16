/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CdsServiceClient,
  EntityCollection,
  EntityReference,
  Guid,
  IEntity,
  WebApiExecuteRequest,
} from "dataverse-ify";

export class MockServiceClient implements CdsServiceClient {
  create(entity: IEntity): Promise<string> {
    throw new Error("Method not implemented.");
  }
  update(entity: IEntity): Promise<void> {
    throw new Error("Method not implemented.");
  }
  delete(_entityName: string | IEntity, _id?: Guid): Promise<void> {
    throw new Error("Method not implemented.");
  }
  retrieve<T extends IEntity>(entityName: string, id: string, columnSet: boolean | string[]): Promise<T> {
    throw new Error("Method not implemented.");
  }
  retrieveMultiple<T extends IEntity>(fetchxml: string): Promise<EntityCollection<T>> {
    throw new Error("Method not implemented.");
  }
  associate(
    entityName: string,
    entityId: string,
    relationship: string,
    relatedEntities: Promise<EntityReference[]>,
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  disassociate(
    entityName: string,
    entityId: string,
    relationship: string,
    relatedEntities: EntityReference[],
  ): Promise<void> {
    throw new Error("Method not implemented.");
  }
  execute(request: WebApiExecuteRequest): Promise<unknown> {
    throw new Error("Method not implemented.");
  }
}
