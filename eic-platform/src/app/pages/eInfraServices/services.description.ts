export class Description {
    desc: string;
    label: string;
    mandatory?: boolean;
    recommended?: boolean;
}
export const urlDesc = {label: "url", mandatory: true, desc: "Link to a url providing information about the service. This url is usually hosted and maintained by the service providers. It contains fresh and additional information, such as what APIs are supported or links to the documentation"};
export const nameDesc = {label: "name", mandatory: true, desc: "Brief marketing name of service as assigned by the service providers. Should be descriptive from a customer point of view, and should be quite simple, such that someone non-technical is able to understand what the service is about"};
export const taglineDesc = {label: "tagline", mandatory: false, desc: "Catchline or slogan of service for marketing/advertising purposes."};
export const descriptionDesc = {label: "description", mandatory: true, desc: 'High-level description of what the service does in terms of functionality it provides and the resources it enables access to. Should be similar to the name described above, and should cover the value provided by the service, in fairly non-technical terms. These descriptions may seem obvious but help everyone within the organization understand the service, and also will be needed for the Service Catalogue, which will be shown to users and customers. It may provide also information related to the offered capacity, number of installations, underlying data that is offered'};
export const optionsDesc = {label: "options", mandatory: false, desc: 'A choice of utility and warranty that the customer can/should specify when commissioning the service'};
export const targetUsersDesc = {label: "target Users", mandatory: false, desc: 'Type of users or end-users allowed to commission/benefit from the service'};
export const userValueDesc = {label: "user Value", mandatory: false, desc: "The benefit to a customer and their users delivered by the service. Benefits are usually related to alleviating pains (e.g., eliminate undesired outcomes, obstacles or risks) or producing gains (e.g. increased performance, social gains, positive emotions or cost saving)"};
export const userBaseDesc = {label: "user Base", mandatory: false, desc: "List of customers, communities, etc using the service"};
export const symbolDesc = {label: "symbol", mandatory: true, desc: "Link to a visual representation for the service. If none exists, providers are urged to use the organization's symbol"};
export const multimediaURLDesc = {label: "multimedia URL", mandatory: false, desc: "Link to a page containing multimedia regarding the service"};
export const providersDesc = {label: "providers", mandatory: true, desc: "Organisation that manages and delivers the service and with whom the customer signs the SLA"};
export const versionDesc = {label: "version", mandatory: true, desc: "Informs about the implementation of the service that is in force as well as about its previous implementations, if any"};
export const lastUpdateDesc = {label: "date of Last Update", mandatory: true, desc: "The date of the latest update"};
export const changeLogDesc = {label: "change Log", mandatory: false, desc: "A list of the service features added in the latest version"};
export const validForDesc = {label: "valid Until", mandatory: false, desc: "The date up to which the service description is valid"};
export const lifeCycleStatusDesc = {label: "lifeCycleStatus", mandatory: true, desc: "Is used to tag the service to the full service cycle: e.g., discovery, alpha (prototype available for closed set of users), beta (service being developed while available for testing publicly), production, retired (not anymore offered)"};
export const trlDesc = {label: "trl", mandatory: true, desc: "Is used to tag the service to the Technology Readiness Level"};
export const categoryDesc = {label: "category", mandatory: true, desc: "A named group of services that offer access to the same type of resource. These are external ones that are of interest to a customer"};
export const subcategoryDesc = {label: "subcategory", mandatory: true, desc: "Type of service within a category"};
export const placesDesc = {label: "places", mandatory: true, desc: "List of countries within which the service is available"};
export const languagesDesc = {label: "languages", mandatory: true, desc: "List of languages in which the service is available"};
export const tagsDesc = {label: "tags", mandatory: false, desc: "Field to facilitate searching based on keywords"};
export const requiredServicesDesc = {label: "required Services", mandatory: false, desc: "Other services that are required with this service"};
export const relatedServicesDesc = {label: "related Services", mandatory: false, desc: "Other services that are commonly used with this service"};
export const orderDesc = {label: "order", mandatory: true, desc: "URL for requesting the service from the service providers"};
export const helpdeskDesc = {label: "helpdesk", mandatory: false, desc: "URL of the contact page to ask more information from the service providers about this service. A contact person or helpdesk within the organization must be assigned for communications, questions and issues relating to the service"};
export const userManualDesc = {label: "user Manual", mandatory: false, desc: "URL for the user manual and documentation"};
export const trainingInformationDesc = {label: "Training", mandatory: false, desc: "URL for training information"};
export const feedbackDesc = {label: "feedback", mandatory: false, desc: "URL of the feedback page of the service"};
export const priceDesc = {label: "price", mandatory: false, desc: "URL of the page with payment models that apply, the cost in Euros and any restrictions that may apply."};
export const serviceLevelAgreementDesc = {label: "SLA", mandatory: true, desc: "URL of the page containing information about the levels of performance that a service providers is expected to achieve. Current service agreements (SLAs) available for the service or basis for a new SLA. These should be agreements with users (not providers)"};
export const termsOfUseDesc = {label: "terms Of Use", mandatory: false, desc: "URLs of the pages containing the rules, service conditions and usage policy which one must agree to abide by in order to use the service"};
export const fundingDesc = {label: "funding Sources", mandatory: false, desc: "Sources of funding for the development and operation of the service"};

// new service provider form fields
export const organizationNameDesc = {label: "Name of your service provider", mandatory: true, desc: ""};
export const organizationIdDesc = {label: "Choose an id for your service provider, this cannot be changed later", mandatory: true, desc: "e.g. openaire, egi etc (a short id without spaces)."};
export const firstNameDesc = {label: "First name", mandatory: true, desc: ""};
export const lastNameDesc = {label: "Last name", mandatory: true, desc: ""};
export const emailDesc = {label: "Email address", mandatory: true, desc: ""};
export const phoneNumberDesc = {label: "Contact information (phone number)", mandatory: false, desc: ""};
export const organizationWebsiteDesc = {label: "The website of your organisation", mandatory: true, desc: "note. Include \'http://\' or \'https://\' to the url."};
export const catalogueOfResourcesDesc = {label: "Do you have a public catalogue of resources (services, data, apps, software, etc.) you are providing/offering? If yes, what is its public URL? If not publicly available, can you send us a link to the catalogue in any form?", mandatory: false, desc: ""};
export const publicDescOfResourcesDesc = {label: "Do you maintain publicly a detailed description of resources (services, data, apps, software, etc.) you are providing/offering? If yes, what is its public URL? If not publicly available, can you send us a link to a description of a service or resource in any form?", mandatory: false, desc: ""};
export const additionalInfoDesc = {label: "Would you like to provide us with any additional information about your organisation or the services/resources your provide/offer?", mandatory: true, desc: ""};
export const logoUrlDesc = {label: "Logo Url", mandatory: false, desc: "note. Include \'https://\' to the url."};
/*export const logoUrlDesc = {label: "Logo Url", mandatory: false, desc: "Please enter a valid url address and make sure that the maximum size of the uploaded image is width=360px, height=240px"};*/
