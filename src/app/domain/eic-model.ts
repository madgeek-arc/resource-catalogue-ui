/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 2.16.538 on 2019-11-04 13:38:53.

export class Bundle<T> implements Identifiable {
  id: string;
  metadata: Metadata;
  active: boolean;
  status: string;
}

export class Contact {
  firstName: string;
  lastName: string;
  email: string;
  tel: string;
  position: string;
}

export class EmailMessage {
  recipientEmail: string;
  senderEmail: string;
  senderName: string;
  subject: string;
  message: string;
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
  fundingOrganisation: string;
  organisationLocalLanguage: string;
  acronym: string;
  country: string;
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

export class InfraService extends Bundle<Service> {
  latest: boolean;
  service: Service;
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

export class Metadata {
  registeredBy: string;
  registeredAt: string;
  modifiedBy: string;
  modifiedAt: string;
  source: string;
  originalId: string;
}

export class Provider implements Identifiable {
  id: string;
  name: string;
  acronym: string;
  website: URL;
  description: string;
  logo: URL;
  multimedia: URL[];
  types: string[];
  categories: string[];
  esfriDomains: string[];
  tags: string[];
  lifeCycleStatus: string;
  location: ProviderLocation;
  coordinatingCountry: string;
  participatingCountries: string[];
  contacts: Contact[];
  hostingLegalEntity: string;
  legalStatus: string;
  esfri: string;
  networks: string[];
  areasOfActivity: string[];
  societalGrandChallenges: string[];
  nationalRoadmap: string;
  users: User[];
}

export class ProviderBundle extends Bundle<Provider> {
  provider: Provider;
}

export class ProviderLocation {
  name: string;
  street: string;
  number: string;
  postalCode: string;
  city: string;
  region: string;
}

export class ProviderRequest implements Identifiable {
  id: string;
  message: EmailMessage;
  date: XMLGregorianCalendar;
  providerId: string;
}

export class RangeValue {
  fromValue: string;
  toValue: string;
}

export class RichService {
  service: Service;
  metadata: Metadata;
  languageNames: string[];
  placeNames: string[];
  trlName: string;
  phaseName: string;
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
  categories: Category[];
  domains: ScientificDomain[];
  providerInfo: ProviderInfo[];
}

export class Service implements Identifiable {
  id: string;
  name: string;
  url: URL;
  description: string;
  logo: URL;
  multimediaUrls: URL[];
  tagline: string;
  userValue: string;
  userBaseList: string[];
  useCases: string[];
  options: ServiceOption[];
  endpoint: URL;
  providers: string[];
  scientificSubdomains: string[];
  subcategories: string[];
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
  userManual: URL;
  adminManual: URL;
  training: URL;
  helpdesk: URL;
  monitoring: URL;
  maintenance: URL;
  contacts: Contact[];
  requiredServices: string[];
  relatedServices: string[];
  relatedPlatforms: string[];
  aggregatedServices: number;
  publications: number;
  datasets: number;
  software: number;
  applications: number;
  otherProducts: number;
}

export class ServiceHistory extends Metadata {
  version: string;
  versionChange: boolean;
  coreVersionId: string;
}

export class ServiceOption {
  name: string;
  url: URL;
  description: string;
  logo: URL;
  contacts: Contact[];
  attributes: string[];
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

export class Category {
  superCategory: Vocabulary;
  category: Vocabulary;
  subCategory: Vocabulary;
}

export class MapValues {
  key: string;
  values: Value[];
}

export class PlaceCount {
  place: string;
  count: number;
}

export class ProviderInfo {
  providerId: string;
  providerName: string;
  providerAcronym: string;
}

export class ScientificDomain {
  domain: Vocabulary;
  subdomain: Vocabulary;
}

export class Value {
  id: string;
  name: string;
}

export class VocabularyTree {
  vocabulary: Vocabulary;
  children: VocabularyTree[];
}

export class XMLGregorianCalendar implements Cloneable {
}

export class URL implements Serializable {
}

export interface Cloneable {
}

export interface Serializable {
}

export const enum UserActionType {
  FAVOURITE = "FAVOURITE",
  RATING = "RATING",
}

export const enum DimensionType {
  TIME = "TIME",
  LOCATIONS = "LOCATIONS",
}

export const enum UnitType {
  PCT = "PCT",
  NUM = "NUM",
  BOOL = "BOOL",
}

export const enum States {
  PENDING_1 = "PENDING_1",
  ST_SUBMISSION = "ST_SUBMISSION",
  PENDING_2 = "PENDING_2",
  REJECTED_ST = "REJECTED_ST",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export const enum VocabularyType {
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
  ORDER_TYPE = "ORDER_TYPE",
  PROVIDER_AREA_OF_ACTIVITY = "PROVIDER_AREA_OF_ACTIVITY",
  PROVIDER_CATEGORY = "PROVIDER_CATEGORY",
  PROVIDER_DOMAIN = "PROVIDER_DOMAIN",
  PROVIDER_ESFRI = "PROVIDER_ESFRI",
  PROVIDER_ESFRI_DOMAIN = "PROVIDER_ESFRI_DOMAIN",
  PROVIDER_LEGAL_STATUS = "PROVIDER_LEGAL_STATUS",
  PROVIDER_LIFE_CYCLE_STATUS = "PROVIDER_LIFE_CYCLE_STATUS",
  PROVIDER_NETWORKS = "PROVIDER_NETWORKS",
  PROVIDER_SOCIETAL_GRAND_CHALLENGES = "PROVIDER_SOCIETAL_GRAND_CHALLENGES",
  PROVIDER_TYPE = "PROVIDER_TYPE",
}
