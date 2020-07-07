import * as dotenv from "dotenv";

dotenv.config();

[
  "NODE_ENV",
  "PORT",
  "POSTGRES_HOST",
  "POSTGRES_USER",
  "POSTGRES_PASS",
  "POSTGRES_DB",
  "GOOGLE_CAPTCHA_SECRET",
  "CORS_DOMAINS",
  "SENTRY_DSN",
  "SENDGRID_API_KEY",
  "JWT_SECRET"
].forEach(name => {
  if (!process.env[name]) {
    if (process.env.NODE_ENV == "development") {
      return;
    }
    throw new Error(`Environment variable ${name} is missing`);
  }
});
// for prod

const config = {
  env: process.env.NODE_ENV,
  postgres: {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    db: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    pass: process.env.POSTGRES_PASS
  },
  server: {
    port: Number(process.env.PORT) || 3000,
    corsDomains: process.env.CORS_DOMAINS.split(",")
  },
  google: {
    captchaSecet: process.env.GOOGLE_CAPTCHA_SECRET
  },
  sendGrid: {
    secret: process.env.SENDGRID_API_KEY,
    unsubscribeGroups: {
      information: 17089 // Information group
    },
    emailAddresses: {
      noreply: "noreply@iamlanistar.com",
      social: "social@iamlanistar.com",
      info: "info@iamlanistar.com"
    },
    dynamicTemplates: {
      influencerMagicLink: "d-1dc5046741054b7793a015fe51e479db",
      influencerRegister: "d-6cd6e9d0ab5e4c159fd6cf5335ca51ee",
      influencerInvite: "d-edfa9e63ddd844c69240d8e7fa1e2b09",
      contactEmail: "d-47089cd0010e44b19b8a6ac629a42a95",
      s_2: "d-87e3777b5c5745fa968c3989b6bcd496",
      s_7: "d-60dd14a2385e4700ac826bc8f5febfcd",
      s_8: "d-d572719ff5da4f11bcadfe67a0e8d372",
      s_3: "d-cb7cb861fcc641f4b3352e059aadefc0",
    }
  },
  sentry: {
    dsn: process.env.SENTRY_DSN
  },
  jwt: {
    secret: process.env.JWT_SECRET
  }
};

export default config;
