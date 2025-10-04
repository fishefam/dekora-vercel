import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  moduleNameMapper: {
    "^@/components/icons$": "lucide-react",
    "^@sb/(.*)$": "<rootDir>/supabase/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
  },

  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/e2e/",
  ],

  // ✅ allow ESM packages like jose to be transformed
  transformIgnorePatterns: ["node_modules/(?!jose/.*)"],

  // ✅ only add non-default extensions
  extensionsToTreatAsEsm: [".ts", ".tsx"],

  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        useESM: true, // 👈 required for jose + TS ESM
      },
    ],
  },
};

export default createJestConfig(customJestConfig);
