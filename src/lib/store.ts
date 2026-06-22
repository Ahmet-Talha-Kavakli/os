"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type {
  Project, Task, Page, Goal, ProjectChecklist, Expense, AutomationRule,
  Activity, Notification, Snippet, Member, Block,
  PromptCollection, PromptItem, EnvKey, EnvField, Credential, CredentialField, Idea,
} from "./types";
import {
  MEMBERS, PROJECTS, TASKS, PAGES, GOALS, PROJECT_CHECKLISTS, EXPENSES,
  AUTOMATIONS, ACTIVITIES, NOTIFICATIONS, SNIPPETS,
  PROMPT_COLLECTIONS, ENV_KEYS, CREDENTIALS, IDEAS,
} from "./seed";

type Theme = "dark" | "light";

interface TrashItem {
  id: string;
  kind: "project" | "task" | "page";
  label: string;
  data: any;
  deletedAt: string;
}

interface State {
  // veri
  members: Member[];
  projects: Project[];
  tasks: Task[];
  pages: Page[];
  goals: Goal[];
  checklists: ProjectChecklist[];
  expenses: Expense[];
  automations: AutomationRule[];
  activities: Activity[];
  notifications: Notification[];
  snippets: Snippet[];
  promptCollections: PromptCollection[];
  envKeys: EnvKey[];
  credentials: Credential[];
  ideas: Idea[];
  trash: TrashItem[];

  // ui
  theme: Theme;
  currentUserId: string;
  commandOpen: boolean;
  hydrated: boolean;

  // ui actions
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setCommandOpen: (v: boolean) => void;
  setHydrated: () => void;

  // project actions
  addProject: (p?: Partial<Project>) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // task actions
  addTask: (t?: Partial<Task>) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskDone: (id: string) => void;

  // page actions
  addPage: (p?: Partial<Page>) => Page;
  updatePage: (id: string, patch: Partial<Page>) => void;
  updatePageBlocks: (id: string, blocks: Block[]) => void;
  deletePage: (id: string) => void;

  // goal actions
  updateGoal: (id: string, patch: Partial<Goal>) => void;

  // checklist
  toggleChecklistItem: (checklistId: string, itemId: string) => void;
  addChecklistFromTemplate: (projectId: string, templateId: string, name: string, items: { id: string; label: string; critical?: boolean }[]) => void;

  // expense
  addExpense: (e?: Partial<Expense>) => void;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // goals (eksikti)
  addGoal: (g?: Partial<Goal>) => Goal;
  deleteGoal: (id: string) => void;

  // members
  updateMember: (id: string, patch: Partial<Member>) => void;

  // automation
  addAutomation: (a?: Partial<AutomationRule>) => AutomationRule;
  updateAutomation: (id: string, patch: Partial<AutomationRule>) => void;
  deleteAutomation: (id: string) => void;
  toggleAutomation: (id: string) => void;

  // notifications
  markAllRead: () => void;
  markRead: (id: string) => void;

  // trash
  restore: (id: string) => void;
  emptyTrash: () => void;

  // prompt collections
  addPromptCollection: (c?: Partial<PromptCollection>) => PromptCollection;
  updatePromptCollection: (id: string, patch: Partial<PromptCollection>) => void;
  deletePromptCollection: (id: string) => void;
  addPrompt: (collectionId: string, p?: Partial<PromptItem>) => void;
  updatePrompt: (collectionId: string, promptId: string, patch: Partial<PromptItem>) => void;
  deletePrompt: (collectionId: string, promptId: string) => void;

  // env keys (çoklu alan)
  addEnvKey: (e?: Partial<EnvKey>) => void;
  updateEnvKey: (id: string, patch: Partial<EnvKey>) => void;
  deleteEnvKey: (id: string) => void;
  addEnvField: (envId: string) => void;
  updateEnvField: (envId: string, fieldId: string, patch: Partial<EnvField>) => void;
  deleteEnvField: (envId: string, fieldId: string) => void;

  // credentials (çoklu alan)
  addCredential: (c?: Partial<Credential>) => void;
  updateCredential: (id: string, patch: Partial<Credential>) => void;
  deleteCredential: (id: string) => void;
  addCredField: (credId: string) => void;
  updateCredField: (credId: string, fieldId: string, patch: Partial<CredentialField>) => void;
  deleteCredField: (credId: string, fieldId: string) => void;

  // ideas
  addIdea: (i?: Partial<Idea>) => Idea;
  updateIdea: (id: string, patch: Partial<Idea>) => void;
  deleteIdea: (id: string) => void;

  // activity helper
  logActivity: (a: Omit<Activity, "id" | "at" | "actorId">) => void;
}

const now = () => new Date().toISOString();

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      members: MEMBERS,
      projects: PROJECTS,
      tasks: TASKS,
      pages: PAGES,
      goals: GOALS,
      checklists: PROJECT_CHECKLISTS,
      expenses: EXPENSES,
      automations: AUTOMATIONS,
      activities: ACTIVITIES,
      notifications: NOTIFICATIONS,
      snippets: SNIPPETS,
      promptCollections: PROMPT_COLLECTIONS,
      envKeys: ENV_KEYS,
      credentials: CREDENTIALS,
      ideas: IDEAS,
      trash: [],

      theme: "light",
      currentUserId: "m1",
      commandOpen: false,
      hydrated: false,

      setTheme: (t) => set({ theme: t }),
      toggleTheme: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),
      setCommandOpen: (v) => set({ commandOpen: v }),
      setHydrated: () => set({ hydrated: true }),

      addProject: (p) => {
        const proj: Project = {
          id: "p_" + nanoid(6), name: p?.name ?? "Yeni Proje", icon: p?.icon ?? "Cube",
          color: p?.color ?? "#5b8cff", description: p?.description ?? "", stage: p?.stage ?? "idea",
          health: p?.health ?? "good", priority: p?.priority ?? "p2", ownerId: p?.ownerId ?? get().currentUserId,
          platform: p?.platform ?? "web", techStack: p?.techStack ?? [], startedAt: now(),
          progress: 0, mrr: 0, monthlyCost: 0, starred: false, archived: false, tags: p?.tags ?? [], goalIds: [],
          ...p,
        };
        set((s) => ({ projects: [proj, ...s.projects] }));
        get().logActivity({ verb: "oluşturdu", targetType: "project", targetId: proj.id, targetLabel: proj.name });
        return proj;
      },
      updateProject: (id, patch) => set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      deleteProject: (id) => set((s) => {
        const p = s.projects.find((x) => x.id === id);
        if (!p) return {};
        return {
          projects: s.projects.filter((x) => x.id !== id),
          trash: [{ id, kind: "project", label: p.name, data: p, deletedAt: now() }, ...s.trash],
        };
      }),

      addTask: (t) => {
        const task: Task = {
          id: "t_" + nanoid(6), title: t?.title ?? "Yeni görev", status: t?.status ?? "todo",
          priority: t?.priority ?? "p2", dependsOn: [], tags: [], createdAt: now(), order: 0, recurring: null, ...t,
        };
        set((s) => ({ tasks: [task, ...s.tasks] }));
        return task;
      },
      updateTask: (id, patch) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      deleteTask: (id) => set((s) => {
        const t = s.tasks.find((x) => x.id === id);
        if (!t) return {};
        return {
          tasks: s.tasks.filter((x) => x.id !== id),
          trash: [{ id, kind: "task", label: t.title, data: t, deletedAt: now() }, ...s.trash],
        };
      }),
      toggleTaskDone: (id) => set((s) => ({
        tasks: s.tasks.map((t) =>
          t.id === id
            ? { ...t, status: t.status === "done" ? "todo" : "done", completedAt: t.status === "done" ? undefined : now() }
            : t
        ),
      })),

      addPage: (p) => {
        const page: Page = {
          id: "pg_" + nanoid(6), title: p?.title ?? "Yeni Sayfa", icon: p?.icon ?? "FileText",
          blocks: p?.blocks ?? [{ id: nanoid(6), type: "text", content: "" }], kind: p?.kind ?? "doc",
          createdAt: now(), updatedAt: now(), favorite: false, authorId: get().currentUserId, ...p,
        };
        set((s) => ({ pages: [page, ...s.pages] }));
        return page;
      },
      updatePage: (id, patch) => set((s) => ({ pages: s.pages.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: now() } : p)) })),
      updatePageBlocks: (id, blocks) => set((s) => ({ pages: s.pages.map((p) => (p.id === id ? { ...p, blocks, updatedAt: now() } : p)) })),
      deletePage: (id) => set((s) => {
        const p = s.pages.find((x) => x.id === id);
        if (!p) return {};
        return {
          pages: s.pages.filter((x) => x.id !== id),
          trash: [{ id, kind: "page", label: p.title, data: p, deletedAt: now() }, ...s.trash],
        };
      }),

      updateGoal: (id, patch) => set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) })),

      toggleChecklistItem: (checklistId, itemId) => set((s) => ({
        checklists: s.checklists.map((c) =>
          c.id === checklistId
            ? { ...c, items: c.items.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)) }
            : c
        ),
      })),
      addChecklistFromTemplate: (projectId, templateId, name, items) => set((s) => ({
        checklists: [
          { id: "pc_" + nanoid(6), projectId, templateId, name, items: items.map((i) => ({ ...i, done: false })) },
          ...s.checklists,
        ],
      })),

      addExpense: (e) => set((s) => ({
        expenses: [{ id: "e_" + nanoid(6), name: e?.name ?? "Yeni gider", amount: e?.amount ?? 0, cadence: e?.cadence ?? "monthly", category: e?.category ?? "other", ...e }, ...s.expenses],
      })),
      updateExpense: (id, patch) => set((s) => ({ expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      deleteExpense: (id) => set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),

      addGoal: (g) => {
        const goal: Goal = {
          id: "g_" + nanoid(6), title: g?.title ?? "Yeni Hedef", description: g?.description ?? "",
          quarter: g?.quarter ?? "2026-Q3", ownerId: g?.ownerId ?? get().currentUserId,
          keyResults: g?.keyResults ?? [{ id: "kr_" + nanoid(6), label: "Ana sonuç", current: 0, target: 100, unit: "%" }],
          projectIds: g?.projectIds ?? [], status: g?.status ?? "on_track", ...g,
        };
        set((s) => ({ goals: [goal, ...s.goals] }));
        return goal;
      },
      deleteGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      updateMember: (id, patch) => set((s) => ({ members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),

      addAutomation: (a) => {
        const rule: AutomationRule = {
          id: "a_" + nanoid(6), name: a?.name ?? "Yeni Kural", enabled: a?.enabled ?? true,
          trigger: a?.trigger ?? "", action: a?.action ?? "", runs: 0, ...a,
        };
        set((s) => ({ automations: [rule, ...s.automations] }));
        return rule;
      },
      updateAutomation: (id, patch) => set((s) => ({ automations: s.automations.map((a) => (a.id === id ? { ...a, ...patch } : a)) })),
      deleteAutomation: (id) => set((s) => ({ automations: s.automations.filter((a) => a.id !== id) })),
      toggleAutomation: (id) => set((s) => ({ automations: s.automations.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)) })),

      markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      markRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),

      restore: (id) => set((s) => {
        const item = s.trash.find((t) => t.id === id);
        if (!item) return {};
        const rest = s.trash.filter((t) => t.id !== id);
        if (item.kind === "project") return { trash: rest, projects: [item.data, ...s.projects] };
        if (item.kind === "task") return { trash: rest, tasks: [item.data, ...s.tasks] };
        return { trash: rest, pages: [item.data, ...s.pages] };
      }),
      emptyTrash: () => set({ trash: [] }),

      // ---- prompt collections ----
      addPromptCollection: (c) => {
        const col: PromptCollection = {
          id: "prc_" + nanoid(6), name: c?.name ?? "Yeni Koleksiyon", description: c?.description ?? "",
          icon: c?.icon ?? "ChatText", color: c?.color ?? "#4a8bd4", tags: c?.tags ?? [], prompts: c?.prompts ?? [],
          createdAt: now(), ...c,
        };
        set((s) => ({ promptCollections: [col, ...s.promptCollections] }));
        return col;
      },
      updatePromptCollection: (id, patch) => set((s) => ({ promptCollections: s.promptCollections.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deletePromptCollection: (id) => set((s) => ({ promptCollections: s.promptCollections.filter((c) => c.id !== id) })),
      addPrompt: (collectionId, p) => set((s) => ({
        promptCollections: s.promptCollections.map((c) =>
          c.id === collectionId
            ? { ...c, prompts: [...c.prompts, { id: "pr_" + nanoid(6), title: p?.title ?? "Yeni prompt", body: p?.body ?? "", createdAt: now() }] }
            : c
        ),
      })),
      updatePrompt: (collectionId, promptId, patch) => set((s) => ({
        promptCollections: s.promptCollections.map((c) =>
          c.id === collectionId ? { ...c, prompts: c.prompts.map((p) => (p.id === promptId ? { ...p, ...patch } : p)) } : c
        ),
      })),
      deletePrompt: (collectionId, promptId) => set((s) => ({
        promptCollections: s.promptCollections.map((c) =>
          c.id === collectionId ? { ...c, prompts: c.prompts.filter((p) => p.id !== promptId) } : c
        ),
      })),

      // ---- env keys (çoklu alan) ----
      addEnvKey: (e) => set((s) => ({
        envKeys: [{
          id: "ek_" + nanoid(6), name: e?.name ?? "YENI_KEY", env: e?.env ?? "development",
          fields: e?.fields ?? [{ id: "ef_" + nanoid(6), key: e?.name ?? "", value: e?.value ?? "" }],
          ...e,
        }, ...s.envKeys],
      })),
      updateEnvKey: (id, patch) => set((s) => ({ envKeys: s.envKeys.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      deleteEnvKey: (id) => set((s) => ({ envKeys: s.envKeys.filter((e) => e.id !== id) })),
      addEnvField: (envId) => set((s) => ({
        envKeys: s.envKeys.map((e) => e.id === envId ? { ...e, fields: [...e.fields, { id: "ef_" + nanoid(6), key: "", value: "" }] } : e),
      })),
      updateEnvField: (envId, fieldId, patch) => set((s) => ({
        envKeys: s.envKeys.map((e) => e.id === envId ? { ...e, fields: e.fields.map((f) => f.id === fieldId ? { ...f, ...patch } : f) } : e),
      })),
      deleteEnvField: (envId, fieldId) => set((s) => ({
        envKeys: s.envKeys.map((e) => e.id === envId ? { ...e, fields: e.fields.filter((f) => f.id !== fieldId) } : e),
      })),

      // ---- credentials (çoklu alan) ----
      addCredential: (c) => set((s) => ({
        credentials: [{
          id: "cr_" + nanoid(6), label: c?.label ?? "Yeni kayıt", icon: c?.icon ?? "Key", category: c?.category ?? "other",
          fields: c?.fields ?? [{ id: "cf_" + nanoid(6), label: "Şifre", value: c?.secret ?? "", secret: true }],
          ...c,
        }, ...s.credentials],
      })),
      updateCredential: (id, patch) => set((s) => ({ credentials: s.credentials.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteCredential: (id) => set((s) => ({ credentials: s.credentials.filter((c) => c.id !== id) })),
      addCredField: (credId) => set((s) => ({
        credentials: s.credentials.map((c) => c.id === credId ? { ...c, fields: [...c.fields, { id: "cf_" + nanoid(6), label: "Yeni alan", value: "", secret: true }] } : c),
      })),
      updateCredField: (credId, fieldId, patch) => set((s) => ({
        credentials: s.credentials.map((c) => c.id === credId ? { ...c, fields: c.fields.map((f) => f.id === fieldId ? { ...f, ...patch } : f) } : c),
      })),
      deleteCredField: (credId, fieldId) => set((s) => ({
        credentials: s.credentials.map((c) => c.id === credId ? { ...c, fields: c.fields.filter((f) => f.id !== fieldId) } : c),
      })),

      // ---- ideas ----
      addIdea: (i) => {
        const idea: Idea = {
          id: "id_" + nanoid(6), title: i?.title ?? "Yeni fikir", body: i?.body ?? "", status: i?.status ?? "spark",
          impact: i?.impact ?? 2, effort: i?.effort ?? 2, tags: i?.tags ?? [], createdAt: now(), ...i,
        };
        set((s) => ({ ideas: [idea, ...s.ideas] }));
        return idea;
      },
      updateIdea: (id, patch) => set((s) => ({ ideas: s.ideas.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),
      deleteIdea: (id) => set((s) => ({ ideas: s.ideas.filter((i) => i.id !== id) })),

      logActivity: (a) => set((s) => ({
        activities: [{ id: "ac_" + nanoid(6), at: now(), actorId: s.currentUserId, ...a }, ...s.activities].slice(0, 100),
      })),
    }),
    {
      name: "founder-os-v2",
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    }
  )
);

// ---- Türetilmiş seçiciler (memoize edilmiş — sonsuz döngü önlemi) ----
// ÖNEMLİ: useStore selector'ı ASLA inline .filter/.map/.slice ile yeni dizi
// döndürmemeli (zustand v5 sonsuz render). Ham diziyi seç, useMemo ile türet.

import { useMemo } from "react";

export const useActiveProjects = () => {
  const projects = useStore((s) => s.projects);
  return useMemo(() => projects.filter((p) => !p.archived), [projects]);
};

export const useProjectTasks = (projectId: string) => {
  const tasks = useStore((s) => s.tasks);
  return useMemo(() => tasks.filter((t) => t.projectId === projectId), [tasks, projectId]);
};

export function projectProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const done = tasks.filter((t) => t.status === "done").length;
  return Math.round((done / tasks.length) * 100);
}
