import { merge } from "lodash";

enum Environment {
  local = "local",
  dev = "dev",
  uat = "uat",
  prod = "prod",
}
const environment: string = process.env.NODE_ENV === "development"
  ? Environment.local
  : "::ENVIRONMENT::";

const defaultConfig = {
  domain: "http://localhost",
  enabledLangs: ["nl", "en"],
  auth: {
    // Replaced by terraform when deploying to the specific environment
    oidc: {
      authority: process.env.NODE_ENV === "development"
        ? "http://localhost:9999/mock-oauth2/"
        : "::KEYCLOAK_URL::",
      clientId: process.env.NODE_ENV === "development"
        ? "http://localhost:9999/mock-oauth2/"
        : "::KEYCLOAK_CLIENT_ID::",
      prompt: process.env.NODE_ENV === "development" ? "login" : undefined,
    },
    ala: {
      authCookieName: "VBP-AUTH",
      authCookieDomain: "localhost",
      loginClass: "signedIn",
      logoutClass: "signedOut",
    },
  },
  pictureCarousel: {
    interval: 10_000,
    speciesListId: "dr1",
  },
  monitoring: {
    awsRegion: "::AWS_REGION::",
    awsRumAppId: "::AWS_RUM_APP_ID::",
    awsRumEndpoint: "https://dataplane.rum.::AWS_REGION::.amazonaws.com",
    awsCognitoIdentityPoolId: "::AWS_COGNITO_IDENTITY_POOL_ID::",
  },
  appVersion: import.meta.env.VITE_APP_VERSION || "dev",
};

const environmentConfig: Record<Environment, object> = {
  local: {
    domain: "http://localhost",
    pictureCarousel: {
      speciesListId: "dr383",
    },
    auth: {
      ala: {
        authCookieDomain: "localhost",
      },
    },
  },
  dev: {
    domain: "https://natuurdata.dev.inbo.be",
    auth: {
      ala: {
        authCookieDomain: ".natuurdata.dev.inbo.be",
      },
    },
    pictureCarousel: {
      speciesListId: "dr383",
    },
  },
  uat: {
    domain: "https://natuurdata.uat.inbo.be",
    auth: {
      ala: {
        authCookieDomain: ".natuurdata.uat.inbo.be",
      },
    },
    pictureCarousel: {
      speciesListId: "dr1",
    },
  },
  prod: {
    domain: "https://natuurdata.inbo.be",
    auth: {
      ala: {
        authCookieDomain: ".natuurdata.inbo.be",
      },
    },
    pictureCarousel: {
      speciesListId: "dr1",
    },
  },
};

const settings = merge(
  defaultConfig,
  environmentConfig[environment as Environment],
);

const DEFAULT_OCCURRENCE_YEAR_MIN = 1990;
const DEFAULT_OCCURRENCE_YEAR_MAX = 2026;

type NoUiSliderHandle = {
  updateOptions?: (options: { range: { min: number; max: number } }) => void;
  set?: (values: [number, number]) => void;
};

function parseYearRangeFromFq(url: URL): { start: number; end: number } | null {
  const fqParams = url.searchParams.getAll("fq");
  for (const fq of fqParams) {
    const match = fq.match(/year:\[(\d+)\s+TO\s+(\d+)\]/);
    if (match) {
      return {
        start: Number.parseInt(match[1], 10),
        end: Number.parseInt(match[2], 10),
      };
    }
  }

  return null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function applyOccurrenceYearSliderDefaults(): void {
  if (!window.location.pathname.includes("/biocache-hub/occurrences/search")) {
    return;
  }

  const url = new URL(window.location.href);
  const rangeFromUrl = parseYearRangeFromFq(url);
  if (
    rangeFromUrl &&
    (rangeFromUrl.start < DEFAULT_OCCURRENCE_YEAR_MIN ||
      rangeFromUrl.end > DEFAULT_OCCURRENCE_YEAR_MAX)
  ) {
    return;
  }

  const startInput = document.getElementById("startYearInput") as HTMLInputElement | null;
  const endInput = document.getElementById("endYearInput") as HTMLInputElement | null;
  const startHidden = document.getElementById("startYear") as HTMLInputElement | null;
  const endHidden = document.getElementById("finishYear") as HTMLInputElement | null;
  const slider = document.getElementById("yearSlider") as (HTMLElement & {
    noUiSlider?: NoUiSliderHandle;
  }) | null;

  if (!startInput || !endInput || !startHidden || !endHidden || !slider?.noUiSlider) {
    return;
  }

  const desiredStart = clamp(
    rangeFromUrl?.start ?? DEFAULT_OCCURRENCE_YEAR_MIN,
    DEFAULT_OCCURRENCE_YEAR_MIN,
    DEFAULT_OCCURRENCE_YEAR_MAX,
  );
  const desiredEnd = clamp(
    rangeFromUrl?.end ?? DEFAULT_OCCURRENCE_YEAR_MAX,
    DEFAULT_OCCURRENCE_YEAR_MIN,
    DEFAULT_OCCURRENCE_YEAR_MAX,
  );

  startInput.min = String(DEFAULT_OCCURRENCE_YEAR_MIN);
  endInput.min = String(DEFAULT_OCCURRENCE_YEAR_MIN);
  startInput.max = String(DEFAULT_OCCURRENCE_YEAR_MAX);
  endInput.max = String(DEFAULT_OCCURRENCE_YEAR_MAX);
  startInput.value = String(desiredStart);
  endInput.value = String(desiredEnd);
  startHidden.value = String(desiredStart);
  endHidden.value = String(desiredEnd);

  slider.noUiSlider.updateOptions?.({
    range: {
      min: DEFAULT_OCCURRENCE_YEAR_MIN,
      max: DEFAULT_OCCURRENCE_YEAR_MAX,
    },
  });
  slider.noUiSlider.set?.([desiredStart, desiredEnd]);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", applyOccurrenceYearSliderDefaults);
} else {
  applyOccurrenceYearSliderDefaults();
}

console.debug(
  `Loaded settings for environment: ${environment}`,
  settings,
);

export default settings;
