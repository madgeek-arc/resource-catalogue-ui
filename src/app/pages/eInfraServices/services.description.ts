export class Description {
    desc: string;
    label: string;
    mandatory?: boolean;
    recommended?: boolean;
}
/** Service Description Template **/
export const nameDesc = {label: 'Name', mandatory: true, desc: 'Brief and descriptive name of service/resource as assigned by the service/resource provider.'};
export const leadProviderNameDesc = {label: 'Lead Provider Name', mandatory: true, desc: 'The organisation that manages and delivers the service/resource.'};
export const contributingProvidersDesc = {label: 'Contributing Providers', mandatory: false, desc: ''};
export const webpageDesc = {label: 'Webpage', mandatory: true, desc: 'Webpage with information about the service/resource usually hosted and maintained by the service/resource provider.'};
// Marketing Information
export const descriptionDesc = {label: 'Description', mandatory: true, desc: 'A high-level description in fairly non-technical terms of a) what the service/resource does, functionality it provides and resources it enables to access, b) the benefit to a user/customer delivered by a service; benefits are usually related to alleviating pains (e.g., eliminate undesired outcomes, obstacles or risks) or producing gains (e.g. increased performance, social gains, positive emotions or cost saving), c) list of customers, communities, users, etc. using the service.'};
export const taglineDesc = {label: 'Tagline', mandatory: false, desc: 'Short catch-phrase for marketing and advertising purposes. It will be usually displayed close the service name and should refer to the main value or purpose of the service.'};
export const logoDesc = {label: 'Logo', mandatory: true, desc: 'Link to the logo/visual identity of the service. The logo will be visible at the Portal.'};
export const multimediaDesc = {label: 'Multimedia', mandatory: false, desc: 'Link to video, screenshots or slides showing details of the service/resource.'};
export const targetUsersDesc = {label: 'Target users', mandatory: true, desc: 'Type of users/customers that commissions a service/resource provider to deliver a service.'};
export const targetCustomerTagsDesc = {label: 'Target Customer Tags', mandatory: false, desc: ''};
export const useCasesCaseStudiesDesc = {label: 'Use Cases/Case Studies', mandatory: false, desc: 'List of use cases supported by this service/resource.'};
// Classification Information
export const providersDesc = {label: 'Provider Name', mandatory: true, desc: 'The organisation that manages and delivers the service/resource.'};
export const scientificDomainDesc = {label: 'Scientific Domain', mandatory: true, desc: 'The branch of science, scientific discipline that is related to the service/resource.'};
export const scientificSubDomainDesc = {label: 'Scientific Subdomain', mandatory: true, desc: 'The subbranch of science, scientific subdicipline that is related to the service/resource.'};
export const superCategoryDesc = {label: 'Supercategory', mandatory: true, desc: 'A named group for a predefined list of categories.'};
export const categoryDesc = {label: 'Category', mandatory: true, desc: 'A named group of services/resources that offer access to the same type of resource or capabilities.'};
export const subcategoryDesc = {label: 'Subcategory', mandatory: true, desc: 'A named group of services/resources that offer access to the same type of resource or capabilities, within the defined service category'};
export const tagsDesc = {label: 'Tags', mandatory: false, desc: 'Keywords associated to the service/resource to simplify search by relevant keywords.'};
// Location Information
export const geographicalAvailabilityDesc = {label: 'Geographical Availability', mandatory: true, desc: 'Countries where the service/resource is offered.'};
export const languageDesc = {label: 'Language', mandatory: true, desc: 'Languages of the user interface of the service or the resource.'};
// Contact Information
// Main Contact/Service Owner
export const mainContactFirstNameDesc = {label: 'Main Contact First Name ', mandatory: true, desc: 'First Name of the service/resource\'s main contact person/manager.'};
export const mainContactLastNameDesc = {label: 'Main Contact Last Name', mandatory: true, desc: 'Last Name of the service/resource\'s main contact person/manager.'};
export const mainContactEmailDesc = {label: 'Main Contact Email', mandatory: true, desc: 'Email of the service/resource\'s main contact person/manager.'};
export const mainContactPhoneDesc = {label: 'Main Contact Phone', mandatory: true, desc: 'Telephone of the service/resource\'s main contact person/manager.'};
export const mainContactPositionDesc = {label: 'Main Contact Position', mandatory: false, desc: 'Position of the service/resource\'s main contact person/manager.'};
// Public Contact
export const publicContactFirstNameDesc = {label: 'Public Contact First Name', mandatory: false, desc: 'First Name of the service/resource\'s contact person to be displayed at the portal.'};
export const publicContactLastNameDesc = {label: 'Public Contact Last Name', mandatory: false, desc: 'Last Name of the service/resource\'s contact person to be displayed at the portal.'};
export const publicContactEmailDesc = {label: 'Public Contact Email', mandatory: true, desc: 'Email of the service/resource\'s contact person to be displayed at the portal.'};
export const publicContactPhoneDesc = {label: 'Public Contact Phone', mandatory: false, desc: 'Telephone of the service/resource\'s contact person to be displayed at the portal.'};
export const publicContactPositionDesc = {label: 'Public Contact Position', mandatory: false, desc: 'Position of the service/resource\'s contact person to be displayed at the portal.'};
// Other Contacts
export const heldeskEmailDesc = {label: 'Heldesk Email', mandatory: false, desc: 'Email of the heldesk department.'};
export const quotationEmailDesc = {label: 'Quotation Email', mandatory: false, desc: 'Email of the quotations department.'};
// Maturity Information
export const phaseDesc = {label: 'Phase', mandatory: false, desc: 'Phase of the service/resource lifecycle.'};
export const technologyReadinessLevelDesc = {label: 'Technology Readiness Level', mandatory: false, desc: 'The Technology Readiness Level of the Tag of the service/resource.'};
export const certificationsDesc = {label: 'Certifications', mandatory: false, desc: 'List of certifications obtained for the service (including the certification body).'};
export const standardsDesc = {label: 'Standards', mandatory: false, desc: 'List of standards supported by the service.'};
export const openSourceTechnologiesDesc = {label: 'Open Source Technologies', mandatory: false, desc: 'List of open source technologies supported by the service.'};
export const versionDesc = {label: 'Version', mandatory: false, desc: 'Version of the service/resource that is in force.'};
export const lastUpdateDesc = {label: 'Last Update', mandatory: false, desc: 'Date of the latest update of the service/resource.'};
export const changeLogDesc = {label: 'Change Log', mandatory: false, desc: 'Summary of the service/resource features updated from the previous version.'};
// Dependencies Information
export const requiredServicesDesc = {label: 'Required Services', mandatory: false, desc: 'List of other services/resources required with this service/resource.'};
export const relatedServicesDesc = {label: 'Related Services', mandatory: false, desc: 'List of other services/resources that are commonly used with this service/resource.'};
export const relatedPlatformsDesc = {label: 'Related Platform', mandatory: false, desc: ''};
// Attribution Information
export const fundingBodyDesc = {label: 'Funding Body', mandatory: false, desc: 'Name of the funding body that supported the development and/or operation of the service.'};
export const fundingProgramDesc = {label: 'Funding Program', mandatory: false, desc: 'Name of the funding program that supported the development and/or operation of the service.'};
export const grantProjectNameDesc = {label: 'Grant/Project Name', mandatory: false, desc: 'Name of the project that supported the development and/or operation of the service.'};
// Management Information
export const helpdeskDesc = {label: 'Helpdesk', mandatory: false, desc: 'The URL to a webpage with the contact person or helpdesk to ask more information from the service/resource provider about this service.'};
export const userManualDesc = {label: 'User Manual', mandatory: false, desc: 'Link to the service/resource user manual and documentation.'};
export const adminManualDesc = {label: 'Admin Manual', mandatory: false, desc: 'Link to the service/resource admin manual and documentation.'};
export const termsOfUseDesc = {label: 'Terms Of Use', mandatory: false, desc: 'Webpage describing the rules, service/resource conditions and usage policy which one must agree to abide by in order to use the service.'};
export const privacyPolicyDesc = {label: 'Privacy Policy', mandatory: false, desc: 'Link to the privacy policy applicable to the service.'};
export const serviceLevelAgreementDesc = {label: 'Service Level Agreement', mandatory: false, desc: 'Webpage with the information about the levels of performance that a service/resource provider is expected to deliver.'};
export const trainingInformationDesc = {label: 'Training Information', mandatory: false, desc: 'URL for training information'};
export const statusMonitoringDesc = {label: 'Status Monitoring', mandatory: false, desc: 'Webpage with monitoring information about this service'};
export const maintenanceDesc = {label: 'Maintenance', mandatory: false, desc: 'Webpage with information about planned maintenance windows for this service'};
// Access and Order Information
export const orderTypeDesc = {label: 'Order Type', mandatory: true, desc: 'Describe if the service/resource can be accessed with an ordering process.'};
export const orderDesc = {label: 'order', mandatory: false, desc: 'URL for requesting the service from the service providers'};
export const endpointDesc = {label: 'Endpoint', mandatory: false, desc: 'Main URL to use the service (in the case of networked service)'};
export const optionsDesc = {label: 'options', mandatory: false, desc: 'High-level description of the various options or forms in which the service/resource can be instantiated. Options are further described with the Option Description Template.'};
export const accessTypeDesc = {label: 'Access type', mandatory: false, desc: 'The way a user can access the service/resource (Remote, Physical, Virtual, etc.)'};
export const accessModeDesc = {label: 'Access Mode', mandatory: false, desc: 'The mode a user can access the service/resource (Excellence Driven, Market driven, etc)'};
export const accessPolicyDesc = {label: 'Access Policy', mandatory: false, desc: 'Webpage to the information about the access policies that apply.'};
// Other Information
export const paymentModelDesc = {label: 'Payment Model', mandatory: false, desc: 'URL with the supported payment models and restrictions that apply to each of them.'};
export const pricingDesc = {label: 'pricing', mandatory: false, desc: 'URL of the page with payment models that apply, the cost in Euros and any restrictions that may apply.'};
// Aggregator Information
export const aggregatedServicesDesc = {label: 'Services', mandatory: false, desc: 'Number of services offered under the record'};
export const datasetsDesc = {label: 'Data', mandatory: false, desc: 'Number of datasets offered under the record'};
export const applicationsDesc = {label: 'Applications', mandatory: false, desc: 'Number of applications offered under the record'};
export const softwareDesc = {label: 'Software', mandatory: false, desc: 'Number of applications offered under the record'};
export const publicationsDesc = {label: 'Publications', mandatory: false, desc: 'Number of publications offered under the record'};
export const otherProductsDesc = {label: 'Other', mandatory: false, desc: 'Other resources offered under the record'};
// WP4
export const userValueDesc = {label: 'User Value', mandatory: false, desc: 'The benefit to a user/customer delivered by a service; benefits are usually related to alleviating pains (e.g., eliminate undesired outcomes, obstacles or risks) or producing gains (e.g. increased performance, social gains, positive emotions or cost saving).'};
export const userBaseDesc = {label: 'User Base', mandatory: false, desc: 'List of customers, communities, users, etc. using the service.'};
export const useCasesDesc = {label: 'Use Cases', mandatory: false, desc: 'List of use cases supported by this service/resource.'};
export const fundersDesc = {label: 'Funded by', mandatory: false, desc: 'Sources of funding for the development and/or operation of the service.'};

/** Option fields **/
// Basic Information
export const optionsNameDesc = {label: 'name', mandatory: true, desc: 'Name of the service/resource option.'};
export const optionsWebpageDesc = {label: 'Webpage', mandatory: true, desc: 'Webpage with information about the service/resource option.'};
export const optionsDescriptionDesc = {label: 'description', mandatory: true, desc: 'The description of the service/resource option.'};
export const optionsLogoDesc = {label: 'logo', mandatory: false, desc: 'Link to the logo/visual identity of the service/resource provider.'};
// Contact Information
export const firstContactFirstNameDesc = {label: 'Contact-1 First Name', mandatory: true, desc: 'First Name of the service/resource option main contact person/manager.'};
export const firstContactLastNameDesc = {label: 'Contact-1 Last Name', mandatory: true, desc: 'Last Name of the service/resource option main contact person/manager.'};
export const firstContactEmailDesc = {label: 'Contact-1 Email', mandatory: true, desc: 'Email of the service/resource option main contact person/manager.'};
export const firstContactTelephoneDesc = {label: 'Contact-1 Telephone', mandatory: true, desc: 'Telephone of the service/resource option main contact person/manager.'};
export const firstContactPositionDesc = {label: 'Contact-1 Position', mandatory: false, desc: 'Position of the service/resource option main contact person/manager.'};
export const secondContactFirstNameDesc = {label: 'Contact-2 First Name', mandatory: false, desc: 'First Name of the service/resource option main contact person to be displayed at the portal.'};
export const secondContactLastNameDesc = {label: 'Contact-2 Last Name', mandatory: false, desc: 'Last Name of the service/resource option main contact person to be displayed at the portal.'};
export const secondContactEmailDesc = {label: 'Contact-2 Email', mandatory: false, desc: 'Email of the service/resource option main contact person to be displayed at the portal.'};
export const secondContactTelephoneDesc = {label: 'Contact-2 Telephone', mandatory: false, desc: 'Telephone of the service/resource option main contact person to be displayed at the portal.'};
export const secondContactPositionDesc = {label: 'Contact-2 Position', mandatory: false, desc: 'Position of the service/resource option main contact person to be displayed at the portal.'};
// Other Information
export const Attribute1Desc = {label: 'Attribute 1', mandatory: false, desc: ''};
export const Attribute2Desc = {label: 'Attribute 2', mandatory: false, desc: ''};
export const Attribute3Desc = {label: 'Attribute 3', mandatory: false, desc: ''};

/** Service provider form fields **/
// Basic Information
export const fullNameDesc = {label: 'Full Name', mandatory: true, desc: 'Full Name of the organisation providing/offering the service/resource.'};
export const acronymDesc = {label: 'Acronym', mandatory: true, desc: 'Acronym or abbreviation of the provider.'};
export const legalFormDesc = {label: 'Legal Form', mandatory: true, desc: 'The legal from is usually noted in the registration act/statute of teh organisation. For independent legal entities (1) - legal form of the provider. For embedded providers (2) - legal form of the hosting legal entity.'};
export const websiteDesc = {label: 'Website', mandatory: true, desc: 'Webpage with information about the provider.'};
// Marketing Information
export const providerDescriptionDesc = {label: 'Description', mandatory: true, desc: 'The description of the provider.'};
export const providerLogoDesc = {label: 'Logo', mandatory: true, desc: 'Link to the logo/visual identity of the provider.'};
export const providerMultimediaDesc = {label: 'Multimedia', mandatory: false, desc: 'Link to video, slideshow, photos, screenshots with details of the provider.'};
// Classification Information
export const providerScientificDomainDesc = {label: 'Scientific Domain', mandatory: true, desc: 'A named group of providers that offer access to the same type of resource or capabilities.'};
export const providerCategoryDesc = {label: 'Category', mandatory: true, desc: 'A named group of providers that offer access to the same type of resource or capabilities, within the defined category.'};
export const typeDesc = {label: 'Type', mandatory: true, desc: 'Defines if the Provider is single-sited, distributed, mobile, virtual, etc.'};
export const participatingCountriesDesc = {label: 'Participating Countries', mandatory: false, desc: 'Providers that are funded by several countries should list here all supporting countries (including the Coordinating country).'};
export const affiliationDesc = {label: 'Affiliation', mandatory: false, desc: 'Select the affiliations, networks of the provider. '};
export const providerTagsDesc = {label: 'Tags', mandatory: false, desc: 'Keywords associated to the provider to simplify search by relevant keywords.'};
// Location Information
export const locationNameDesc = {label: 'Location Name', mandatory: true, desc: 'Physical location of the provider or its coordinating centre in the case of distributed, virtual, and mobile providers.'};
export const streetNameDesc = {label: 'Street Name', mandatory: true, desc: 'Physical location of the provider or its coordinating centre in the case of distributed, virtual, and mobile providers.'};
export const streetNumberDesc = {label: 'Street Number', mandatory: true, desc: 'Physical location of the provider or its coordinating centre in the case of distributed, virtual, and mobile providers. If no street number exists, please fill in "0"'};
export const postalCodeDesc = {label: 'Postal Code', mandatory: true, desc: 'Physical location of the provider or its coordinating centre in the case of distributed, virtual, and mobile providers.'};
export const cityDesc = {label: 'City', mandatory: true, desc: 'Physical location of the provider or its coordinating centre in the case of distributed, virtual, and mobile providers.'};
export const regionDesc = {label: 'Region', mandatory: true, desc: 'Physical location of the provider or its coordinating centre in the case of distributed, virtual, and mobile providers.'};
export const countryDesc = {label: 'Country', mandatory: true, desc: 'Establishment/Registration Country of the organisation. Usually this is the location of the headquarters of the organisation. In the case of distributed/virtual providers the country of the coordinating office.'};
// Contact Information
export const providerMainContactFirstNameDesc = {label: 'Main Contact First Name', mandatory: true, desc: 'First Name of the provider\'s main contact person/ provider manager.'};
export const providerMainContactLastNameDesc = {label: 'Main Contact Last Name', mandatory: true, desc: 'Last Name of the provider\'s main contact person/ provider manager.'};
export const providerMainContactEmailDesc = {label: 'Main Contact Email', mandatory: true, desc: 'Email of the provider\'s main contact person/ provider manager.'};
export const providerMainContactPhoneDesc = {label: 'Main Contact Phone', mandatory: true, desc: 'Phone of the provider\'s main contact person/ provider manager.'};
export const providerMainContactPositionDesc = {label: 'Main Contact Position', mandatory: false, desc: 'Position of the provider\'s main contact person/ provider manager.'};
// Public Contact
// Main Contact/Provider Manager
export const providerPublicContactFirstNameDesc = {label: 'Public Contact First Name', mandatory: false, desc: 'First Name of the provider\'s contact person to be displayed at the portal.'};
export const providerPublicContactLastNameDesc = {label: 'Public Contact Last Name', mandatory: false, desc: 'Last Name of the provider\'s contact person to be displayed at the portal.'};
export const providerPublicContactEmailDesc = {label: 'Public Contact Email', mandatory: false, desc: 'Email of the provider\'s contact person to be displayed at the portal or general email to contact organisation.'};
export const providerPublicContactPhoneDesc = {label: 'Public Contact Phone', mandatory: false, desc: 'Phone of the provider\'s contact person to be displayed at the portal or general email to contact organisation.'};
export const providerPublicContactPositionDesc = {label: 'Public Contact Position', mandatory: false, desc: 'Position of the provider\'s contact person to be displayed at the portal.'};
// Maturity Information
export const providerCertificationsDesc = {label: 'Certifications', mandatory: false, desc: 'List of certifications obtained for the provider (including the certification body and any certificate number or URL if available).   NOTE this is not for certifications specific to the service, which are under Service Description.'};
// Research Infrastructures Information
export const ESFRIDomainDesc = {label: 'ESFRI Domain', mandatory: false, desc: 'ESFRI domain classification. '};
export const hostingLegalEntityDesc = {label: 'Hosting Legal Entity', mandatory: false, desc: 'Name of the organisation/institution legally hosting (housing) the RI or its coordinating centre. A distinction is made between: (1) RIs that are self-standing and have a defined and distinct legal entity, (2) RI that are embedded into another institution which is a legal entity (such as a university, a research organisation, etc.). If (1) - name of the RI, If (2) - name of the hosting organisation.'};
export const ESFRIDesc = {label: 'ESFRI', mandatory: false, desc: 'If the RI is (part of) an ESFRI project indicate how the RI participates: a) RI is node of an ESFRI project, b) RI is an ESFRI project, c) RI is an ESFRI landmark.'};
export const lifeCycleStatusDesc = {label: 'Life Cycle Status', mandatory: true, desc: 'Current status of the provider life-cycle.'};
export const areasOfActivityDesc = {label: 'Areas of Activity', mandatory: false, desc: 'Basic research, Applied research or Technological development'};
export const societalGrandChallengesDesc = {label: 'Societal Grand Challenges', mandatory: false, desc: 'Provider’s participation in the grand societal challenges as defined by the European Commission (Horizon 2020)'};
export const nationalRoadmapsDesc = {label: 'National Roadmaps', mandatory: false, desc: 'Is the Provider featured on the national roadmap for research infrastructures'};
// Other
export const legalStatusDesc = {label: 'Legal Status', mandatory: false, desc: 'For independent legal entities (1) - legal status of the Provider. For embedded Providers (2) - legal status of the hosting legal entity.'};
export const networksDesc = {label: 'Networks', mandatory: false, desc: 'Select the networks the RIs is part of.'};
