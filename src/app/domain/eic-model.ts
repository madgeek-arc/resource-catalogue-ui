/* tslint:disable */
// Generated using typescript-generator version 2.6.433 on 2019-07-15 15:25:21.

export interface Identifiable {
    id: string;
}

export class Event implements Identifiable {
  id: string;
  instant: number;
  type: string;
  user: string;
  service: string;
  value: string;
}

export class ExtrasMapType {
  entry: ExtrasType[];
}

export class XmlAdapter<ValueType, BoundType> {
}

export class ExtrasMapTypeAdapter extends XmlAdapter<ExtrasMapType, { [index: string]: string }> {
}

export class ExtrasType {
  key: string;
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
  name: string;
  url: URL;
  description: string;
  logo: URL;
  tagline: string;
  userValue: string;
  userBases: string[];
  useCases: string[];
  multimediaUrls: URL[];
  options: string[];
  requiredServices: string[];
  relatedServices: string[];
  providers: string[];
  scientificDomains: string[];
  scientificSubdomains: string[];
  category: string;
  subcategories: string[];
  supercategory: string;
  targetUsers: string[];
  languages: string[];
  places: string[];
  accessTypes: string[];
  accessModes: string[];
  funders: string[];
  tags: string[];
  phase: string;
  trl: string;
  version: string;
  lastUpdate: XMLGregorianCalendar;
  changeLog: string;
  certifications: string[];
  standards: string[];
  orderType: string;
  order: URL;
  sla: URL;
  termsOfUse: URL;
  privacyPolicy: URL;
  accessPolicy: URL;
  paymentModel: URL;
  pricing: URL;
  manual: URL;
  training: URL;
  helpdesk: URL;
  monitoring: URL;
  maintenance: URL;
  ownerName: string;
  ownerContact: string;
  supportName: string;
  supportContact: string;
  securityName: string;
  securityContact: string;
}

export class InfraService extends Service {
  serviceMetadata: ServiceMetadata;
  active: boolean;
  status: string;
  latest: boolean;
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
  description: string;
  logo: URL;
  contactName: string;
  contactEmail: string;
  contactTel: string;
  active: boolean;
  status: string;
  users: User[];
}

export class RangeValue {
  fromValue: string;
  toValue: string;
}

export class RichService {
  service: Service;
  serviceMetadata: ServiceMetadata;
  superCategoryName: string;
  categoryName: string;
  subCategoryNames: string[];
  languageNames: string[];
  placeNames: string[];
  trlName: string;
  phaseName: string;
  scientificDomainNames: string[];
  scientificSubDomainNames: string[];
  targetUsersNames: string[];
  accessTypeNames: string[];
  accessModeNames: string[];
  fundedByNames: string[];
  orderTypeName: string;
  views: number;
  ratings: number;
  userRate: number;
  hasRate: number;
  favourites: number;
  isFavourite: boolean;
}

export class ServiceMetadata {
  registeredBy: string;
  registeredAt: string;
  modifiedBy: string;
  modifiedAt: string;
}

export class ServiceHistory extends ServiceMetadata {
  version: string;
  versionChange: boolean;
  coreVersionId: string;
}

export class ServiceOption implements Identifiable {
  id: string;
  name: string;
  url: URL;
  description: string;
  logo: URL;
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

export interface Serializable {
}

export interface Cloneable {
}
