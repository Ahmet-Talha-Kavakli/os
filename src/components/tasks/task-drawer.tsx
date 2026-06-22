"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Badge, Avatar } from "@/components/ui/primitives";
import { TaskCheck } from "./task-bits";
import { PRIORITIES, TASK_STATUS } from "@/lib/constants";
import { cn, relativeDay } from "@/lib/utils";
import type { Task, Priority, TaskStatus } from "@/lib/types";

function toInputDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[110px_1fr] items-start gap-3 py-2">
      <span className="pt-1.5 text-xs font-medium text-[var(--text-faint)]">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-[var(--border)] bg-transparent px-3 py-1.5 text-[14px] text-[var(--text)] outline-none transition-colors focus:border-[var(--color-accent)]";

export function TaskDrawer({ taskId, onClose }: { taskId: string | null; onClose: () => void }) {
  const task = useStore((s) => s.tasks.find((t) => t.id === taskId));
  const allTasks = useStore((s) => s.tasks);
  const projects = useStore((s) => s.projects);
  const members = useStore((s) => s.members);
  const updateTask = useStore((s) => s.updateTask);
  const deleteTask = useStore((s) => s.deleteTask);
  const toggleTaskDone = useStore((s) => s.toggleTaskDone);
  const addTask = useStore((s) => s.addTask);

  const [subInput, setSubInput] = useState("");

  // başlık düzenlemesi için yerel taslak
  const [titleDraft, setTitleDraft] = useState("");
  useEffect(() => {
    if (task) setTitleDraft(task.title);
  }, [task?.id, task?.title]);

  if (!task) return null;

  const subtasks = allTasks.filter((t) => t.parentId === task.id);
  const depOptions = allTasks.filter((t) => t.id !== task.id && t.parentId !== task.id);

  return (
    <Dialog.Root open={!!taskId} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30 animate-fade" />
        <Dialog.Content
          className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[460px] flex-col border-l border-[var(--border)] bg-[var(--bg)] animate-slide-in outline-none"
        >
          {/* başlık satırı */}
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
            <div className="flex items-center gap-2 text-xs text-[var(--text-faint)]">
              <Icon name="CheckSquare" size={14} /> Görev detayı
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="iconsm"
                onClick={() => {
                  deleteTask(task.id);
                  onClose();
                }}
                title="Sil"
                className="hover:text-[var(--color-health-risk)]"
              >
                <Icon name="Trash" size={15} />
              </Button>
              <Dialog.Close asChild>
                <Button variant="ghost" size="iconsm" title="Kapat">
                  <Icon name="X" size={15} />
                </Button>
              </Dialog.Close>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <Dialog.Title className="sr-only">{task.title}</Dialog.Title>
            {/* başlık + tamamla */}
            <div className="mb-3 flex items-start gap-3">
              <div className="pt-1">
                <TaskCheck task={task} onToggle={() => toggleTaskDone(task.id)} />
              </div>
              <textarea
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={() => titleDraft.trim() && updateTask(task.id, { title: titleDraft.trim() })}
                rows={2}
                className={cn(
                  "w-full resize-none bg-transparent text-lg font-semibold text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]",
                  task.status === "done" && "text-[var(--text-faint)] line-through"
                )}
                placeholder="Görev başlığı"
              />
            </div>

            {/* açıklama */}
            <textarea
              value={task.description ?? ""}
              onChange={(e) => updateTask(task.id, { description: e.target.value })}
              rows={3}
              placeholder="Açıklama ekle…"
              className={cn(inputCls, "mb-2 resize-none")}
            />

            <div className="divide-y divide-[var(--border)]">
              {/* durum */}
              <Field label="Durum">
                <div className="flex flex-wrap gap-1.5">
                  {TASK_STATUS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => updateTask(task.id, { status: s.id as TaskStatus })}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium transition-all",
                        task.status === s.id
                          ? "text-white"
                          : "text-[var(--text-dim)] hover:bg-[var(--bg-hover)]"
                      )}
                      style={task.status === s.id ? { background: s.color } : undefined}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </Field>

              {/* öncelik */}
              <Field label="Öncelik">
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(PRIORITIES) as Priority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => updateTask(task.id, { priority: p })}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium transition-all",
                        task.priority === p ? "" : "opacity-50 hover:opacity-100"
                      )}
                      style={{
                        background: `color-mix(in srgb, ${PRIORITIES[p].color} ${task.priority === p ? 20 : 10}%, transparent)`,
                        color: PRIORITIES[p].color,
                      }}
                    >
                      {PRIORITIES[p].label}
                    </button>
                  ))}
                </div>
              </Field>

              {/* atanan */}
              <Field label="Atanan">
                <div className="flex flex-wrap items-center gap-1.5">
                  {members.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => updateTask(task.id, { assigneeId: task.assigneeId === m.id ? undefined : m.id })}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full py-0.5 pl-0.5 pr-2 text-xs transition-all",
                        task.assigneeId === m.id
                          ? "bg-[var(--bg-active)] text-[var(--text)]"
                          : "text-[var(--text-dim)] hover:bg-[var(--bg-hover)]"
                      )}
                    >
                      <Avatar name={m.name} color={m.avatarColor} size={20} />
                      {m.name}
                    </button>
                  ))}
                </div>
              </Field>

              {/* proje */}
              <Field label="Proje">
                <select
                  value={task.projectId ?? ""}
                  onChange={(e) => updateTask(task.id, { projectId: e.target.value || undefined })}
                  className={inputCls}
                >
                  <option value="">Genel (projesiz)</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>

              {/* bitiş tarihi */}
              <Field label="Bitiş">
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={toInputDate(task.dueDate)}
                    onChange={(e) =>
                      updateTask(task.id, {
                        dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                      })
                    }
                    className={cn(inputCls, "max-w-[170px]")}
                  />
                  {task.dueDate && (
                    <span className="text-xs text-[var(--text-faint)]">{relativeDay(task.dueDate)}</span>
                  )}
                </div>
              </Field>

              {/* tahmin */}
              <Field label="Tahmin (sa)">
                <input
                  type="number"
                  min={0}
                  value={task.estimateHours ?? ""}
                  onChange={(e) =>
                    updateTask(task.id, { estimateHours: e.target.value ? Number(e.target.value) : undefined })
                  }
                  placeholder="—"
                  className={cn(inputCls, "max-w-[120px]")}
                />
              </Field>

              {/* etiketler */}
              <Field label="Etiketler">
                <input
                  defaultValue={task.tags.join(", ")}
                  onBlur={(e) =>
                    updateTask(task.id, {
                      tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="virgülle ayır"
                  className={inputCls}
                />
              </Field>

              {/* tekrar */}
              <Field label="Tekrar">
                <div className="flex flex-wrap gap-1.5">
                  {([
                    [null, "Yok"],
                    ["daily", "Günlük"],
                    ["weekly", "Haftalık"],
                    ["monthly", "Aylık"],
                  ] as const).map(([val, label]) => (
                    <button
                      key={label}
                      onClick={() => updateTask(task.id, { recurring: val })}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-xs font-medium transition-all",
                        (task.recurring ?? null) === val
                          ? "bg-[var(--bg-active)] text-[var(--text)]"
                          : "text-[var(--text-dim)] hover:bg-[var(--bg-hover)]"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </Field>

              {/* bağımlılıklar */}
              <Field label="Bağımlılık">
                <div className="space-y-1.5">
                  {task.dependsOn.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {task.dependsOn.map((id) => {
                        const dep = allTasks.find((t) => t.id === id);
                        if (!dep) return null;
                        return (
                          <span
                            key={id}
                            className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-hover)] py-0.5 pl-2 pr-1 text-xs text-[var(--text-dim)]"
                          >
                            {dep.title.slice(0, 28)}
                            <button
                              onClick={() =>
                                updateTask(task.id, { dependsOn: task.dependsOn.filter((d) => d !== id) })
                              }
                              className="grid h-4 w-4 place-items-center rounded-full hover:bg-[var(--bg-raised)]"
                            >
                              <Icon name="X" size={10} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <select
                    value=""
                    onChange={(e) => {
                      const id = e.target.value;
                      if (id && !task.dependsOn.includes(id))
                        updateTask(task.id, { dependsOn: [...task.dependsOn, id] });
                    }}
                    className={inputCls}
                  >
                    <option value="">+ Bağımlılık ekle…</option>
                    {depOptions
                      .filter((t) => !task.dependsOn.includes(t.id))
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                  </select>
                </div>
              </Field>
            </div>

            {/* alt görevler */}
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[var(--text-dim)]">
                  Alt görevler
                </span>
                {subtasks.length > 0 && (
                  <Badge>
                    {subtasks.filter((s) => s.status === "done").length}/{subtasks.length}
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-[var(--bg-hover)]"
                  >
                    <TaskCheck task={st} onToggle={() => toggleTaskDone(st.id)} />
                    <span
                      className={cn(
                        "flex-1 text-sm text-[var(--text-dim)]",
                        st.status === "done" && "text-[var(--text-faint)] line-through"
                      )}
                    >
                      {st.title}
                    </span>
                    <button
                      onClick={() => deleteTask(st.id)}
                      className="text-[var(--text-faint)] hover:text-[var(--color-health-risk)]"
                    >
                      <Icon name="X" size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!subInput.trim()) return;
                  addTask({
                    title: subInput.trim(),
                    parentId: task.id,
                    projectId: task.projectId,
                    assigneeId: task.assigneeId,
                    status: "todo",
                  });
                  setSubInput("");
                }}
                className="mt-1.5 flex items-center gap-2"
              >
                <Icon name="Plus" size={14} className="text-[var(--text-faint)]" />
                <input
                  value={subInput}
                  onChange={(e) => setSubInput(e.target.value)}
                  placeholder="Alt görev ekle…"
                  className="flex-1 bg-transparent py-1 text-sm text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]"
                />
              </form>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
