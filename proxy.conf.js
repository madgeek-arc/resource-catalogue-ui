const PROXY_CONFIG = [
  {
    context: ["/api/**"],
    target: "http://localhost:8080/",
    secure: false,
    changeOrigin: true,
    logLevel: "debug"
  },
  {
    context: ["/provider_insights_api/*"],
    target: "https://darelab.imsi.athenarc.gr/",
    secure: true,
    changeOrigin: true,
    logLevel: "debug"
  },
  {
    context: ["/v1/auto_completion/*"],
    target: "http://dl051.madgik.di.uoa.gr:4559/",
    secure: false,
    changeOrigin: true,
    logLevel: "debug"
  }
];

module.exports = PROXY_CONFIG;
