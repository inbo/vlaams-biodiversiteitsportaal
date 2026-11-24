const envs = {
  local: {
    baseUrl: "http://localhost",
    keycloakAuthUrl: "http://localhost:9999/mock-oauth2",
    vlaanderenAuthUrl: "http://localhost:9999/mock-oauth2",
  },
  dev: {
    baseUrl: "https://natuurdata.dev.inbo.be",
    keycloakAuthUrl: "https://auth-dev.inbo.be",
    vlaanderenAuthUrl: "https://authenticatie-ti.vlaanderen.be/",
  },
  uat: {
    baseUrl: "https://natuurdata.uat.inbo.be",
    keycloakAuthUrl: "https://auth-uat.inbo.be",
    vlaanderenAuthUrl: "https://authenticatie-ti.vlaanderen.be/",
  },
  prod: {
    baseUrl: "https://natuurdata.inbo.be",
    keycloakAuthUrl: "https://auth.inbo.be",
    vlaanderenAuthUrl: "https://authenticatie.vlaanderen.be/",
  },
} as const;

export type TargetEnv = keyof typeof envs;

const targetEnv = (process.env.E2E_TARGET_ENV || "prod") as TargetEnv;
if (!(targetEnv in envs)) {
  throw new Error(
    `Unknown E2E_TARGET_ENV '${targetEnv}', expected one of ${Object.keys(envs).join(", ")}`,
  );
}

export const env = {
  TARGET_ENV: targetEnv,
  BASE_URL: envs[targetEnv].baseUrl,
  KEYCLOAK_AUTH_URL: envs[targetEnv].keycloakAuthUrl,
  VLAANDEREN_AUTH_URL: envs[targetEnv].vlaanderenAuthUrl,
  // Creating/deleting lists and datasets is opt-in, to avoid piling up test data
  ENABLE_MUTATION_TESTS: process.env.E2E_ENABLE_MUTATION_TESTS === "true",
  VBP_USERNAME: process.env.E2E_VBP_USERNAME ?? "",
  VBP_PASSWORD: process.env.E2E_VBP_PASSWORD ?? "",
};

export const isProd = env.TARGET_ENV === "prod";

/** Storage state of the logged-in default user, written by auth.setup.ts */
export const AUTH_FILE = ".auth/user.json";
