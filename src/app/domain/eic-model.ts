/* tslint:disable */
// Generated using typescript-generator version 2.6.433 on 2019-02-18 16:03:02.

export class Event implements Identifiable {
    id: string;
    instant: number;
    type: string;
    user: string;
    service: string;
    value: string;
}

export class Funder implements Identifiable {
    id: string;
    name: string;
    logo: URL;
    services: string[];
}

export interface Identifiable {
    id: string;
}

export class Indicator implements Identifiable {
    id: string;
    name: string;
    description: string;
    dimensions: string[];
    unit: string;
    unitName: string;
}

export class Service implements Identifiable {
    id: string;
    url: URL;
    name: string;
    tagline: string;
    description: string;
    options: string;
    targetUsers: string;
    userValue: string;
    userBase: string;
    symbol: URL;
    multimediaURL: URL;
    providers: string[];
    version: string;
    lastUpdate: XMLGregorianCalendar;
    changeLog: string;
    validFor: XMLGregorianCalendar;
    lifeCycleStatus: string;
    trl: string;
    category: string;
    subcategory: string;
    places: string[];
    languages: string[];
    tags: string[];
    requiredServices: string[];
    relatedServices: string[];
    order: URL;
    helpdesk: URL;
    userManual: URL;
    trainingInformation: URL;
    feedback: URL;
    price: URL;
    serviceLevelAgreement: URL;
    termsOfUse: string[];
    funding: string;
}

export class InfraService extends Service {
    serviceMetadata: ServiceMetadata;
    active: boolean;
    status: string;
    latest: boolean;
}

export class RangeValue {
    fromValue: string;
    toValue: string;
}

export class Measurement implements Identifiable {
    id: string;
    indicatorId: string;
    serviceId: string;
    time: XMLGregorianCalendar;
    locations: string[];
    valueIsRange: boolean;
    value: string;
    rangeValue: RangeValue;
}

export class Provider implements Identifiable {
    id: string;
    name: string;
    website: URL;
    catalogueOfResources: URL;
    publicDescOfResources: URL;
    logo: URL;
    additionalInfo: string;
    contactInformation: string;
    users: User[];
    active: boolean;
    status: string;
}

export class RichService extends Service {
    categoryName: string;
    subCategoryName: string;
    trlName: string;
    lifeCycleStatusName: string;
    languageNames: string[];
    placeNames: string[];
    views: number;
    ratings: number;
    userRate: number;
    hasRate: number;
    favourites: number;
    isFavourite: boolean;
}

export class ServiceMetadata {
    performanceData: Measurement[];
    featured: boolean;
    published: boolean;
    registeredBy: string;
    registeredAt: string;
    modifiedBy: string;
    modifiedAt: string;
}

export class ServiceHistory extends ServiceMetadata {
    version: string;
    versionChange: boolean;
}

export class User implements Identifiable {
    id: string;
    email: string;
    name: string;
    surname: string;
}

export class Vocabulary implements Identifiable {
  id: string;
  name: string;
  description: string;
  parentId: string;
  type: string;
  extras: { [index: string]: string };
}

export enum VocabularyType {
  SUPERCATEGORY = "SUPERCATEGORY",
  CATEGORY = "CATEGORY",
  SUBCATEGORY = "SUBCATEGORY",
  LANGUAGE = "LANGUAGE",
  PLACE = "PLACE",
  TRL = "TRL",
  PHASE = "PHASE",
  SCIENTIFIC_DOMAIN = "SCIENTIFIC_DOMAIN",
  SCIENTIFIC_SUBDOMAIN = "SCIENTIFIC_SUBDOMAIN",
  TARGET_USERS = "TARGET_USERS",
  ACCESS_TYPE = "ACCESS_TYPE",
  ACCESS_MODE = "ACCESS_MODE",
  FUNDED_BY = "FUNDED_BY",
  ORDER_TYPE = "ORDER_TYPE"
}

export class URL implements Serializable {
}

export class XMLGregorianCalendar implements Cloneable {
}

export class ExtrasMap {
    entries: Extras[];
}

export interface Serializable {
}

export interface Cloneable {
}

export class Extras {
    key: string;
    value: string;
}
