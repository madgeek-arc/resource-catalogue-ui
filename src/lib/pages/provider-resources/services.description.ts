export class Description {
    desc: string;
    label: string;
    mandatory?: boolean;
    recommended?: boolean;
}

/** Provider Description Template **/

export const providerDescMap = new Map()
  // Basic Information //
  .set('fullNameDesc', {mandatory: true, label: 'Name', placeholder: 'Write full name...', desc: 'Full Name of the Provider/Organisation offering Resources and acting as main contact point for the Resources.'})
  .set('abbreviationDesc', {mandatory: true, label: 'Abbreviation', placeholder: 'Write abbreviation...', desc: 'Abbreviation or short name of the Provider.'})
  .set('websiteDesc', {mandatory: true, label: 'Website', placeholder: 'webpage URL', desc: 'Webpage of the Provider.'})
  .set('legalEntityDesc', {mandatory: true, label: 'Legal Entity', desc: 'Is the Provider a Legal Entity?'})
  .set('legalStatusDesc', {mandatory: false, label: 'Legal Status', placeholder: 'Write legal status...', desc: 'Legal status of the Provider. The legal status is usually noted in the registration act/statutes. For independent legal entities this should be the legal status of the Provider. For embedded Providers this should be the legal status of the hosting legal entity. It is also possible to select "Not a Legal Entity".'})
  // Marketing Information //
  .set('providerDescriptionDesc', {mandatory: true, label: 'Description', placeholder: 'Write a description...', desc: 'A high-level description of the Provider in fairly non-technical terms, with the vision, mission, objectives, background, experience.'})
  .set('providerLogoDesc', {mandatory: true, label: 'Logo', placeholder: 'logo URL', desc: 'Link to the logo/visual identity of the Provider. Go to the Provider\'s website --> Right Click on the Provider\'s logo on the website --> Select "Copy Image Link" --> Paste it in the field below.'})
  .set('providerMultimediaDesc', {mandatory: false, label: 'Multimedia', addTitle: 'Multimedia', placeholder: 'Write link to multimedia...', desc: 'Links to video, slideshow, photos, screenshots with details of the Provider.'})
  // Classification Information //
  .set('providerScientificDomainDesc', {mandatory: false, label: 'Scientific Domain', placeholder: 'Select scientific domain...', desc: 'A named group of Providers that offer access to the same type of Resources.'})
  .set('providerScientificSubdomainsDesc', {mandatory: false, label: 'Scientific Subdomain', placeholder: 'Select scientific subdomain after selecting scientific domain...', desc: 'A named group of Providers that offer access to the same type of Resources, within the defined domain.'})
  .set('providerTagsDesc', {mandatory: false, label: 'Tags', addTitle: 'Tag', placeholder: 'Write tag...', desc: 'Keywords associated to the Provider to simplify search by relevant keywords.'})
  // Location Information //
  .set('streetNameAndNumberDesc', {mandatory: true, label: 'Street Name and Number', placeholder: 'Write street name and number...', desc: 'Street and Number of incorporation or Physical location of the Provider or its coordinating centre in the case of distributed, virtual, and mobile Providers.'})
  .set('postalCodeDesc', {mandatory: true, label: 'Postal Code', placeholder: 'Write postal code...', desc: 'Postal code of incorporation or physical location of the Provider or its coordinating centre in the case of distributed, virtual, and mobile Providers.'})
  .set('cityDesc', {mandatory: true, label: 'City', placeholder: 'Write city...', desc: 'City of incorporation or physical location of the Provider or its coordinating centre in the case of distributed, virtual, and mobile Providers.'})
  .set('regionDesc', {mandatory: false, label: 'Region', placeholder: 'Write region...', desc: 'Region of incorporation or physical location of the Provider or its coordinating centre in the case of distributed, virtual, and mobile Providers.'})
  .set('countryDesc', {mandatory: true, label: 'Country', placeholder: 'Write country...', desc: 'Country of incorporation or physical location of the Provider or its coordinating centre in the case of distributed, virtual, and mobile Providers.'})
  // Contact Information --> //
  // Main Contact/Provider Manager
  .set('providerMainContactFirstNameDesc', {mandatory: true, label: 'First Name', placeholder: 'Write first name...', desc: 'First Name of the Provider\'s main contact person/Provider manager.'})
  .set('providerMainContactLastNameDesc', {mandatory: true, label: 'Last Name', placeholder: 'Write last name...', desc: 'Last Name of the Provider\'s main contact person/Provider manager.'})
  .set('providerMainContactEmailDesc', {mandatory: true, label: 'Email', placeholder: 'Write email...', desc: 'Email of the Provider\'s main contact person/Provider manager.'})
  .set('providerMainContactPhoneDesc', {mandatory: false, label: 'Phone', placeholder: 'Write phone...', desc: 'Phone of the Provider\'s main contact person/Provider manager.'})
  .set('providerMainContactPositionDesc', {mandatory: false, label: 'Position', placeholder: 'Write position...', desc: 'Position of the Provider\'s main contact person/Provider manager.'})
  // Public Contact
  .set('providerPublicContactFirstNameDesc', {mandatory: false, label: 'First Name', placeholder: 'Write first name...', desc: 'First Name of the Provider\'s contact person to be displayed publicly at the Portal.'})
  .set('providerPublicContactLastNameDesc', {mandatory: false, label: 'Last Name', placeholder: 'Write last name...', desc: 'Last Name of the Provider\'s contact person to be displayed publicly at the Portal.'})
  .set('providerPublicContactEmailDesc', {mandatory: true, label: 'Email', placeholder: 'Write email...', desc: 'Email of the Provider\'s contact person to be displayed publicly at the Portal or general email to contact the Provider.'})
  .set('providerPublicContactPhoneDesc', {mandatory: false, label: 'Phone', placeholder: 'Write phone...', desc: 'Phone of the provider\'s contact person to be displayed publicly at the Portal or general phone to contact the Provider.'})
  .set('providerPublicContactPositionDesc', {mandatory: false, label: 'Position', placeholder: 'Write position...', desc: 'Position of the Provider\'s contact person to be displayed publicly at the Portal.'})
  // <-- Contact Information //
  // Maturity Information //
  .set('lifeCycleStatusDesc', {mandatory: false, label: 'Life Cycle Status', placeholder: 'Write life cycle status...', desc: 'Current status of the Provider life-cycle.'})
  .set('providerCertificationsDesc', {mandatory: false, label: 'Certifications', addTitle: 'Certification', placeholder: 'Write certifications...', desc: 'List of certifications obtained for the Provider (including the certification body, the certificate number or URL if available).'})
  // Other //
  .set('hostingLegalEntityDesc', {mandatory: false, label: 'Hosting Legal Entity', placeholder: 'Write hosting legal entity...', desc: 'Name of the organisation/institution legally hosting (housing) the Provider or its coordinating centre. A distinction is made between: (1) research infrastructures that are self-standing and have a defined and distinct legal entity, (2) research infrastructures that are embedded into another institution which is a legal entity (such as a university, a research organisation, etc.). If (1) - name of the research infrastructure, If (2) - name of the hosting organisation.'})
  .set('participatingCountriesDesc', {mandatory: false, label: 'Participating Countries', addTitle: 'Participating Country', placeholder: 'Select participating countries...', desc: 'Providers that are funded by several countries should list here all supporting countries (including the coordinating country first).'})
  .set('affiliationDesc', {mandatory: false, label: 'Affiliations', addTitle: 'Affiliation', placeholder: 'Write affiliations...', desc: 'Providers that are members or affiliated or associated with other organisations should list those organisations here.'})
  .set('networksDesc', {mandatory: false, label: 'Networks', addTitle: 'Network', placeholder: 'Select network...', desc: 'Providers that are members of networks should list those networks here.'})
  .set('structureTypesDesc', {mandatory: false, label: 'Structure Type', addTitle: 'Structure Type', placeholder: 'Select structure type...', desc: 'Structure Type of the Provider (single-sited, distributed, mobile, virtual, etc.).'})
  .set('ESFRIDomainDesc', {mandatory: false, label: 'ESFRI Domain', addTitle: 'ESFRI Domain', placeholder: 'Select ESFRI domain...', desc: 'ESFRI domain classification. '})
  .set('ESFRITypeDesc', {mandatory: false, label: 'ESFRI Type', placeholder: 'Select ESFRI type...', desc: 'If the RI is (part of) an ESFRI project indicate how the RI participates: a) RI is node of an ESFRI project, b) RI is an ESFRI project, c) RI is an ESFRI landmark.'})
  .set('merilScientificDomainsDesc', {mandatory: false, label: 'MERIL Scientific Domain', placeholder: 'Select MERIL scientific domain...', desc: 'MERIL scientific domain classification.'})
  .set('merilScientificSubdomainsDesc', {mandatory: false, label: 'MERIL Scientific Subdomain', placeholder: 'Select MERIL scientific subdomain after selecting MERIL scientific domain...', desc: 'MERIL scientific subdomain classification.'})
  .set('areasOfActivityDesc', {mandatory: false, label: 'Area of Activity', addTitle: 'Area of Activity', placeholder: 'Write areas of activity...', desc: 'Basic research, Applied research or Technological development'})
  .set('societalGrandChallengesDesc', {mandatory: false, label: 'Societal Grand Challenges', addTitle: 'Societal Grand Challenge', placeholder: 'Write societal grand challenges...', desc: 'Provider’s participation in the Grand Societal Challenges defined by the European Commission.'})
  .set('nationalRoadmapsDesc', {mandatory: false, label: 'National Roadmaps', addTitle: 'National Roadmap', placeholder: 'Write national roadmaps...', desc: 'Provider\'s participation in a national roadmap.'})
;


/** Service Description Template **/

export const serviceDescMap = new Map()
// Basic Information //
  .set('nameDesc', {mandatory: true, label: 'Name', placeholder: 'Write full name...', desc: 'Brief and descriptive name of the Resource as assigned by the Provider.'})
  .set('resourceOrganisationDesc', {mandatory: true, label: 'Resource Organisation', placeholder: 'Select resource organisation...', desc: 'The name (or abbreviation) of the organisation that manages or delivers the resource, or that coordinates resource delivery in a federated scenario.'})
  .set('resourceProvidersDesc', {mandatory: false, label: 'Resource Providers', addTitle: 'Resource Provider', placeholder: 'Select resource provider...', desc: 'The name(s) (or abbreviation(s)) of Provider(s) that manage or deliver the Resource in federated scenarios.'})
  .set('webpageDesc', {mandatory: true,  label: 'Webpage', placeholder: 'Write webpage url...', desc: 'Webpage with information about the Resource usually hosted and maintained by the Provider.'})
// Marketing Information //
  .set('descriptionDesc', {mandatory: true,  label: 'Description', placeholder: 'Write a description...', desc: 'A high-level description in fairly non-technical terms of a) what the Resource does, functionality it provides and Resources it enables to access, b) the benefit to a user/customer delivered by a Resource; benefits are usually related to alleviating pains (e.g., eliminate undesired outcomes, obstacles or risks) or producing gains (e.g. increased performance, social gains, positive emotions or cost saving), c) list of customers, communities, users, etc. using the Resource.'})
  .set('taglineDesc', {mandatory: true,  label: 'Tagline', placeholder: 'Write a tagline...', desc: 'Short catchphrase for marketing and advertising purposes. It will be usually displayed close to the Resource name and should refer to the main value or purpose of the Resource.'})
  .set('logoDesc', {mandatory: true,  label: 'Logo', placeholder: 'Link to the logo', desc: 'Link to the logo/visual identity of the Resource. The logo will be visible at the Portal. If there is no specific logo for the Resource the logo of the Provider may be used. Go to the Resource Provider\'s website --> Right Click on the Resource Provider\'s logo on the website --> Select "Copy Image Link" --> Paste it in the below field.'})
  .set('multimediaDesc', {mandatory: false, label: 'Multimedia', addTitle: 'Multimedia', placeholder: 'Write link to multimedia...', desc: 'Link to video, screenshots or slides showing details of the Resource.'})
  .set('useCasesDesc', {mandatory: false, label: 'Use Cases', addTitle: 'Use Case', placeholder: 'Write use case...', desc: 'Link to use cases supported by this Resource.'})
// Classification Information //
  .set('scientificDomainDesc', {mandatory: true,  label: 'Scientific Domain', placeholder: 'Select scientific domain...', desc: 'The branch of science, scientific discipline that is related to the Resource.'})
  .set('scientificSubDomainDesc', {mandatory: true,  label: 'Scientific Subdomain', placeholder: 'Select scientific subdomain after selecting scientific domain...', desc: 'The subbranch of science, scientific subdiscipline that is related to the Resource.'})
  .set('categoryDesc', {mandatory: true,  label: 'Category', desc: 'A named group of Resources that offer access to the same type of Resources.'})
  .set('subcategoryDesc', {mandatory: true,  label: 'Subcategory', desc: 'A named group of Resources that offer access to the same type of Resources, within the defined Resource category.'})
  .set('targetUsersDesc', {mandatory: true,  label: 'Target Users', addTitle: 'Target User', placeholder: 'Select target users...', desc: 'Type of users that commissions a Provider to deliver a Resource.'})
  .set('accessTypeDesc', {mandatory: false, label: 'Access Type', addTitle: 'Access Type', placeholder: 'Select access type...', desc: 'The way a user can access the Resource (Remote, Physical, Virtual, etc.).'})
  .set('accessModeDesc', {mandatory: false, label: 'Access Mode', addTitle: 'Access Mode', placeholder: 'Select access mode...', desc: 'Eligibility/criteria for granting access to the Resource to users (excellence-based, free-conditionally, free etc.).'})
  .set('tagsDesc', {mandatory: false, label: 'Tags', addTitle: 'Tag', placeholder: 'Write tag...', desc: 'Keywords associated to the Resource to simplify search by relevant keywords.'})
// Geographical and Language Availability Information //
  .set('geographicalAvailabilityDesc', {mandatory: true, label: 'Geographical Availability', addTitle: 'Geographical Availability', placeholder: 'Select geographical availability...', desc: 'Locations where the Resource is offered.'})
  .set('languageAvailabilitiesDesc', {mandatory: true, label: 'Language Availability', addTitle: 'Language Availability', placeholder: 'Select language availability...', desc: 'Languages of the (user interface of the) Resource.'})
// Location Information //
  .set('resourceGeographicLocationsDesc', {mandatory: false, label: 'Geographic Location', addTitle: 'Geographic Locations', placeholder: 'Select geographic locations...', desc: 'List of geographic locations where data, samples, etc. are stored and processed when offering the Resource.'})
// Contact Information --> //
// Main Contact/Service Owner
  .set('mainContactFirstNameDesc', {mandatory: true,  label: 'First Name ', placeholder: 'Write first name...', desc: 'First Name of the Resource\'s main contact person/Resource manager.'})
  .set('mainContactLastNameDesc', {mandatory: true,  label: 'Last Name', placeholder: 'Write last name...', desc: 'Last Name of the Resource\'s main contact person/Resource manager.'})
  .set('mainContactEmailDesc', {mandatory: true,  label: 'Email', placeholder: 'Write email...', desc: 'Email of the Resource\'s main contact person/Resource manager.'})
  .set('mainContactPhoneDesc', {mandatory: false, label: 'Phone', placeholder: 'Write phone...', desc: 'Telephone of the Resource\'s main contact person/Resource manager.'})
  .set('mainContactPositionDesc', {mandatory: false, label: 'Position', placeholder: 'Write position...', desc: 'Position of the Resource\'s main contact person/Resource manager.'})
  .set('mainContactOrganisationDesc', {mandatory: false, label: 'Organisation', placeholder: 'Write organisation...', desc: 'The organisation to which the Resource\'s main contact person/Resource manager is affiliated.'})
// Public Contact //
  .set('publicContactFirstNameDesc', {mandatory: false, label: 'First Name', placeholder: 'Write first name...', desc: 'First Name of the Resource\'s contact person to be displayed publicly at the Portal.'})
  .set('publicContactLastNameDesc', {mandatory: false, label: 'Last Name', placeholder: 'Write last name...', desc: 'Last Name of the Resource\'s contact person to be displayed publicly at the Portal.'})
  .set('publicContactEmailDesc', {mandatory: true,  label: 'Email', placeholder: 'Write email...', desc: 'Email of the Resource\'s contact person or a generic email of the Provider to be displayed publicly at the Portal.'})
  .set('publicContactPhoneDesc', {mandatory: false, label: 'Phone', placeholder: 'Write phone...', desc: 'Telephone of the Resource\'s contact person to be displayed publicly at the Portal.'})
  .set('publicContactPositionDesc', {mandatory: false, label: 'Position', placeholder: 'Write position...', desc: 'Position of the Resource\'s contact person to be displayed publicly at the Portal.'})
  .set('publicContactOrganisationDesc', {mandatory: false, label: 'Organisation', placeholder: 'Write organisation...', desc: 'The organisation to which the Resource\'s public contact person is affiliated.'})
// Other
  .set('helpdeskEmailDesc', {mandatory: true,  label: 'Helpdesk Email', placeholder: 'Write email...', desc: 'The email to ask more information from the Provider about the Resource.'})
  .set('securityContactEmailDesc', {mandatory: true,  label: 'Security Contact Email', placeholder: 'Write email...', desc: 'The email to contact the Provider for critical security issues about the Resource.'})
// <-- Contact Information //
// Maturity Information //
  .set('technologyReadinessLevelDesc', {mandatory: true,  label: 'Technology Readiness Level', placeholder: 'Select technology readiness level...', desc: 'The Technology Readiness Level of the Resource.'})
  .set('phaseDesc', {mandatory: false, label: 'Life Cycle Status', placeholder: 'Write life cycle status...', desc: 'Status of the Resource life-cycle.'})
  .set('certificationsDesc', {mandatory: false, label: 'Certifications', addTitle: 'Certification', placeholder: 'Write certifications...', desc: 'List of certifications obtained for the Resource (including the certification body or URL if available).'})
  .set('standardsDesc', {mandatory: false, label: 'Standards', addTitle: 'Standard', placeholder: 'Write standards...', desc: 'List of standards supported by the Resource.'})
  .set('openSourceTechnologiesDesc', {mandatory: false, label: 'Open Source Technologies', addTitle: 'Open Source Technology', placeholder: 'Write open source technologies...', desc: 'List of open source technologies supported by the Resource.'})
  .set('versionDesc', {mandatory: false, label: 'Version', placeholder: 'Write version...', desc: 'Version of the Resource that is in force.'})
  .set('lastUpdateDesc', {mandatory: false, label: 'Last Update', placeholder: 'Write last update...', desc: 'Date of the latest update of the Resource.'})
  .set('changeLogDesc', {mandatory: false, label: 'Change Log', addTitle: 'Change Log', placeholder: 'Write change log...', desc: 'Summary of the Resource features updated from the previous version.'})
// Dependencies Information //
  .set('requiredServicesDesc', {mandatory: false, label: 'Required Resources', addTitle: 'Required Resource', placeholder: 'Select required resources...', desc: 'List of other Resources required to use this Resource.'})
  .set('relatedServicesDesc', {mandatory: false, label: 'Related Resources', addTitle: 'Related Resource', placeholder: 'Select related resources...', desc: 'List of other Resources that are commonly used with this Resource.'})
  .set('relatedPlatformsDesc', {mandatory: false, label: 'Related Platforms', addTitle: 'Related Platform', placeholder: 'Write related platform...', desc: 'List of suites or thematic platforms in which the Resource is engaged or Providers (Provider groups) contributing to this Resource.'})
// Attribution Information //
  .set('fundingBodyDesc', {mandatory: false, label: 'Funding Body', addTitle: 'Funder', placeholder: 'Select funding body...', desc: 'Name of the funding body that supported the development and/or operation of the Resource.'})
  .set('fundingProgramDesc', {mandatory: false, label: 'Funding Program', addTitle: 'Funding Program', placeholder: 'Select funding program...', desc: 'Name of the funding program that supported the development and/or operation of the Resource.'})
  .set('grantProjectNameDesc', {mandatory: false, label: 'Grant/Project Name', addTitle: 'Grant/Project Name', placeholder: 'Write grant/project name...', desc: 'Name of the project that supported the development and/or operation of the Resource.'})
// Management Information //
  .set('helpdeskPageDesc', {mandatory: false, label: 'Helpdesk Page', placeholder: 'helpdesk page URL', desc: 'The URL to a webpage to ask more information from the Provider about this Resource.'})
  .set('userManualDesc', {mandatory: false, label: 'User Manual', placeholder: 'user manual URL', desc: 'Link to the Resource user manual and documentation.'})
  .set('termsOfUseDesc', {mandatory: false, label: 'Terms Of Use', placeholder: 'terms of use URL', desc: 'Webpage describing the rules, Resource conditions and usage policy which one must agree to abide by in order to use the Resource.'})
  .set('privacyPolicyDesc', {mandatory: false, label: 'Privacy Policy', placeholder: 'privacy policy URL', desc: 'Link to the privacy policy applicable to the Resource.'})
  .set('accessPolicyDesc', {mandatory: false, label: 'Access Policy', placeholder: 'access policy URL', desc: 'Information about the access policies that apply to the Resource.'})
  .set('serviceLevelDesc', {mandatory: false, label: 'Resource Level', placeholder: 'service level URL', desc: 'Webpage with the information about the levels of performance of the Resource that a Provider is expected to deliver.'})
  .set('trainingInformationDesc', {mandatory: false, label: 'Training Information', placeholder: 'training information URL', desc: 'Webpage to training information on the Resource.'})
  .set('statusMonitoringDesc', {mandatory: false, label: 'Status Monitoring', placeholder: 'status monitoring URL', desc: 'Webpage with monitoring information about the Resource.'})
  .set('maintenanceDesc', {mandatory: false, label: 'Maintenance', placeholder: 'maintenance URL', desc: 'Webpage with information about planned maintenance windows for the Resource.'})
// Access and Order Information //
  .set('orderTypeDesc', {mandatory: true,  label: 'Order Type', placeholder: 'Select order type...', desc: 'Define the type of the ordering process.'})
  .set('orderDesc', {mandatory: false, label: 'Order', placeholder: 'order URL', desc: 'Webpage through which an order for the Resource can be placed.'})
// Financial Information //
  .set('paymentModelDesc', {mandatory: false, label: 'Payment Model', placeholder: 'payment model URL', desc: 'Webpage with the supported payment models for the Resource and restrictions that apply to each of them.'})
  .set('pricingDesc', {mandatory: false, label: 'Pricing', placeholder: 'pricing URL', desc: 'Webpage with the information on the price scheme for the Resource in case the customer is charged for.'})
;

