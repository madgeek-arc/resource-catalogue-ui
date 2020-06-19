export class Description {
    desc: string;
    label: string;
    mandatory?: boolean;
    recommended?: boolean;
}

/** Service Description Template **/

// Basic Information //
export const                        nameDesc = {mandatory: true,  label: 'Name', desc: 'Brief and descriptive name of service/resource as assigned by the service/resource provider.'};
export const        resourceOrganisationDesc = {mandatory: true,  label: 'Resource Organisation', desc: 'The name (or abbreviation) of the organisation that manages or delivers the resource, or that coordinates resource delivery in a federated scenario.'};
export const           resourceProvidersDesc = {mandatory: false, label: 'Resource Providers', desc: 'The organisation that manages and delivers the service/resource.'};
export const                     webpageDesc = {mandatory: true,  label: 'Webpage', desc: 'Webpage with information about the service/resource usually hosted and maintained by the service/resource provider.'};

// Marketing Information //
export const                 descriptionDesc = {mandatory: true,  label: 'Description', desc: 'A high-level description in fairly non-technical terms of a) what the service/resource does, functionality it provides and resources it enables to access, b) the benefit to a user/customer delivered by a service; benefits are usually related to alleviating pains (e.g., eliminate undesired outcomes, obstacles or risks) or producing gains (e.g. increased performance, social gains, positive emotions or cost saving), c) list of customers, communities, users, etc. using the service.'};
export const                     taglineDesc = {mandatory: true,  label: 'Tagline', desc: 'Short catch-phrase for marketing and advertising purposes. It will be usually displayed close the service name and should refer to the main value or purpose of the service.'};
export const                        logoDesc = {mandatory: true,  label: 'Logo', desc: 'Link to the logo/visual identity of the service. The logo will be visible at the Portal. To obtain the link:  Go to the Service\'s website --> Right Click on the Service\'s logo on the website --> Select "Copy Image Link" --> Paste it in the above field.'};
export const                  multimediaDesc = {mandatory: false, label: 'Multimedia', desc: 'Link to video, screenshots or slides showing details of the service/resource.'};
export const                    useCasesDesc = {mandatory: false, label: 'Use Cases', desc: 'Link to use cases supported by this Resource.'};

// Classification Information //
export const            scientificDomainDesc = {mandatory: true,  label: 'Scientific Domain', desc: 'The branch of science, scientific discipline that is related to the service/resource.'};
export const         scientificSubDomainDesc = {mandatory: true,  label: 'Scientific Subdomain', desc: 'The subbranch of science, scientific subdicipline that is related to the service/resource.'};
// export const               superCategoryDesc = {mandatory:  true, label: 'Supercategory', desc: 'A named group for a predefined list of categories.'};
export const                    categoryDesc = {mandatory: true,  label: 'Category', desc: 'A named group of services/resources that offer access to the same type of resource or capabilities.'};
export const                 subcategoryDesc = {mandatory: true,  label: 'Subcategory', desc: 'A named group of services/resources that offer access to the same type of resource or capabilities, within the defined service category'};
export const                 targetUsersDesc = {mandatory: true,  label: 'Target users', desc: 'Type of users/customers that commissions a service/resource provider to deliver a service.'};
export const                  accessTypeDesc = {mandatory: false, label: 'Access type', desc: 'The way a user can access the service/resource (Remote, Physical, Virtual, etc.)'};
export const                  accessModeDesc = {mandatory: false, label: 'Access Mode', desc: 'The mode a user can access the service/resource (Excellence Driven, Market driven, etc)'};
export const                        tagsDesc = {mandatory: false, label: 'Tags', desc: 'Keywords associated to the service/resource to simplify search by relevant keywords.'};

// Geographical and Language Availability Information //
export const    geographicalAvailabilityDesc = {mandatory: true, label: 'Geographical Availability', desc: 'Countries where the service/resource is offered.'};
export const      languageAvailabilitiesDesc = {mandatory: true, label: 'Language Availability', desc: 'Languages of the user interface of the service or the resource.'};

// Location Information //
export const resourceGeographicLocationsDesc = {mandatory: false, label: 'Geographic Locations', desc: 'List of geographic locations where data is stored and processed.'};

// Contact Information --> //
// Main Contact/Service Owner
export const        mainContactFirstNameDesc = {mandatory: true,  label: 'Main Contact First Name ', desc: 'First Name of the service/resource\'s main contact person/manager.'};
export const         mainContactLastNameDesc = {mandatory: true,  label: 'Main Contact Last Name', desc: 'Last Name of the service/resource\'s main contact person/manager.'};
export const            mainContactEmailDesc = {mandatory: true,  label: 'Main Contact Email', desc: 'Email of the service/resource\'s main contact person/manager.'};
export const            mainContactPhoneDesc = {mandatory: false, label: 'Main Contact Phone', desc: 'Telephone of the service/resource\'s main contact person/manager.'};
export const         mainContactPositionDesc = {mandatory: false, label: 'Main Contact Position', desc: 'Position of the service/resource\'s main contact person/manager.'};
export const     mainContactOrganisationDesc = {mandatory: false, label: 'Main Contact Organisation', desc: 'The Organisation to which the contact is affiliated.'};

// Public Contact //
export const      publicContactFirstNameDesc = {mandatory: false, label: 'Public Contact First Name', desc: 'First Name of the service/resource\'s contact person to be displayed at the portal.'};
export const       publicContactLastNameDesc = {mandatory: false, label: 'Public Contact Last Name', desc: 'Last Name of the service/resource\'s contact person to be displayed at the portal.'};
export const          publicContactEmailDesc = {mandatory: true,  label: 'Public Contact Email', desc: 'Email of the service/resource\'s contact person to be displayed at the portal.'};
export const          publicContactPhoneDesc = {mandatory: false, label: 'Public Contact Phone', desc: 'Telephone of the service/resource\'s contact person to be displayed at the portal.'};
export const       publicContactPositionDesc = {mandatory: false, label: 'Public Contact Position', desc: 'Position of the service/resource\'s contact person to be displayed at the portal.'};
export const   publicContactOrganisationDesc = {mandatory: false, label: 'Public Contact Organisation', desc: 'The Organisation to which the contact is affiliated.'};

// Other
export const               helpdeskEmailDesc = {mandatory: true,  label: 'Helpdesk Email', desc: 'Email of the heldesk department.'};
export const        securityContactEmailDesc = {mandatory: true,  label: 'Security Contact Email', desc: 'The email to contact the Provider for critical security issues about this Resource.'};
// <-- Contact Information //

// Maturity Information //
export const    technologyReadinessLevelDesc = {mandatory: true,  label: 'Technology Readiness Level', desc: 'The Technology Readiness Level of the Tag of the service/resource.'};
export const                       phaseDesc = {mandatory: false, label: 'Life Cycle Status', desc: 'Phase of the service/resource lifecycle.'};
export const              certificationsDesc = {mandatory: false, label: 'Certifications', desc: 'List of certifications obtained for the service (including the certification body).'};
export const                   standardsDesc = {mandatory: false, label: 'Standards', desc: 'List of standards supported by the service.'};
export const      openSourceTechnologiesDesc = {mandatory: false, label: 'Open Source Technologies', desc: 'List of open source technologies supported by the service.'};
export const                     versionDesc = {mandatory: false, label: 'Version', desc: 'Version of the service/resource that is in force.'};
export const                  lastUpdateDesc = {mandatory: false, label: 'Last Update', desc: 'Date of the latest update of the service/resource.'};
export const                   changeLogDesc = {mandatory: false, label: 'Change Log', desc: 'Summary of the service/resource features updated from the previous version.'};

// Dependencies Information //
export const            requiredServicesDesc = {mandatory: false, label: 'Required Resources', desc: 'List of other services/resources required with this service/resource.'};
export const             relatedServicesDesc = {mandatory: false, label: 'Related Resources', desc: 'List of other services/resources that are commonly used with this service/resource.'};
export const            relatedPlatformsDesc = {mandatory: false, label: 'Related Platform', desc: ''};

// Attribution Information //
export const                 fundingBodyDesc = {mandatory: false, label: 'Funding Body', desc: 'Name of the funding body that supported the development and/or operation of the service.'};
export const              fundingProgramDesc = {mandatory: false, label: 'Funding Program', desc: 'Name of the funding program that supported the development and/or operation of the service.'};
export const            grantProjectNameDesc = {mandatory: false, label: 'Grant/Project Name', desc: 'Name of the project that supported the development and/or operation of the service.'};

// Management Information //
export const                helpdeskPageDesc = {mandatory: false, label: 'Helpdesk Page', desc: 'The URL to a webpage with the contact person or helpdesk to ask more information from the service/resource provider about this service.'};
export const                  userManualDesc = {mandatory: false, label: 'User Manual', desc: 'Link to the service/resource user manual and documentation.'};
export const                  termsOfUseDesc = {mandatory: false, label: 'Terms Of Use', desc: 'Webpage describing the rules, service/resource conditions and usage policy which one must agree to abide by in order to use the service.'};
export const               privacyPolicyDesc = {mandatory: false, label: 'Privacy Policy', desc: 'Link to the privacy policy applicable to the service.'};
export const                accessPolicyDesc = {mandatory: false, label: 'Access Policy', desc: 'Webpage to the information about the access policies that apply.'};
export const                serviceLevelDesc = {mandatory: false, label: 'Service Level', desc: 'Webpage with the information about the levels of performance that a service/resource provider is expected to deliver.'};
export const         trainingInformationDesc = {mandatory: false, label: 'Training Information', desc: 'URL for training information'};
export const            statusMonitoringDesc = {mandatory: false, label: 'Status Monitoring', desc: 'Webpage with monitoring information about this service'};
export const                 maintenanceDesc = {mandatory: false, label: 'Maintenance', desc: 'Webpage with information about planned maintenance windows for this service'};

// Access and Order Information //
export const                   orderTypeDesc = {mandatory: true,  label: 'Order Type', desc: 'Describe if the service/resource can be accessed with an ordering process.'};
export const                       orderDesc = {mandatory: false, label: 'Order', desc: 'URL for requesting the service from the service providers'};

// Financial Information //
export const                paymentModelDesc = {mandatory: false, label: 'Payment Model', desc: 'URL with the supported payment models and restrictions that apply to each of them.'};
export const                     pricingDesc = {mandatory: false, label: 'Pricing', desc: 'URL of the page with payment models that apply, the cost in Euros and any restrictions that may apply.'};



/** Service Provider form fields **/

// Basic Information //
export const                       fullNameDesc = {mandatory: true, label: 'Name', desc: 'Full Name of the organisation providing/offering the service/resource.'};
export const                   abbreviationDesc = {mandatory: true, label: 'Abbreviation', desc: 'Acronym or abbreviation of the provider.'};
export const                        websiteDesc = {mandatory: true, label: 'Website', desc: 'Webpage with information about the provider.'};
export const                    legalEntityDesc = {mandatory: true, label: 'Legal Entity', desc: 'A Y/N question to define whether the Provider is a Legal Entity or not.'};
export const                    legalStatusDesc = {mandatory: false, label: 'Legal Status', desc: 'For independent legal entities (1) - legal status of the Provider. For embedded Providers (2) - legal status of the hosting legal entity.'};

// Marketing Information //
export const            providerDescriptionDesc = {mandatory: true, label: 'Description', desc: 'The description of the provider.'};
export const                   providerLogoDesc = {mandatory: true, label: 'Logo', desc: 'Link to the logo/visual identity of the provider. The logo will be visible at the Portal. To obtain the link:  Go to the Service Provider\'s website --> Right Click on the Service Provider\'s logo on the website --> Select "Copy Image Link" --> Paste it in the above field.'};
export const             providerMultimediaDesc = {mandatory: false, label: 'Multimedia', desc: 'Link to video, slideshow, photos, screenshots with details of the provider.'};

// Classification Information //
export const       providerScientificDomainDesc = {mandatory: false, label: 'Scientific Domain', desc: 'A named group of providers that offer access to the same type of resource or capabilities.'};
export const   providerScientificSubdomainsDesc = {mandatory: false, label: 'Scientific Subdomain', desc: 'A named group of providers that offer access to the same type of resource or capabilities, within the defined category.'};
export const                   providerTagsDesc = {mandatory: false, label: 'Tags', desc: 'Keywords associated to the provider to simplify search by relevant keywords.'};

// Location Information //
export const            streetNameAndNumberDesc = {mandatory: true, label: 'Street Name and Number', desc: 'Street and Number of incorporation or Physical location of the Provider or its coordinating centre in the case of distributed, virtual, and mobile providers.'};
export const                     postalCodeDesc = {mandatory: true, label: 'Postal Code', desc: 'Physical location of the provider or its coordinating centre in the case of distributed, virtual, and mobile providers.'};
export const                           cityDesc = {mandatory: true, label: 'City', desc: 'Physical location of the provider or its coordinating centre in the case of distributed, virtual, and mobile providers.'};
export const                         regionDesc = {mandatory: false, label: 'Region', desc: 'Physical location of the provider or its coordinating centre in the case of distributed, virtual, and mobile providers.'};
export const                        countryDesc = {mandatory: true, label: 'Country', desc: 'Establishment/Registration Country of the organisation. Usually this is the location of the headquarters of the organisation. In the case of distributed/virtual providers the country of the coordinating office.'};

// Contact Information --> //
// Main Contact/Provider Manager
export const   providerMainContactFirstNameDesc = {mandatory: true, label: 'First Name', desc: 'First Name of the provider\'s main contact person/ provider manager.'};
export const    providerMainContactLastNameDesc = {mandatory: true, label: 'Last Name', desc: 'Last Name of the provider\'s main contact person/ provider manager.'};
export const       providerMainContactEmailDesc = {mandatory: true, label: 'Email', desc: 'Email of the provider\'s main contact person/ provider manager.'};
export const       providerMainContactPhoneDesc = {mandatory: false, label: 'Phone', desc: 'Phone of the provider\'s main contact person/ provider manager.'};
export const    providerMainContactPositionDesc = {mandatory: false, label: 'Position', desc: 'Position of the provider\'s main contact person/ provider manager.'};
// Public Contact
export const providerPublicContactFirstNameDesc = {mandatory: false, label: 'First Name', desc: 'First Name of the provider\'s contact person to be displayed at the portal.'};
export const  providerPublicContactLastNameDesc = {mandatory: false, label: 'Last Name', desc: 'Last Name of the provider\'s contact person to be displayed at the portal.'};
export const     providerPublicContactEmailDesc = {mandatory: true, label: 'Email', desc: 'Email of the provider\'s contact person to be displayed at the portal or general email to contact organisation.'};
export const     providerPublicContactPhoneDesc = {mandatory: false, label: 'Phone', desc: 'Phone of the provider\'s contact person to be displayed at the portal or general email to contact organisation.'};
export const  providerPublicContactPositionDesc = {mandatory: false, label: 'Position', desc: 'Position of the provider\'s contact person to be displayed at the portal.'};
// <-- Contact Information //

// Maturity Information //
export const                lifeCycleStatusDesc = {mandatory: false, label: 'Life Cycle Status', desc: 'Current status of the provider life-cycle.'};
export const         providerCertificationsDesc = {mandatory: false, label: 'Certifications', desc: 'List of certifications obtained for the provider (including the certification body and any certificate number or URL if available).   NOTE this is not for certifications specific to the service, which are under Service Description.'};

// Other //
export const             hostingLegalEntityDesc = {mandatory: false, label: 'Hosting Legal Entity', desc: 'Name of the organisation/institution legally hosting (housing) the RI or its coordinating centre. A distinction is made between: (1) RIs that are self-standing and have a defined and distinct legal entity, (2) RI that are embedded into another institution which is a legal entity (such as a university, a research organisation, etc.). If (1) - name of the RI, If (2) - name of the hosting organisation.'};
export const         participatingCountriesDesc = {mandatory: false, label: 'Participating Countries', desc: 'Providers that are funded by several countries should list here all supporting countries (including the Coordinating country).'};
export const                    affiliationDesc = {mandatory: false, label: 'Affiliations', desc: 'Select the affiliations, networks of the provider. '};
export const                       networksDesc = {mandatory: false, label: 'Networks', desc: 'Select the networks the RIs is part of.'};
export const                 structureTypesDesc = {mandatory: false, label: 'Structure Type', desc: 'Defines if the Provider is single-sited, distributed, mobile, virtual, etc.'};
export const                    ESFRIDomainDesc = {mandatory: false, label: 'ESFRI Domain', desc: 'ESFRI domain classification. '};
export const                      ESFRITypeDesc = {mandatory: false, label: 'ESFRI Type', desc: 'If the RI is (part of) an ESFRI project indicate how the RI participates: a) RI is node of an ESFRI project, b) RI is an ESFRI project, c) RI is an ESFRI landmark.'};
export const         merilScientificDomainsDesc = {mandatory: false, label: 'MERIL Scientific Domain', desc: 'MERIL scientific domain classification'};
export const      merilScientificSubdomainsDesc = {mandatory: false, label: 'MERIL Scientific Subdomain', desc: 'MERIL scientific subdomain classification'};
export const                areasOfActivityDesc = {mandatory: false, label: 'Areas of Activity', desc: 'Basic research, Applied research or Technological development'};
export const        societalGrandChallengesDesc = {mandatory: false, label: 'Societal Grand Challenges', desc: 'Provider’s participation in the grand societal challenges as defined by the European Commission (Horizon 2020)'};
export const               nationalRoadmapsDesc = {mandatory: false, label: 'National Roadmaps', desc: 'Is the Provider featured on the national roadmap for research infrastructures'};


