import type {
  AppData,
  FridgeItem,
  ProfileState,
  ShoppingListItem,
} from "@/lib/types";

export type SectionKey =
  | "overview"
  | "nutrition"
  | "recipes"
  | "chat"
  | "fridge"
  | "shopping"
  | "voice";

export type AuthMode = "login" | "register";

export type ChatItem = {
  id?: string;
  role: "user" | "assistant";
  content: string;
};

export type SpeechRecognitionResultLike = {
  transcript: string;
};

export type SpeechRecognitionEventLike = {
  results: SpeechRecognitionResultLike[][];
};

export type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: null | (() => void);
  onresult: null | ((event: SpeechRecognitionEventLike) => void);
  onerror: null | (() => void);
  onend: null | (() => void);
  start: () => void;
  stop: () => void;
};

export type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

export type AppStateResponse = {
  profile: ProfileState;
  daily_intake_records: Array<AppData["daily_intake_records"][number] & { id?: string }>;
  fridge_inventory: Array<FridgeItem & { id?: string }>;
  shopping_items: ShoppingListItem[];
  chat_messages: ChatItem[];
};

export const sectionLabels: Record<SectionKey, string> = {
  overview: "总览",
  nutrition: "营养分析",
  recipes: "智能食谱",
  chat: "AI 对话",
  fridge: "冰箱库存",
  shopping: "采购清单",
  voice: "语音交互",
};

export const initialIntakeForm = {
  vegetables: 320,
  fruits: 180,
  meat: 90,
  eggs: 40,
};

export const voiceRecognitionCtor =
  typeof window !== "undefined"
    ? (window as Window & {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      }).SpeechRecognition ||
      (window as Window & {
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
      }).webkitSpeechRecognition
    : undefined;
