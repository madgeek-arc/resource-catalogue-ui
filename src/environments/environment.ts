// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  beta: false,
  MATOMO_URL: 'https://providers.eosc-portal.eu/matomo/',
  MATOMO_SITE: 3,
  FAQ_ENDPOINT: 'https://dl105.madgik.di.uoa.gr/faq/api',
  API_ENDPOINT: '/api', // to change the end point go to proxy.conf.json file
  API_LOGIN: '/api/login',
  API_LOGOUT: '/api/logout',
  STATS_ENDPOINT: 'https://providers.eosc-portal.eu/stats-api/',
  projectName: 'EOSC',
  projectMail: 'support@sandbox.eosc-beyond.eu',
  serviceORresource: 'Service',
  hasUserConsent: true,
  privacyPolicyURL: './comingSoon',
  onboardingAgreementURL: './comingSoon',
  // marketplaceServicesURL: 'https://marketplace-beta.docker-fid.grid.cyf-kr.edu.pl/services/',
  // marketplaceDatasourcesURL: 'https://marketplace-beta.docker-fid.grid.cyf-kr.edu.pl/datasources/',
  marketplaceServicesURL: './comingSoon',
  marketplaceDatasourcesURL: './comingSoon',
  marketplaceTrainingResourcesURL: './comingSoon',
  API_TOKEN_ENDPOINT: 'https://core-proxy.sandbox.eosc-beyond.eu/providers-api/',
  INSIGHTS_ENDPOINT: 'provider_insights_api/v1/statistics/rs',
  AUTOCOMPLETION_ENDPOINT: 'v1/auto_completion',
  showHelpContent: false,
  MONITORING_URL: './comingSoon'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
