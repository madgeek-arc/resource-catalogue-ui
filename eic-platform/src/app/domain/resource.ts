/**
 * Created by stefania on 5/26/16.
 */
import {IndexedFields} from "./indexed-fields";

export class Resource {
    id: string;
    resourceType: string;
    version: string;
    payload: string;
    payloadUrl: string;
    payloadFormat: string;
    creationDate: Date;
    modificationDate: Date;
    indexedFields: IndexedFields[];
}