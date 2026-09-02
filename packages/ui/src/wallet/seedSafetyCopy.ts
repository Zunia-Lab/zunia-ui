/**
 * Shared recovery-phrase safety copy for Zunia clients.
 * Keep short: Design onboarding uses one tip + two acks, not essay blocks.
 */
export const SEED_SAFETY = {
  title: "Protect your phrase",
  summary:
    "Anyone with these words controls the wallet. Zunia cannot reset a lost phrase.",
  bullets: [
    "Never share it. Support will never ask for it.",
    "Store it offline. Screenshots and cloud notes are unsafe.",
  ],
  ackUnderstand: "I will never share my recovery phrase with anyone.",
  ackBackup:
    "I accept that Zunia cannot recover a lost phrase, and I will keep an offline backup.",
  ackPhishing: "I will treat any request for my phrase as hostile.",
  deviceNote: "Keys stay on this device. Session clears when you lock.",
  wordLengthHint: "12 words is standard. 24 words adds entropy.",
} as const;

export type SeedAckKey = "understand" | "backup";

export const SEED_ACK_KEYS: SeedAckKey[] = ["understand", "backup"];

export function seedAckLabel(key: SeedAckKey): string {
  switch (key) {
    case "understand":
      return SEED_SAFETY.ackUnderstand;
    case "backup":
      return SEED_SAFETY.ackBackup;
  }
}
