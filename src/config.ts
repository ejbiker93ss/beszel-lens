export interface AppSettings {
  BeszelLens?: {
    HubUrl?: string
    RefreshIntervalSeconds?: number
    ListenPort?: number
  }
}

export interface ResolvedAppSettings {
  BeszelLens: {
    HubUrl: string
    RefreshIntervalSeconds: number
    ListenPort: number
  }
}

const defaults: ResolvedAppSettings = {
  BeszelLens: {
    HubUrl: "",
    RefreshIntervalSeconds: 60,
    ListenPort: 8080,
  },
}

export async function loadAppSettings(): Promise<ResolvedAppSettings> {
  try {
    const response = await fetch("/appsettings.json", { cache: "no-store" })
    if (!response.ok) return defaults
    const settings = await response.json() as AppSettings
    return {
      BeszelLens: {
        HubUrl: settings.BeszelLens?.HubUrl?.trim() ?? defaults.BeszelLens.HubUrl,
        RefreshIntervalSeconds: settings.BeszelLens?.RefreshIntervalSeconds ?? defaults.BeszelLens.RefreshIntervalSeconds,
        ListenPort: settings.BeszelLens?.ListenPort ?? defaults.BeszelLens.ListenPort,
      },
    }
  } catch {
    return defaults
  }
}
