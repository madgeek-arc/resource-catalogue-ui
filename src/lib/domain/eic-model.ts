/* tslint:disable */
/* eslint-disable */
// Generated using typescript-generator version 2.16.538 on 2020-06-10 11:50:49.

export class Bundle<T> implements Identifiable {
  id: string;
  metadata: Metadata;
  active: boolean;
  status: string;
  templateStatus: string;
  suspended: boolean;
  identifiers: Identifiers;
  loggingInfo: LoggingInfo[];
  latestAuditInfo: LoggingInfo;
  latestOnboardingInfo: LoggingInfo;
  latestUpdateInfo: LoggingInfo;
}

export class Catalogue implements Identifiable {
  id: string;
  abbreviation: string;
  name: string;
  website: URL;
  legalEntity: boolean;
  legalStatus: string;
  hostingLegalEntity: string;
  inclusionCriteria: URL;
  validationProcess: URL;
  endOfLife: string;
  description: string;
  scope: string;
  logo: URL;
  multimedia: Multimedia[];
  scientificDomains: ServiceProviderDomain[];
  // scientificSubdomains: string[];
  tags: string[];
  location: ProviderLocation;
  mainContact: ProviderMainContact;
  publicContacts: ProviderPublicContact[];
  participatingCountries: string[];
  affiliations: string[];
  networks: string[];
  users: User[];
}

export class ConfigurationTemplate implements Identifiable {
  id: string;
  interoperabilityRecordId: string;
  name: string;
  catalogueId: string;
  node: string;
  description: string;
  formModel: { [index: string]: any };
}

export class ConfigurationTemplateInstance implements Identifiable {
  id: string;
  resourceId: string;
  configurationTemplateId: string;
  catalogueId: string;
  node: string;
  payload: string; //payload: { [index: string]: any };
}

export class EmailMessage {
  recipientEmail: string;
  senderEmail: string;
  senderName: string;
  subject: string;
  message: string;
}

export class EOSCIFGuidelines {
  label: string;
  pid: string;
  semanticRelationship: string;
  url: string;
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

export class XmlAdapter<ValueType, BoundType> {}

export class ExtrasMapTypeAdapter extends XmlAdapter<
  ExtrasMapType,
  { [index: string]: string }
> {}

export class ExtrasType {
  key: string;
  value: string;
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

export class Identifiers {
  originalId: string;
}

export class AlternativeIdentifier {
  type: string;
  value: string;
}

export class ServiceBundle extends Bundle<Service> {
  service: Service;
  resourceExtras: ResourceExtras;
}

export class DatasourceBundle extends Bundle<Datasource> {
  datasource: Datasource;
  originalOpenAIREId: string;
}

export class TrainingResourceBundle extends Bundle<TrainingResource> {
  trainingResource: TrainingResource;
}

export class DeployableServiceBundle extends Bundle<DeployableService> {
  status: string;
  auditState: string;
  deployableService: DeployableService;
}

export class LoggingInfo {
  date: string;
  userEmail: string;
  userFullName: string;
  userRole: string;
  type: string;
  comment: string;
  actionType: string;
}

export class Metadata {
  registeredBy: string;
  registeredAt: string;
  modifiedBy: string;
  modifiedAt: string;
  source: string;
  originalId: string;
}

export class ResourceInteroperabilityRecord implements Identifiable {
  id: string;
  resourceId: string;
  catalogueId: string;
  interoperabilityRecordIds: string[];
}

export class MonitoringStatus {
  date: string;
  availability: string;
  reliability: string;
  unknown: string;
  uptime: string;
  downtime: string;
  timestamp: string;
  value: string;
}

export class Monitoring {
  id: string;
  serviceId: string; //should change to generic resourceId
  monitoredBy: string;
  monitoringGroups: MonitoringGroup[];
}

export class Helpdesk {
  id: string;
  serviceId: string; //should change to generic resourceId
  helpdeskType: string;
  services: string[];
  supportGroups: string[];
  organisation: string;
  emails: string[];
  emailForTicket: string[];
  agents: string[];
  signatures: string[];
  webform: boolean;
  ticketPreservation: boolean;
}

export class MonitoringBundle extends Bundle<Monitoring> {
  monitoring: Monitoring;
}

export class HelpdeskBundle extends Bundle<Helpdesk> {
  helpdesk: Helpdesk;
}

export class AdapterBundle extends Bundle<Adapter> {
  status: string;
  adapter: Adapter;
}

export class Adapter implements Identifiable {
  id: string;
  name: string;
  node: string;
  catalogueId: string;
  description: string;
  linkedResource: LinkedResource;
  tagline: string;
  logo: string;
  documentation: URL;
  repository: URL;
  releases: URL[];
  programmingLanguage: string;
  license: string;
  version: string;
  changeLog: string;
  lastUpdate: Date;
  admins: User[];
}

export class LinkedResource {
  type: string;
  id: string;
}

export class Provider implements Identifiable {
  id: string;
  abbreviation: string;
  name: string;
  website: URL;
  legalEntity: boolean;
  legalStatus: string;
  hostingLegalEntity: string;
  alternativeIdentifiers: AlternativeIdentifier[];
  description: string;
  logo: URL;
  multimedia: Multimedia[];
  scientificDomains: ServiceProviderDomain[];
  // scientificSubdomains: string[];
  tags: string[];
  location: ProviderLocation;
  mainContact: ProviderMainContact;
  publicContacts: ProviderPublicContact[];
  lifeCycleStatus: string;
  certifications: string[];
  participatingCountries: string[];
  affiliations: string[];
  networks: string[];
  catalogueId: string;
  structureTypes: string[];
  esfriDomains: string[];
  esfriType: string;
  merilScientificDomains: ProviderMerilDomain[]; // anchor
  // merilScientificSubdomains: string[];
  areasOfActivity: string[];
  societalGrandChallenges: string[];
  nationalRoadmaps: string[];
  users: User[];
}

export class ProviderBundle extends Bundle<Provider> {
  provider: Provider;
}

export class CatalogueBundle extends Bundle<Catalogue> {
  catalogue: Catalogue;
}

export class ProviderLocation {
  streetNameAndNumber: string;
  postalCode: string;
  city: string;
  region: string;
  country: string;
}

export class ProviderMainContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
}

export class ProviderPublicContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
}

export class ProviderRequest implements Identifiable {
  id: string;
  message: EmailMessage;
  date: string;
  providerId: string;
  read: boolean;
}

export class RichService {
  service: Service;
  metadata: Metadata;
  languageAvailabilityNames: string[];
  geographicAvailabilityNames: string[];
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
  isFavourite: number;
  categories: Category[];
  domains: ScientificDomain[];
  providerInfo: ProviderInfo[];
}

export class ServiceProviderDomain {
  scientificDomain: string;
  scientificSubdomain: string;
}

export class ProviderMerilDomain {
  merilScientificDomain: string;
  merilScientificSubdomain: string;
}

export class ServiceCategory {
  category: string;
  subcategory: string;
}

/*export class Service implements Identifiable {
  id: string;
  name: string;
  resourceOrganisation: string;
  resourceProviders: string[];
  webpage: URL;
  alternativeIdentifiers: AlternativeIdentifier[];
  description: string;
  logo: URL;
  scientificDomains: ServiceProviderDomain[];
  categories: ServiceCategory[];
  tags: string[];
  trl: string;
  catalogueId: string;
  termsOfUse: URL;
  privacyPolicy: URL;
  accessPolicy: URL;
  orderType: string;
  order: URL;
  paymentModel: URL;
  pricing: URL;

  version: string;
}*/

export class Service implements Identifiable {
  id: string;
  abbreviation: string;
  name: string;
  resourceOrganisation: string;
  resourceProviders: string[];
  webpage: URL;
  alternativeIdentifiers: AlternativeIdentifier[];
  description: string;
  tagline: string;
  logo: URL;
  multimedia: Multimedia[];
  useCases: UseCase[];
  scientificDomains: ServiceProviderDomain[];
  categories: ServiceCategory[]; // anchor
  targetUsers: string[];
  accessTypes: string[];
  accessModes: string[];
  tags: string[];
  horizontalService: boolean;
  serviceCategories: string[];
  marketplaceLocations: string[];
  geographicalAvailabilities: string[];
  languageAvailabilities: string[];
  resourceGeographicLocations: string[];
  mainContact: ServiceMainContact;
  publicContacts: ServicePublicContact[];
  helpdeskEmail: string;
  securityContactEmail: string;
  trl: string;
  lifeCycleStatus: string;
  certifications: string[];
  standards: string[];
  openSourceTechnologies: string[];
  version: string;
  lastUpdate: XMLGregorianCalendar;
  changeLog: string[];
  requiredResources: string[];
  relatedResources: string[];
  relatedPlatforms: string[];
  catalogueId: string;
  fundingBody: string[];
  fundingPrograms: string[];
  grantProjectNames: string[];
  helpdeskPage: URL;
  userManual: URL;
  termsOfUse: URL;
  privacyPolicy: URL;
  accessPolicy: URL;
  serviceLevel: URL;
  trainingInformation: URL;
  statusMonitoring: URL;
  maintenance: URL;
  orderType: string;
  order: URL;
  paymentModel: URL;
  pricing: URL;
}

export class DeployableService implements Identifiable {
  id: string;
  name: string;
  acronym: string;
  resourceOrganisation: string;
  catalogueId: string;
  node: string;
  url: URL;
  scientificDomains: ServiceProviderDomain[];
  tags: string[];
  creators: Creator[];
  description: string;
  tagline: string;
  logo: URL;
  version: string;
  lastUpdate: Date;
  softwareLicense: string;
}

export class Datasource implements Identifiable {
  id: string;
  serviceId: string;
  catalogueId: string;
  submissionPolicyURL: URL;
  preservationPolicyURL: URL;
  versionControl: boolean;
  persistentIdentitySystems: PersistentIdentitySystem[];
  jurisdiction: string;
  datasourceClassification: string;
  researchEntityTypes: string[];
  thematic: boolean;
  researchProductLicensings: ResearchProductLicensing[];
  researchProductAccessPolicies: string[];
  researchProductMetadataLicensing: ResearchProductMetadataLicensing;
  researchProductMetadataAccessPolicies: string[];
  harvestable: boolean;
}

export class PersistentIdentitySystem {
  persistentIdentityEntityType: string;
  persistentIdentityEntityTypeSchemes: string[];
}
export class ResearchProductLicensing {
  researchProductLicenseName: string;
  researchProductLicenseURL: string;
}
export class ResearchProductMetadataLicensing {
  researchProductMetadataLicenseName: string;
  researchProductMetadataLicenseURL: string;
}

export class TrainingResource implements Identifiable {
  id: string;
  title: string;
  resourceOrganisation: string; // like service
  resourceProviders: string[]; // like service
  authors: string[];
  url: URL;
  urlType: string; // new voc
  eoscRelatedServices: string[];
  alternativeIdentifiers: AlternativeIdentifier[];
  description: string;
  keywords: string[];
  license: string;
  accessRights: string; // new voc (1 oxi polla)
  versionDate: Date;
  targetGroups: string[];
  learningResourceTypes: string[]; // new voc
  learningOutcomes: string[];
  expertiseLevel: string; // new voc
  contentResourceTypes: string[]; // new voc
  qualifications: string[];
  duration: string;
  languages: string[]; // like service
  geographicalAvailabilities: string[]; // like service
  scientificDomains: ServiceProviderDomain[]; // like service
  contact: ServiceMainContact; // like service
  catalogueId: string;
}

export class ResourceExtras {
  eoscIFGuidelines: EOSCIFGuidelines[];
  serviceType: string;
}

export class InteroperabilityRecordBundle extends Bundle<InteroperabilityRecord> {
  status: string;
  interoperabilityRecord: InteroperabilityRecord;
}

export class InteroperabilityRecord implements Identifiable {
  id: string;
  catalogueId: string;
  providerId: string;
  identifierInfo: IdentifierInfo; //like location
  creators: Creator[]; //like location
  title: string;
  publicationYear: number;
  resourceTypesInfo: ResourceTypeInfo[]; //title~scientific domain
  created: string;
  updated: string;
  relatedStandards: RelatedStandard[];
  rights: Right[]; //like use cases
  description: string;
  status: string;
  domain: string;
  eoscGuidelineType: string;
  eoscIntegrationOptions: string[];
  alternativeIdentifiers: AlternativeIdentifier[];
}

export class IdentifierInfo {
  identifier: string;
  identifierType: string;
}

export class Creator {
  creatorNameTypeInfo: CreatorNameTypeInfo;
  givenName: string;
  familyName: string;
  nameIdentifier: string;
  creatorAffiliationInfo: CreatorAffiliationInfo;
}

export class CreatorNameTypeInfo {
  creatorName: string;
  nameType: string;
}

export class CreatorAffiliationInfo {
  affiliation: string;
  affiliationIdentifier: string;
}

export class ResourceTypeInfo {
  resourceType: string;
  resourceTypeGeneral: string;
}

export class RelatedStandard {
  relatedStandardIdentifier: string;
  relatedStandardURI: URL;
}

export class Right {
  rightTitle: string;
  rightURI: URL;
  rightIdentifier: string;
}

export class ServiceHistory extends Metadata {
  version: string;
  versionChange: boolean;
  coreVersionId: string;
}

export class ServiceMainContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  organisation: string;
}

export class ServicePublicContact {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  organisation: string;
}

export class UseCase {
  useCaseURL: string;
  useCaseName: string;
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

export class VocabularyEntryRequest {
  userId: string;
  resourceId: string;
  providerId: string;
  dateOfRequest: string;
  resourceType: string;
}

export class VocabularyCuration implements Identifiable {
  vocabularyEntryRequests: VocabularyEntryRequest[];
  id: string;
  entryValueName: string;
  vocabulary: string;
  parent: string;
  status: string;
  rejectionReason: string;
  resolutionDate: string;
  resolutionUser: string;
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

export class Metric {
  probe: URL;
  metric: URL;
}

export class MonitoringGroup {
  serviceType: string;
  endpoint: string;
  metrics: Metric[]; //hidden and unused
}

export class Multimedia {
  multimediaURL: string;
  multimediaName: string;
}

export class PlaceCount {
  place: string;
  count: number;
}

export class OpenAIREMetrics {
  pageViews: number;
  totalDownloads: number;
  totalOpenaireDownloads: number;
  totalViews: number;
  totalOpenaireViews: number;
}

export class PiwikInfo {
  // provide
  repositoryId: string;
  openaireId: string;
  repositoryName: string;
  country: string;
  siteId: string;
  authenticationToken: string;
  creationDate: Date;
  requestorName: string;
  requestorEmail: string;
  validated: boolean;
  validationDate: Date;
  comment: string;
}

export class ProviderInfo {
  providerId: string;
  providerName: string;
  providerAbbreviation: string;
  resourceOrganisation: boolean;
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

export class XMLGregorianCalendar implements Cloneable {}

export class URL implements Serializable {}

export interface Cloneable {}

export interface Serializable {}

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

export const enum Type {
  SUPERCATEGORY = "SUPERCATEGORY",
  CATEGORY = "CATEGORY",
  SUBCATEGORY = "SUBCATEGORY",
  LANGUAGE = "LANGUAGE",
  COUNTRY = "COUNTRY",
  REGION = "REGION",
  TRL = "TRL",
  SCIENTIFIC_DOMAIN = "SCIENTIFIC_DOMAIN",
  SCIENTIFIC_SUBDOMAIN = "SCIENTIFIC_SUBDOMAIN",
  TARGET_USER = "TARGET_USER",
  ACCESS_TYPE = "ACCESS_TYPE",
  ACCESS_MODE = "ACCESS_MODE",
  ORDER_TYPE = "ORDER_TYPE",
  FUNDING_BODY = "FUNDING_BODY",
  FUNDING_PROGRAM = "FUNDING_PROGRAM",
  RELATED_PLATFORM = "RELATED_PLATFORM",
  LIFE_CYCLE_STATUS = "LIFE_CYCLE_STATUS",
  PROVIDER_AREA_OF_ACTIVITY = "PROVIDER_AREA_OF_ACTIVITY",
  PROVIDER_ESFRI_TYPE = "PROVIDER_ESFRI_TYPE",
  PROVIDER_ESFRI_DOMAIN = "PROVIDER_ESFRI_DOMAIN",
  PROVIDER_LEGAL_STATUS = "PROVIDER_LEGAL_STATUS",
  PROVIDER_LIFE_CYCLE_STATUS = "PROVIDER_LIFE_CYCLE_STATUS",
  PROVIDER_NETWORK = "PROVIDER_NETWORK",
  PROVIDER_SOCIETAL_GRAND_CHALLENGE = "PROVIDER_SOCIETAL_GRAND_CHALLENGE",
  PROVIDER_HOSTING_LEGAL_ENTITY = "PROVIDER_HOSTING_LEGAL_ENTITY",
  PROVIDER_STRUCTURE_TYPE = "PROVIDER_STRUCTURE_TYPE",
  PROVIDER_MERIL_SCIENTIFIC_DOMAIN = "PROVIDER_MERIL_SCIENTIFIC_DOMAIN",
  PROVIDER_MERIL_SCIENTIFIC_SUBDOMAIN = "PROVIDER_MERIL_SCIENTIFIC_SUBDOMAIN",
  DS_JURISDICTION = "DS_JURISDICTION",
  DS_CLASSIFICATION = "DS_CLASSIFICATION",
  DS_RESEARCH_ENTITY_TYPE = "DS_RESEARCH_ENTITY_TYPE",
  DS_PERSISTENT_IDENTITY_SCHEME = "DS_PERSISTENT_IDENTITY_SCHEME",
  DS_COAR_ACCESS_RIGHTS_1_0 = "DS_COAR_ACCESS_RIGHTS_1_0",
  MONITORING_MONITORED_BY = "MONITORING_MONITORED_BY",
  MONITORING_SERVICE_TYPE = "MONITORING_SERVICE_TYPE",
  IR_NAME_TYPE = "IR_NAME_TYPE",
  IR_STATUS = "IR_STATUS",
  IR_RESOURCE_TYPE_GENERAL = "IR_RESOURCE_TYPE_GENERAL",
  IR_EOSC_GUIDELINE_TYPE = "IR_EOSC_GUIDELINE_TYPE",
  IR_IDENTIFIER_TYPE = "IR_IDENTIFIER_TYPE",
  TR_ACCESS_RIGHT = "TR_ACCESS_RIGHT",
  TR_CONTENT_RESOURCE_TYPE = "TR_CONTENT_RESOURCE_TYPE",
  TR_DCMI_TYPE = "TR_DCMI_TYPE",
  TR_EXPERTISE_LEVEL = "TR_EXPERTISE_LEVEL",
  TR_QUALIFICATION = "TR_QUALIFICATION",
  TR_URL_TYPE = "TR_URL_TYPE",
  SERVICE_CATEGORY = "SERVICE_CATEGORY",
  MARKETPLACE_LOCATION = "MARKETPLACE_LOCATION",
  NODE = "NODE",
}

/* HELPDESK --> */
export interface HelpdeskTicket {
  id?: string;
  title: string;
  group: string;
  customer: {
    firstname: string;
    lastname: string;
    email: string;
  };
  status?: string;
  created_at?: string;
  updated_at?: string;
  article: {
    subject?: string;
    body: string;
    type?: string;
    internal?: boolean;
  };
}

export interface HelpdeskUser {
  id?: string;
  firstname: string;
  lastname: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

export interface HelpdeskTicketResponse {
  id?: string | number; // Internal database ID (optional, can be string or number)
  number: string; // Zammad ticket number (e.g., "22003")
  title: string;
  group: string;
  customer: {
    firstname: string;
    lastname: string;
    email: string;
  };
  state?: string; // Zammad state name (string)
  state_id?: number; // Zammad state ID (1=new, 2=open, 3=pending reminder, 4=closed, 7=pending close)
  created_at: string;
  updated_at: string;
  close_at?: string; // Date when ticket was closed (if applicable)
  articles: HelpdeskArticle[];
}

export interface HelpdeskArticle {
  id: string;
  subject: string;
  body: string;
  type: string;
  internal: boolean;
  created_at: string;
  updated_at: string;
  from: string;
  to: string;
  sender?: string; // "Agent" for EPOT messages, "Customer" for user messages
}

export interface CreateTicketRequest {
  title: string;
  group?: string;
  status?: string;
  article: {
    subject?: string;
    body: string;
    type?: string;
    internal?: boolean;
  };
  // Note: customer data and userToken removed for GDPR compliance
  // Backend handles user identification via access token
}

export interface CreateUserRequest {
  firstname: string;
  lastname: string;
  email: string;
}
/* HELPDESK <-- */
