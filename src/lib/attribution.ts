export interface AttributionConfig {
  attrEmailOpenDays: string; // e.g. "5 dias", "7 dias", "14 dias"
  attrEmailClickDays: string; // e.g. "14 dias", "7 dias", "30 dias"
  attrSmsDeliveredHours: string;
  attrSmsClickDays: string;
  attrExcludeTransactional: boolean;
  attrExcludeEmailBots: boolean;
  attrExcludeSmsBots: boolean;
  attrExcludeAppleMpp: boolean;
}

export const DEFAULT_ATTRIBUTION_CONFIG: AttributionConfig = {
  attrEmailOpenDays: "5 dias",
  attrEmailClickDays: "14 dias",
  attrSmsDeliveredHours: "24 horas",
  attrSmsClickDays: "7 dias",
  attrExcludeTransactional: false,
  attrExcludeEmailBots: false,
  attrExcludeSmsBots: false,
  attrExcludeAppleMpp: false
};

export function getAttributionConfig(): AttributionConfig {
  if (typeof window === "undefined") return DEFAULT_ATTRIBUTION_CONFIG;
  try {
    const raw = localStorage.getItem("realizzare_attribution_config");
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_ATTRIBUTION_CONFIG, ...parsed };
    }
  } catch (e) {}
  return DEFAULT_ATTRIBUTION_CONFIG;
}

export function parseDaysFromSetting(settingStr: string, fallback = 7): number {
  if (!settingStr) return fallback;
  const match = settingStr.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : fallback;
}

export function getEmailAttributionSummary(): { windowLabel: string; openDays: number; clickDays: number } {
  const config = getAttributionConfig();
  const clickDays = parseDaysFromSetting(config.attrEmailClickDays, 14);
  const openDays = parseDaysFromSetting(config.attrEmailOpenDays, 5);
  
  const windowLabel = config.attrEmailClickDays || `${clickDays} dias`;
  
  return {
    windowLabel,
    openDays,
    clickDays
  };
}

/**
 * Calculates whether a purchase event is attributed to an email campaign or automation interaction
 * based on the Last-Touch model within the configured attribution window.
 */
export function isPurchaseAttributedToEmail(
  purchaseTimestampMs: number,
  lastInteraction: { type: "click" | "open"; timestampMs: number } | null,
  config: AttributionConfig = getAttributionConfig()
): boolean {
  if (!lastInteraction) return false;

  const clickDays = parseDaysFromSetting(config.attrEmailClickDays, 14);
  const openDays = parseDaysFromSetting(config.attrEmailOpenDays, 5);

  const windowDays = lastInteraction.type === "click" ? clickDays : openDays;
  const windowMs = windowDays * 24 * 60 * 60 * 1000;

  const diffMs = purchaseTimestampMs - lastInteraction.timestampMs;

  return diffMs >= 0 && diffMs <= windowMs;
}
