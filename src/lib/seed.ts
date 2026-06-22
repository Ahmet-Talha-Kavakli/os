import type {
  Member, Project, Task, Page, Goal, ChecklistTemplate, ProjectChecklist,
  Expense, AutomationRule, Activity, Notification, Snippet,
  PromptCollection, EnvKey, Credential, Idea,
} from "./types";

// ---- Workspace üyeleri (sen + ortağın) ----
export const MEMBERS: Member[] = [
  { id: "m1", name: "Sen", email: "you@founder.os", avatarColor: "#2e7cf6", role: "owner" },
  { id: "m2", name: "Ortağım", email: "partner@founder.os", avatarColor: "#c69a3f", role: "member" },
];

// ---- Boş başlangıç: her şeyi elle gireceksin ----
export const PROJECTS: Project[] = [];
export const TASKS: Task[] = [];
export const PAGES: Page[] = [];
export const GOALS: Goal[] = [];
export const PROJECT_CHECKLISTS: ProjectChecklist[] = [];
export const EXPENSES: Expense[] = [];
export const AUTOMATIONS: AutomationRule[] = [];
export const ACTIVITIES: Activity[] = [];
export const NOTIFICATIONS: Notification[] = [];
export const SNIPPETS: Snippet[] = [];
export const PROMPT_COLLECTIONS: PromptCollection[] = [];
export const ENV_KEYS: EnvKey[] = [];
export const CREDENTIALS: Credential[] = [];
export const IDEAS: Idea[] = [];

// ---- Launch / Şirketleşme checklist ŞABLONLARI ----
// Bunlar veri değil, yeniden kullanılabilir hazır şablonlar. Yeni projeye
// tek tıkla eklenir. İstemezsen Launch Merkezi'nden kullanmazsın.
export const CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  {
    id: "tpl_web", name: "Web SaaS Yayın", description: "Bir web SaaS'ı yayına almak için tam liste",
    icon: "Globe", category: "web_saas",
    items: [
      { id: "w1", label: "Domain alındı & DNS bağlandı", critical: true },
      { id: "w2", label: "Ödeme entegrasyonu (Stripe/iyzico)", critical: true },
      { id: "w3", label: "KVKK / Gizlilik & Kullanım koşulları", critical: true },
      { id: "w4", label: "Analytics & event tracking" },
      { id: "w5", label: "SEO meta + sitemap + OG görseller" },
      { id: "w6", label: "Landing page + fiyatlandırma sayfası" },
      { id: "w7", label: "E-posta (transactional) kurulumu" },
      { id: "w8", label: "Hata izleme (Sentry vb.)" },
      { id: "w9", label: "Production env & secrets" },
      { id: "w10", label: "Yedekleme & DB migration planı" },
    ],
  },
  {
    id: "tpl_ios", name: "iOS Yayın", description: "App Store'a çıkış listesi", icon: "AppleLogo", category: "ios",
    items: [
      { id: "i1", label: "App Store Connect hesabı", critical: true },
      { id: "i2", label: "Ekran görüntüleri (tüm cihazlar)", critical: true },
      { id: "i3", label: "ASO: başlık, anahtar kelime, açıklama" },
      { id: "i4", label: "Gizlilik formu (App Privacy)", critical: true },
      { id: "i5", label: "Sürüm notları" },
      { id: "i6", label: "TestFlight beta" },
    ],
  },
  {
    id: "tpl_company", name: "Şirket Kuruluşu", description: "Resmi şirket kurma adımları", icon: "Buildings", category: "company",
    items: [
      { id: "c1", label: "Şirket türü kararı (Ltd/A.Ş.)", critical: true },
      { id: "c2", label: "Vergi dairesi başvurusu", critical: true },
      { id: "c3", label: "Ödeme sağlayıcı başvurusu (iyzico/Stripe)", critical: true },
      { id: "c4", label: "Banka hesabı açılışı" },
      { id: "c5", label: "Muhasebeci / mali müşavir anlaşması" },
      { id: "c6", label: "Sözleşme şablonları (KVKK, hizmet)" },
    ],
  },
  {
    id: "tpl_mkt", name: "Pazarlama Lansmanı", description: "Ürün duyuru kampanyası", icon: "Megaphone", category: "marketing",
    items: [
      { id: "k1", label: "Launch günü içerik takvimi" },
      { id: "k2", label: "Product Hunt / topluluk gönderisi" },
      { id: "k3", label: "Sosyal medya tanıtım postları" },
      { id: "k4", label: "E-posta waitlist duyurusu" },
      { id: "k5", label: "Demo video / GIF" },
    ],
  },
];
