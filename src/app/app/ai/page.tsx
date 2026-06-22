"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@/components/ui/icon";
import { askAI, miniMarkdown } from "@/lib/ai";
import { cn } from "@/lib/utils";
import { useSpeech } from "@/lib/use-speech";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface Msg {
  role: "user" | "ai";
  text: string;
}

const CHIPS = [
  { label: "Kod", icon: "Code", prompt: "Bir kod problemi üzerinde çalışmak istiyorum." },
  { label: "Yaz", icon: "PencilSimple", prompt: "Bir metin yazmama yardım et." },
  { label: "Öğren", icon: "GraduationCap", prompt: "Bir konuyu öğrenmek istiyorum, bana anlat." },
  { label: "Planla", icon: "ListChecks", prompt: "Workspace'ime bakarak bu haftayı planla." },
  { label: "Claude'a bırak", icon: "Lightbulb", prompt: "Workspace'ime bak ve bugün en değerli ne yapabileceğimi sen öner." },
];

const MODELS = ["Opus 4.8", "Sonnet 4.6", "Haiku 4.5"];
const EFFORTS = ["High", "Medium", "Low"];

export default function AIPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState("Opus 4.8");
  const [effort, setEffort] = useState("High");
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const { listening, supported: micSupported, toggle: toggleMic } = useSpeech((text) => setInput(text));

  const empty = messages.length === 0;

  useEffect(() => {
    if (!empty) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, empty]);

  useEffect(() => {
    const ta = taRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = Math.min(ta.scrollHeight, 220) + "px";
    }
  }, [input]);

  const send = async (text: string) => {
    const prompt = text.trim();
    if (!prompt || loading) return;
    setError(null);
    setMessages((m) => [...m, { role: "user", text: prompt }]);
    setInput("");
    setLoading(true);
    try {
      const reply = await askAI(prompt);
      setMessages((m) => [...m, { role: "ai", text: reply }]);
    } catch (e: any) {
      setError(e.message ?? "AI'a ulaşılamadı.");
    } finally {
      setLoading(false);
    }
  };

  /* ---- Composer (Claude prompt kutusu, koyu) ---- */
  const Composer = (
    <div className="rounded-[20px] border border-[#ffffff14] bg-[#262624] shadow-[0_8px_40px_-12px_#00000060] transition-colors focus-within:border-[#ffffff24]">
      <textarea
        ref={taRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send(input);
          }
        }}
        rows={1}
        placeholder="Skill'ler için / yaz"
        className="block max-h-[220px] w-full resize-none bg-transparent px-4 pt-4 pb-2 text-[15px] leading-relaxed text-[#f5f4f0] outline-none placeholder:text-[#86847e]"
      />
      <div className="flex items-center justify-between px-3 pb-3">
        {/* sol: + menü */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#c2c0b8] transition-colors hover:bg-[#ffffff10] outline-none">
              <Icon name="Plus" size={18} />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content side="top" align="start" sideOffset={8}
              className="z-50 min-w-[240px] rounded-xl border border-[#ffffff14] bg-[#2a2a28] p-1.5 shadow-[0_12px_48px_-8px_#000000aa]">
              {[
                { icon: "Paperclip", label: "Dosya veya fotoğraf ekle", kbd: "⌘U" },
                { icon: "Camera", label: "Ekran görüntüsü al" },
                { icon: "FolderSimple", label: "Projeye ekle", arrow: true },
              ].map((it) => (
                <DropdownMenu.Item key={it.label} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[14px] text-[#e8e6e0] outline-none data-[highlighted]:bg-[#ffffff0d]">
                  <Icon name={it.icon} size={17} className="text-[#a3a199]" />
                  <span className="flex-1">{it.label}</span>
                  {it.kbd && <span className="text-[12px] text-[#86847e]">{it.kbd}</span>}
                  {it.arrow && <Icon name="CaretRight" size={13} className="text-[#86847e]" />}
                </DropdownMenu.Item>
              ))}
              <div className="my-1.5 h-px bg-[#ffffff0d]" />
              {[
                { icon: "Stack", label: "Skill'ler", arrow: true },
                { icon: "PuzzlePiece", label: "Bağlayıcılar", arrow: true },
              ].map((it) => (
                <DropdownMenu.Item key={it.label} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[14px] text-[#e8e6e0] outline-none data-[highlighted]:bg-[#ffffff0d]">
                  <Icon name={it.icon} size={17} className="text-[#a3a199]" />
                  <span className="flex-1">{it.label}</span>
                  {it.arrow && <Icon name="CaretRight" size={13} className="text-[#86847e]" />}
                </DropdownMenu.Item>
              ))}
              <div className="my-1.5 h-px bg-[#ffffff0d]" />
              <DropdownMenu.Item className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-[14px] text-[#e8e6e0] outline-none data-[highlighted]:bg-[#ffffff0d]">
                <Icon name="MagnifyingGlass" size={17} className="text-[#a3a199]" />
                <span className="flex-1">Web'de ara</span>
                <Icon name="Check" size={15} className="text-[var(--color-accent)]" />
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* sağ: model seçici + gönder */}
        <div className="flex items-center gap-2">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] text-[#c2c0b8] transition-colors hover:bg-[#ffffff10] outline-none">
                {model} <span className="text-[#86847e]">{effort}</span>
                <Icon name="CaretDown" size={12} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content side="top" align="end" sideOffset={8}
                className="z-50 min-w-[180px] rounded-xl border border-[#ffffff14] bg-[#2a2a28] p-1.5 shadow-[0_12px_48px_-8px_#000000aa]">
                <div className="px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-[#86847e]">Model</div>
                {MODELS.map((m) => (
                  <DropdownMenu.Item key={m} onSelect={() => setModel(m)}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-[14px] text-[#e8e6e0] outline-none data-[highlighted]:bg-[#ffffff0d]">
                    <span className="flex-1">{m}</span>
                    {model === m && <Icon name="Check" size={14} className="text-[var(--color-accent)]" />}
                  </DropdownMenu.Item>
                ))}
                <div className="my-1.5 h-px bg-[#ffffff0d]" />
                <div className="px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider text-[#86847e]">Çaba</div>
                {EFFORTS.map((e) => (
                  <DropdownMenu.Item key={e} onSelect={() => setEffort(e)}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-[14px] text-[#e8e6e0] outline-none data-[highlighted]:bg-[#ffffff0d]">
                    <span className="flex-1">{e}</span>
                    {effort === e && <Icon name="Check" size={14} className="text-[var(--color-accent)]" />}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {micSupported && (
            <button
              onClick={toggleMic}
              title={listening ? "Dinlemeyi durdur" : "Sesli konuş"}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                listening ? "bg-[#d4a27f] text-[#1f1e1c]" : "text-[#c2c0b8] hover:bg-[#ffffff10]"
              )}
            >
              <Icon name={listening ? "MicrophoneStage" : "Microphone"} size={17} weight={listening ? "fill" : "regular"} className={listening ? "animate-pulse" : ""} />
            </button>
          )}
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4a27f] text-[#1f1e1c] transition-opacity disabled:opacity-30"
          >
            <Icon name="ArrowUp" size={17} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full flex-col bg-[#1f1e1d]" data-ai-dark>
      {empty ? (
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="w-full max-w-[680px] animate-rise">
            <div className="mb-8 flex items-center justify-center gap-3">
              <Icon name="Sparkle" size={30} weight="fill" style={{ color: "#d4a27f" }} />
              <h1 className="font-serif text-[40px] font-normal tracking-tight text-[#e8e6e0]" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
                Ne üzerine düşünelim?
              </h1>
            </div>
            {Composer}
            {error && <p className="mt-3 text-center text-[13px] text-[#e08585]">{error}</p>}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {CHIPS.map((c) => (
                <button
                  key={c.label}
                  onClick={() => send(c.prompt)}
                  className="flex items-center gap-2 rounded-lg border border-[#ffffff12] bg-[#262624] px-3 py-2 text-[13px] text-[#c2c0b8] transition-colors hover:bg-[#2e2e2b] hover:text-[#e8e6e0]"
                >
                  <Icon name={c.icon} size={15} className="text-[#a3a199]" />
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-[720px] px-6 py-10">
              <div className="space-y-8">
                {messages.map((m, i) =>
                  m.role === "user" ? (
                    <div key={i} className="flex justify-end animate-fade">
                      <div className="max-w-[80%] rounded-2xl bg-[#363632] px-4 py-2.5 text-[15px] leading-relaxed text-[#f5f4f0]">{m.text}</div>
                    </div>
                  ) : (
                    <div key={i} className="flex gap-3.5 animate-fade">
                      <Icon name="Sparkle" size={20} weight="fill" className="mt-1 shrink-0" style={{ color: "#d4a27f" }} />
                      <div className="ai-prose ai-prose-dark flex-1 pt-0.5 text-[15px] leading-relaxed text-[#e8e6e0]" dangerouslySetInnerHTML={{ __html: miniMarkdown(m.text) }} />
                    </div>
                  )
                )}
                {loading && (
                  <div className="flex gap-3.5 animate-fade">
                    <Icon name="Sparkle" size={20} weight="fill" className="mt-1 shrink-0" style={{ color: "#d4a27f" }} />
                    <div className="flex items-center gap-1 pt-2.5">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#86847e]" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#86847e]" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#86847e]" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                {error && <p className="text-[13px] text-[#e08585]">{error}</p>}
              </div>
            </div>
          </div>
          <div className="shrink-0 px-6 pb-5">
            <div className="mx-auto max-w-[720px]">
              {Composer}
              <p className="mt-2 text-center text-[11px] text-[#86847e]">Founder OS asistanı workspace'ini tanır · Gemini ile çalışır</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
