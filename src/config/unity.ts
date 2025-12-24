// Centralized Unity WebGL configuration for react-unity-webgl
// Allows environment-driven setup while providing sensible defaults for local development.
//
// Environment variables supported:
// - NEXT_PUBLIC_UNITY_CONFIG_JSON: Full URL to the Unity WebGL Build.json (recommended)
// - NEXT_PUBLIC_UNITY_LOADER_URL, NEXT_PUBLIC_UNITY_DATA_URL,
//   NEXT_PUBLIC_UNITY_FRAMEWORK_URL, NEXT_PUBLIC_UNITY_CODE_URL: Explicit asset URLs if not using JSON config
// - NEXT_PUBLIC_UNITY_RELAY_GAMEOBJECT: GameObject name to receive join messages (default: "RelayConnector")
// - NEXT_PUBLIC_UNITY_RELAY_JOIN_METHOD: Method name to invoke with join code (default: "JoinWithCode")
//
export type UnityPaths = {
  unityConfigJson?: string | null;
  loaderUrl?: string | null;
  dataUrl?: string | null;
  frameworkUrl?: string | null;
  codeUrl?: string | null;
  useJsonConfig?: boolean;
};

export const unityPaths: UnityPaths = {
  unityConfigJson: undefined,
  loaderUrl: process.env.NEXT_PUBLIC_UNITY_LOADER_URL ?? null,
  dataUrl: process.env.NEXT_PUBLIC_UNITY_DATA_URL ?? null,
  frameworkUrl: process.env.NEXT_PUBLIC_UNITY_FRAMEWORK_URL ?? null,
  codeUrl: process.env.NEXT_PUBLIC_UNITY_CODE_URL ?? null,
};

export const unityRelayConfig = {
  gameObjectName: process.env.NEXT_PUBLIC_UNITY_RELAY_GAMEOBJECT ?? "RelayConnector",
  joinMethodName: process.env.NEXT_PUBLIC_UNITY_RELAY_JOIN_METHOD ?? "JoinWithCode",
};

// Increment this version when you update the Unity build in public/unity/Build
// This ensures browsers (and the Unity loader) pick up the new files while avoiding
// cache flooding issues caused by random/timestamp-based cache busting on every reload.
export const unityBuildVersion = "1.0.1";

export const getDefaultUnityConfigJson = (): string => {
  // Default local path where you can place the Unity WebGL build.
  // For example, copy your WebGL build into public/UnityBuild and set this to "/UnityBuild/Build.json".
  return "/UnityBuild/Build.json";
};

// Public User API base used by the React app and passed into Unity WebGL so GameSessionClient can resolve packs and post results.
// IMPORTANT: Set this to the host + port ONLY (e.g., http://localhost:5001). Do NOT include "/api" here.
export const userApiBase = process.env.NEXT_PUBLIC_USER_API_URL ?? "https://localhost:5051";