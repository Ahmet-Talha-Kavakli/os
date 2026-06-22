"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { nanoid } from "nanoid";
import type { Block, BlockType } from "@/lib/types";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Blok tip meta — slash menüsü ve render için tek kaynak                     */
/* -------------------------------------------------------------------------- */

interface BlockMeta {
  type: BlockType;
  label: string;
  desc: string;
  icon: string;
  keywords: string;
}

const SLASH_MENU: BlockMeta[] = [
  { type: "text", label: "Metin", desc: "Düz paragraf", icon: "TextT", keywords: "metin text paragraf yazı" },
  { type: "h1", label: "Başlık 1", desc: "Büyük bölüm başlığı", icon: "TextHOne", keywords: "baslik h1 buyuk" },
  { type: "h2", label: "Başlık 2", desc: "Orta bölüm başlığı", icon: "TextHTwo", keywords: "baslik h2 orta" },
  { type: "h3", label: "Başlık 3", desc: "Küçük alt başlık", icon: "TextHThree", keywords: "baslik h3 kucuk" },
  { type: "bullet", label: "Madde", desc: "Noktalı liste", icon: "ListBullets", keywords: "madde liste bullet nokta" },
  { type: "numbered", label: "Numaralı", desc: "Sıralı liste", icon: "ListNumbers", keywords: "numarali sira liste numbered" },
  { type: "todo", label: "Yapılacak", desc: "Onay kutulu görev", icon: "CheckSquare", keywords: "yapilacak todo gorev kutu checkbox" },
  { type: "quote", label: "Alıntı", desc: "Vurgulu alıntı", icon: "Quotes", keywords: "alinti quote alıntı" },
  { type: "code", label: "Kod", desc: "Tek aralıklı kod bloğu", icon: "Code", keywords: "kod code monospace" },
  { type: "callout", label: "Bilgi kutusu", desc: "Renkli vurgu kutusu", icon: "Info", keywords: "bilgi kutusu callout not uyari" },
  { type: "toggle", label: "Toggle", desc: "Açılır-kapanır blok", icon: "CaretRight", keywords: "toggle acilir katla" },
  { type: "divider", label: "Ayraç", desc: "Yatay çizgi", icon: "Minus", keywords: "ayrac cizgi divider" },
];

const META = (t: BlockType) => SLASH_MENU.find((m) => m.type === t) ?? SLASH_MENU[0];

const emptyBlock = (type: BlockType = "text"): Block => ({ id: nanoid(8), type, content: "" });

/* -------------------------------------------------------------------------- */
/*  Ana editör                                                                */
/* -------------------------------------------------------------------------- */

export function BlockEditor({
  blocks,
  onChange,
}: {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}) {
  // yerel durum — dışarıdan gelenle senkron, ama yazarken pürüzsüz
  const [local, setLocal] = useState<Block[]>(blocks.length ? blocks : [emptyBlock()]);
  const refs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const focusAfter = useRef<{ id: string; toEnd?: boolean } | null>(null);

  // dış değişiklikleri (sayfa değişimi vb.) içeri al — id imzası değişirse
  const sig = blocks.map((b) => b.id).join(",");
  const lastSig = useRef(sig);
  useEffect(() => {
    if (sig !== lastSig.current) {
      lastSig.current = sig;
      setLocal(blocks.length ? blocks : [emptyBlock()]);
    }
  }, [sig, blocks]);

  // odak yönetimi
  useEffect(() => {
    if (focusAfter.current) {
      const { id, toEnd } = focusAfter.current;
      const el = refs.current[id];
      if (el) {
        el.focus();
        if (toEnd) {
          const len = el.value.length;
          el.setSelectionRange(len, len);
        }
      }
      focusAfter.current = null;
    }
  });

  const commit = useCallback(
    (next: Block[]) => {
      setLocal(next);
      onChange(next);
    },
    [onChange]
  );

  const update = (id: string, patch: Partial<Block>) =>
    commit(local.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const setType = (id: string, type: BlockType) => {
    commit(
      local.map((b) =>
        b.id === id
          ? { ...b, type, ...(type === "todo" ? { checked: b.checked ?? false } : {}) }
          : b
      )
    );
    focusAfter.current = { id, toEnd: true };
  };

  const insertAfter = (id: string, type: BlockType = "text") => {
    const idx = local.findIndex((b) => b.id === id);
    const nb = emptyBlock(type);
    const next = [...local.slice(0, idx + 1), nb, ...local.slice(idx + 1)];
    commit(next);
    focusAfter.current = { id: nb.id };
  };

  const removeBlock = (id: string) => {
    const idx = local.findIndex((b) => b.id === id);
    if (local.length === 1) {
      // son bloğu boş metne dönüştür
      commit([emptyBlock()]);
      return;
    }
    const prev = local[idx - 1];
    const next = local.filter((b) => b.id !== id);
    commit(next);
    if (prev) focusAfter.current = { id: prev.id, toEnd: true };
  };

  const moveFocus = (id: string, dir: -1 | 1, toEnd?: boolean) => {
    const idx = local.findIndex((b) => b.id === id);
    const target = local[idx + dir];
    if (target) {
      const el = refs.current[target.id];
      el?.focus();
      if (el && toEnd) {
        const len = el.value.length;
        el.setSelectionRange(len, len);
      }
    }
  };

  return (
    <div className="space-y-0.5">
      {local.map((block) => (
        <BlockRow
          key={block.id}
          block={block}
          registerRef={(el) => (refs.current[block.id] = el)}
          onChange={(content) => update(block.id, { content })}
          onSetType={(t) => setType(block.id, t)}
          onToggleChecked={() => update(block.id, { checked: !block.checked })}
          onEnter={() => insertAfter(block.id)}
          onBackspaceEmpty={() => removeBlock(block.id)}
          onArrow={(dir, toEnd) => moveFocus(block.id, dir, toEnd)}
        />
      ))}

      {/* tıkla-ekle alanı */}
      <button
        onClick={() => {
          const last = local[local.length - 1];
          if (last && last.type === "text" && last.content === "") {
            refs.current[last.id]?.focus();
          } else {
            const nb = emptyBlock();
            commit([...local, nb]);
            focusAfter.current = { id: nb.id };
          }
        }}
        className="mt-1 flex w-full items-center gap-1.5 rounded-md px-1 py-2 text-left text-sm text-[var(--text-faint)] opacity-0 transition-opacity hover:opacity-100"
      >
        <Icon name="Plus" size={14} /> Yazmaya başla ya da “/” ile blok ekle
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Tek blok satırı                                                           */
/* -------------------------------------------------------------------------- */

function BlockRow({
  block,
  registerRef,
  onChange,
  onSetType,
  onToggleChecked,
  onEnter,
  onBackspaceEmpty,
  onArrow,
}: {
  block: Block;
  registerRef: (el: HTMLTextAreaElement | null) => void;
  onChange: (content: string) => void;
  onSetType: (t: BlockType) => void;
  onToggleChecked: () => void;
  onEnter: () => void;
  onBackspaceEmpty: () => void;
  onArrow: (dir: -1 | 1, toEnd?: boolean) => void;
}) {
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const setRef = (el: HTMLTextAreaElement | null) => {
    taRef.current = el;
    registerRef(el);
  };

  // otomatik yükseklik
  const autosize = () => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };
  useEffect(autosize, [block.content, block.type]);

  // markdown kısayolları — boşluk/aksiyon anında dönüştür
  const tryMarkdown = (value: string): boolean => {
    const map: Record<string, BlockType> = {
      "# ": "h1",
      "## ": "h2",
      "### ": "h3",
      "- ": "bullet",
      "* ": "bullet",
      "1. ": "numbered",
      "[] ": "todo",
      "[ ] ": "todo",
      "> ": "quote",
    };
    for (const [prefix, type] of Object.entries(map)) {
      if (value === prefix) {
        onChange("");
        onSetType(type);
        return true;
      }
    }
    if (value === "```") {
      onChange("");
      onSetType("code");
      return true;
    }
    return false;
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;

    // slash menü tetikleme: boş blokta "/" ile başla
    if (value.startsWith("/") && (block.type === "text")) {
      setSlashOpen(true);
      setSlashQuery(value.slice(1));
      onChange(value);
      return;
    } else if (slashOpen) {
      setSlashOpen(false);
      setSlashQuery("");
    }

    if (tryMarkdown(value)) return;
    onChange(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = taRef.current;

    if (slashOpen) {
      // menü açıkken oklar/enter/escape menüye ait
      if (["ArrowDown", "ArrowUp", "Enter", "Escape", "Tab"].includes(e.key)) {
        // SlashMenu kendi handler'ı window listener ile yönetiyor — burada sadece engelle
        if (e.key === "Escape") {
          e.preventDefault();
          setSlashOpen(false);
          onChange("");
        }
        return;
      }
    }

    // Kod bloğunda Enter = yeni satır (shift gerekmez)
    if (e.key === "Enter" && !e.shiftKey && block.type !== "code") {
      e.preventDefault();
      if (slashOpen) return;
      onEnter();
      return;
    }

    if (e.key === "Backspace") {
      if (block.content === "") {
        e.preventDefault();
        if (slashOpen) {
          setSlashOpen(false);
          return;
        }
        // liste/başlık türündeyse önce metne çevir
        if (block.type !== "text") {
          onSetType("text");
        } else {
          onBackspaceEmpty();
        }
        return;
      }
    }

    if (e.key === "ArrowUp" && el && el.selectionStart === 0) {
      e.preventDefault();
      onArrow(-1, true);
    }
    if (e.key === "ArrowDown" && el && el.selectionStart === el.value.length) {
      e.preventDefault();
      onArrow(1);
    }
  };

  const pickType = (t: BlockType) => {
    setSlashOpen(false);
    setSlashQuery("");
    onChange("");
    if (t === "divider") {
      onSetType("divider");
      onEnter();
    } else {
      onSetType(t);
    }
  };

  /* ---- Ayraç: editlenemez ---- */
  if (block.type === "divider") {
    return (
      <div className="group relative py-2">
        <hr className="border-0 border-t border-[var(--border-strong)]" />
        <textarea
          ref={setRef}
          value=""
          readOnly
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              e.preventDefault();
              onBackspaceEmpty();
            }
            if (e.key === "Enter") {
              e.preventDefault();
              onEnter();
            }
          }}
          className="absolute inset-0 h-full w-full cursor-pointer resize-none bg-transparent opacity-0 outline-none"
          rows={1}
        />
      </div>
    );
  }

  const editable = (
    <div className="relative flex-1">
      <textarea
        ref={setRef}
        value={block.content}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        rows={1}
        spellCheck={false}
        placeholder={placeholderFor(block.type)}
        className={cn(
          "w-full resize-none border-0 bg-transparent leading-relaxed text-[var(--text)] outline-none placeholder:text-[var(--text-faint)]",
          textClass(block.type)
        )}
      />
      {slashOpen && (
        <SlashMenu
          query={slashQuery}
          onPick={pickType}
          onClose={() => {
            setSlashOpen(false);
            onChange("");
          }}
        />
      )}
    </div>
  );

  /* ---- Türlere göre sarmalama ---- */

  if (block.type === "todo") {
    return (
      <div className="group flex items-start gap-2.5 py-0.5">
        <button
          onClick={onToggleChecked}
          className={cn(
            "mt-[5px] flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors",
            block.checked
              ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
              : "border-[var(--border-strong)] hover:border-[var(--color-accent)]"
          )}
        >
          {block.checked && <Icon name="Check" size={12} weight="bold" />}
        </button>
        <div className={cn("flex-1", block.checked && "text-[var(--text-faint)] line-through")}>
          {editable}
        </div>
      </div>
    );
  }

  if (block.type === "bullet") {
    return (
      <div className="group flex items-start gap-2.5 py-0.5">
        <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--text-dim)]" />
        {editable}
      </div>
    );
  }

  if (block.type === "numbered") {
    return (
      <div className="group flex items-start gap-2.5 py-0.5">
        <span className="mt-[2px] shrink-0 select-none text-[var(--text-dim)]">•</span>
        {editable}
      </div>
    );
  }

  if (block.type === "quote") {
    return (
      <div className="group my-1 border-l-[3px] border-[var(--border-strong)] pl-3.5 py-0.5">
        {editable}
      </div>
    );
  }

  if (block.type === "code") {
    return (
      <div className="group my-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg-raised)] px-4 py-3">
        {editable}
      </div>
    );
  }

  if (block.type === "callout") {
    return (
      <div className="group my-1.5 flex items-start gap-3 rounded-lg border border-[color-mix(in_srgb,var(--color-accent)_24%,transparent)] bg-[color-mix(in_srgb,var(--color-accent)_8%,transparent)] px-3.5 py-3">
        <Icon name="Info" size={18} className="mt-[3px] shrink-0" style={{ color: "var(--color-accent)" }} />
        {editable}
      </div>
    );
  }

  if (block.type === "toggle") {
    return (
      <div className="group py-0.5">
        <div className="flex items-start gap-1.5">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="mt-[6px] shrink-0 text-[var(--text-dim)] transition-transform hover:text-[var(--text)]"
            style={{ transform: collapsed ? "rotate(0deg)" : "rotate(90deg)" }}
          >
            <Icon name="CaretRight" size={14} weight="bold" />
          </button>
          {editable}
        </div>
      </div>
    );
  }

  // başlıklar + metin
  return <div className="group flex items-start py-0.5">{editable}</div>;
}

/* -------------------------------------------------------------------------- */
/*  Slash komut menüsü                                                        */
/* -------------------------------------------------------------------------- */

function SlashMenu({
  query,
  onPick,
  onClose,
}: {
  query: string;
  onPick: (t: BlockType) => void;
  onClose: () => void;
}) {
  const q = query.toLowerCase().trim();
  const items = SLASH_MENU.filter(
    (m) => !q || m.label.toLowerCase().includes(q) || m.keywords.includes(q)
  );
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((a) => Math.min(a + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((a) => Math.max(a - 1, 0));
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (items[active]) onPick(items[active].type);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [items, active, onPick, onClose]);

  if (items.length === 0) {
    return (
      <div className="absolute left-0 top-full z-30 mt-1 w-72 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-panel)] p-3 text-xs text-[var(--text-faint)] shadow-[var(--shadow-pop)]">
        Sonuç yok
      </div>
    );
  }

  return (
    <div className="absolute left-0 top-full z-30 mt-1 max-h-72 w-72 overflow-y-auto rounded-xl border border-[var(--border-strong)] bg-[var(--bg-panel)] p-1.5 shadow-[var(--shadow-pop)] backdrop-blur-xl animate-fade">
      <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">
        Blok ekle
      </div>
      {items.map((m, i) => (
        <button
          key={m.type}
          onMouseEnter={() => setActive(i)}
          onMouseDown={(e) => {
            e.preventDefault();
            onPick(m.type);
          }}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors",
            i === active ? "bg-[var(--bg-hover)]" : "hover:bg-[var(--bg-hover)]"
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--bg-raised)]">
            <Icon name={m.icon} size={16} className="text-[var(--text-dim)]" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-[var(--text)]">{m.label}</span>
            <span className="block truncate text-xs text-[var(--text-faint)]">{m.desc}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Yardımcılar — tipe göre tipografi / placeholder                          */
/* -------------------------------------------------------------------------- */

function textClass(t: BlockType): string {
  switch (t) {
    case "h1":
      return "text-3xl font-bold tracking-tight";
    case "h2":
      return "text-2xl font-semibold tracking-tight";
    case "h3":
      return "text-xl font-semibold";
    case "code":
      return "font-mono text-[13px] text-[var(--text-dim)]";
    case "quote":
      return "text-base italic text-[var(--text-dim)]";
    case "callout":
      return "text-sm text-[var(--text-dim)]";
    case "toggle":
      return "text-base font-medium";
    default:
      return "text-base";
  }
}

function placeholderFor(t: BlockType): string {
  switch (t) {
    case "h1":
      return "Başlık 1";
    case "h2":
      return "Başlık 2";
    case "h3":
      return "Başlık 3";
    case "bullet":
    case "numbered":
      return "Liste öğesi";
    case "todo":
      return "Yapılacak…";
    case "quote":
      return "Alıntı…";
    case "code":
      return "Kod…";
    case "callout":
      return "Bilgi notu…";
    case "toggle":
      return "Toggle başlığı";
    default:
      return "“/” ile komut, yazmaya başla…";
  }
}
