/*
  Founder OS — Çekirdek veri modeli
  Bu tipler tüm modüllerin ortak sözleşmesidir. Supabase şeması da bunlara birebir karşılık gelecek.
*/

// ---- Ortak ----
export type ID = string;
export type ISODate = string;

export interface Member {
  id: ID;
  name: string;
  email: string;
  avatarColor: string;
  role: "owner" | "member";
}

// ---- Projeler ----
export type Stage = "idea" | "mvp" | "payment" | "beta" | "live" | "archived";
export type Health = "good" | "warn" | "risk";
export type Priority = "p0" | "p1" | "p2" | "p3";
export type Platform = "web" | "ios" | "android" | "api" | "desktop";

export interface Project {
  id: ID;
  name: string;
  icon: string; // phosphor icon name
  logoUrl?: string; // base64 veya url — yüklenmiş logo
  color: string;
  description: string;
  stage: Stage;
  health: Health;
  priority: Priority;
  ownerId: ID;
  platform: Platform;
  techStack: string[];
  repoUrl?: string;
  liveUrl?: string;
  localPath?: string;
  startedAt: ISODate;
  targetLaunch?: ISODate;
  progress: number; // 0-100 (alt görevlerden otomatik de hesaplanabilir)
  mrr: number; // aylık gelir
  monthlyCost: number;
  starred: boolean;
  archived: boolean;
  tags: string[];
  goalIds: ID[];
}

// ---- Görevler ----
export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done";

export interface Task {
  id: ID;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  projectId?: ID;
  assigneeId?: ID;
  parentId?: ID; // alt görev
  dependsOn: ID[]; // bağımlılıklar
  dueDate?: ISODate;
  estimateHours?: number;
  tags: string[];
  recurring?: "daily" | "weekly" | "monthly" | null;
  checklistTemplateId?: ID;
  createdAt: ISODate;
  completedAt?: ISODate;
  order: number;
}

// ---- Doküman / Sayfa (Notion-kalite blok editör) ----
export type BlockType =
  | "text"
  | "h1"
  | "h2"
  | "h3"
  | "bullet"
  | "numbered"
  | "todo"
  | "quote"
  | "code"
  | "divider"
  | "callout"
  | "toggle"
  | "image"
  | "embed";

export interface Block {
  id: ID;
  type: BlockType;
  content: string;
  checked?: boolean;
  children?: Block[]; // toggle
  lang?: string; // code
  url?: string; // image/embed
}

export interface Page {
  id: ID;
  title: string;
  icon: string;
  cover?: string;
  parentId?: ID; // iç içe sayfalar
  projectId?: ID;
  blocks: Block[];
  kind: "doc" | "wiki" | "meeting" | "decision";
  createdAt: ISODate;
  updatedAt: ISODate;
  favorite: boolean;
  authorId: ID;
}

// ---- Hedefler / OKR ----
export interface KeyResult {
  id: ID;
  label: string;
  current: number;
  target: number;
  unit: string;
}

export interface Goal {
  id: ID;
  title: string;
  description: string;
  quarter: string; // "2026-Q3"
  ownerId: ID;
  keyResults: KeyResult[];
  projectIds: ID[];
  status: "on_track" | "at_risk" | "off_track" | "done";
}

// ---- Launch / Şirketleşme Checklist ----
export interface ChecklistItem {
  id: ID;
  label: string;
  done: boolean;
  critical?: boolean;
}

export interface ChecklistTemplate {
  id: ID;
  name: string;
  description: string;
  icon: string;
  category: "web_saas" | "ios" | "company" | "marketing" | "custom";
  items: Omit<ChecklistItem, "done">[];
}

export interface ProjectChecklist {
  id: ID;
  projectId: ID;
  templateId: ID;
  name: string;
  items: ChecklistItem[];
}

// ---- Finans ----
export interface Expense {
  id: ID;
  name: string;
  amount: number;
  cadence: "monthly" | "yearly" | "once";
  category: "infra" | "api" | "domain" | "tooling" | "tax" | "other";
  projectId?: ID;
  nextDue?: ISODate;
}

// ---- Otomasyon ----
export interface AutomationRule {
  id: ID;
  name: string;
  enabled: boolean;
  trigger: string; // "task.status = done"
  action: string; // "checklist.complete"
  runs: number;
}

// ---- Aktivite / Bildirim ----
export interface Activity {
  id: ID;
  actorId: ID;
  verb: string;
  targetType: "project" | "task" | "page" | "goal";
  targetId: ID;
  targetLabel: string;
  at: ISODate;
}

export interface Notification {
  id: ID;
  title: string;
  body: string;
  read: boolean;
  at: ISODate;
  link?: string;
  kind: "mention" | "assign" | "due" | "system";
}

// ---- Snippet kütüphanesi (İkinci Beyin) ----
export interface Snippet {
  id: ID;
  title: string;
  body: string;
  lang: string;
  category: "code" | "prompt" | "copy" | "asset";
  tags: string[];
}

// ---- Prompt koleksiyonları ----
export interface PromptItem {
  id: ID;
  title: string;
  body: string;
  createdAt: ISODate;
}

export interface PromptCollection {
  id: ID;
  name: string;
  description: string;
  icon: string;
  color: string;
  projectId?: ID;
  tags: string[];
  prompts: PromptItem[];
  createdAt: ISODate;
}

// ---- Env keyleri ----
// Bir grup birden fazla anahtar tutabilir (örn. Supabase → URL + anon + service key).
export interface EnvField {
  id: ID;
  key: string;   // PROJECT_URL
  value: string; // https://...
}

export interface EnvKey {
  id: ID;
  name: string;        // grup adı: "Supabase" veya tekil key adı
  fields: EnvField[];  // bir veya birden fazla anahtar
  projectId?: ID;
  env: "development" | "production" | "shared";
  note?: string;
  // geriye uyumluluk (eski tekil alanlar) — yeni kayıtlarda kullanılmaz
  value?: string;
}

// ---- Şifreler / kimlik bilgileri ----
// Bir kayıt birden fazla gizli alan tutabilir (örn. şifre + 2FA yedek + API token).
export interface CredentialField {
  id: ID;
  label: string;   // "Şifre", "2FA yedek kod", "Recovery"
  value: string;
  secret: boolean; // gizlensin mi (maskelensin mi)
}

export interface Credential {
  id: ID;
  label: string; // GitHub
  icon: string;
  username?: string;
  url?: string;
  category: "account" | "service" | "card" | "other";
  fields: CredentialField[]; // bir veya birden fazla alan
  note?: string;
  // geriye uyumluluk
  secret?: string;
}

// ---- Fikirler ----
export interface Idea {
  id: ID;
  title: string;
  body: string;
  status: "spark" | "exploring" | "validated" | "building" | "parked";
  impact: 1 | 2 | 3; // düşük/orta/yüksek
  effort: 1 | 2 | 3;
  tags: string[];
  createdAt: ISODate;
}

// ---- View tanımı ----
export type ViewKind = "board" | "table" | "calendar" | "timeline" | "list" | "goals";

export interface SavedView {
  id: ID;
  name: string;
  kind: ViewKind;
  filter?: Record<string, unknown>;
  groupBy?: string;
}
