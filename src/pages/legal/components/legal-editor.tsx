import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import {
  Bold,
  Braces,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  Table as TableIcon,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { LegalVariableDTO } from "@/types/legal.types";

import { LEGAL_PROSE_CLASS } from "./legal-prose";
import { LegalVariable } from "./legal-variable.extension";

interface LegalEditorProps {
  locale: string;
  value: string;
  onChange: (html: string) => void;
  variables: LegalVariableDTO[];
  readOnly?: boolean;
}

/**
 * Restricted TipTap editor for legal documents: only what the backend LEGAL_TEMPLATE sanitizer
 * keeps (h2/h3, lists, links, quote, rule, tables) plus config-value chips. Typing "/" at the
 * start of a word opens the value picker.
 */
export function LegalEditor({ locale, value, onChange, variables, readOnly = false }: LegalEditorProps) {
  const { t } = useTranslation();
  const [insertOpen, setInsertOpen] = useState(false);

  // The parent mounts the editor only once variables are loaded; chips read them at creation.
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: {
          openOnClick: false,
          autolink: true,
          defaultProtocol: "https",
          protocols: ["mailto"],
          HTMLAttributes: { rel: null, target: null },
        },
      }),
      TableKit.configure({ table: { resizable: false } }),
      LegalVariable.configure({
        resolveValue: (key) => variables.find((v) => v.key === key)?.values[locale] || undefined,
        resolveLabel: (key) => t(`legal.variables.${key}`, { defaultValue: key }),
      }),
    ],
    [locale, t, variables],
  );

  const editor = useEditor({
    extensions,
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: {
        class: cn(LEGAL_PROSE_CLASS, "min-h-[420px] px-6 py-5 focus:outline-none"),
        dir: locale === "ar" ? "rtl" : "ltr",
        lang: locale,
      },
      handleKeyDown: (view, event) => {
        if (event.key !== "/" || event.ctrlKey || event.metaKey) return false;
        const { $from } = view.state.selection;
        const before = $from.parent.textBetween(Math.max(0, $from.parentOffset - 1), $from.parentOffset);
        if (before === "" || /\s/.test(before)) {
          setInsertOpen(true);
          return true;
        }
        return false;
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-md border bg-background">
      {!readOnly && (
        <Toolbar
          editor={editor}
          variables={variables}
          locale={locale}
          insertOpen={insertOpen}
          onInsertOpenChange={setInsertOpen}
        />
      )}
      <EditorContent editor={editor} />
    </div>
  );
}

interface ToolbarProps {
  editor: Editor;
  variables: LegalVariableDTO[];
  locale: string;
  insertOpen: boolean;
  onInsertOpenChange: (open: boolean) => void;
}

function Toolbar({ editor, variables, locale, insertOpen, onInsertOpenChange }: ToolbarProps) {
  const { t } = useTranslation();
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      paragraph: e.isActive("paragraph"),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      bulletList: e.isActive("bulletList"),
      orderedList: e.isActive("orderedList"),
      blockquote: e.isActive("blockquote"),
      link: e.isActive("link"),
      inTable: e.isActive("table"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 p-1">
      <ToolButton label={t("legal.editor.paragraph")} active={state.paragraph} onClick={() => editor.chain().focus().setParagraph().run()}>
        <Pilcrow />
      </ToolButton>
      <ToolButton label={t("legal.editor.heading2")} active={state.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 />
      </ToolButton>
      <ToolButton label={t("legal.editor.heading3")} active={state.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 />
      </ToolButton>
      <Divider />
      <ToolButton label={t("legal.editor.bold")} active={state.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold />
      </ToolButton>
      <ToolButton label={t("legal.editor.italic")} active={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic />
      </ToolButton>
      <ToolButton label={t("legal.editor.underline")} active={state.underline} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon />
      </ToolButton>
      <LinkButton editor={editor} active={state.link} />
      <Divider />
      <ToolButton label={t("legal.editor.bulletList")} active={state.bulletList} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List />
      </ToolButton>
      <ToolButton label={t("legal.editor.orderedList")} active={state.orderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered />
      </ToolButton>
      <ToolButton label={t("legal.editor.quote")} active={state.blockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote />
      </ToolButton>
      <ToolButton label={t("legal.editor.rule")} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus />
      </ToolButton>
      <ToolButton
        label={state.inTable ? t("legal.editor.deleteTable") : t("legal.editor.table")}
        active={state.inTable}
        onClick={() =>
          state.inTable
            ? editor.chain().focus().deleteTable().run()
            : editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
      >
        <TableIcon />
      </ToolButton>
      <Divider />
      <ToolButton label={t("legal.editor.undo")} disabled={!state.canUndo} onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 />
      </ToolButton>
      <ToolButton label={t("legal.editor.redo")} disabled={!state.canRedo} onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 />
      </ToolButton>
      <div className="ms-auto">
        <InsertVariableButton
          editor={editor}
          variables={variables}
          locale={locale}
          open={insertOpen}
          onOpenChange={onInsertOpenChange}
        />
      </div>
    </div>
  );
}

function ToolButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn("[&_svg]:size-4", active && "bg-accent text-accent-foreground")}
    >
      {children}
    </Button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-border" aria-hidden />;
}

function LinkButton({ editor, active }: { editor: Editor; active: boolean }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [href, setHref] = useState("");

  const apply = () => {
    const url = href.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setHref((editor.getAttributes("link").href as string | undefined) ?? "");
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title={t("legal.editor.link")}
          aria-label={t("legal.editor.link")}
          className={cn("[&_svg]:size-4", active && "bg-accent text-accent-foreground")}
        >
          <LinkIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 space-y-2">
        <Input
          value={href}
          onChange={(e) => setHref(e.target.value)}
          placeholder="https://"
          dir="ltr"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              apply();
            }
          }}
          autoFocus
        />
        <p className="text-xs text-muted-foreground">{t("legal.editor.linkHint")}</p>
        <div className="flex justify-end gap-2">
          {active && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                editor.chain().focus().extendMarkRange("link").unsetLink().run();
                setOpen(false);
              }}
            >
              {t("legal.editor.removeLink")}
            </Button>
          )}
          <Button type="button" size="sm" onClick={apply}>
            {t("legal.editor.apply")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function InsertVariableButton({
  editor,
  variables,
  locale,
  open,
  onOpenChange,
}: {
  editor: Editor;
  variables: LegalVariableDTO[];
  locale: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-1.5">
          <Braces className="size-4" />
          {t("legal.editor.insertValue")}
          <kbd className="ms-1 rounded border bg-muted px-1 text-[10px] text-muted-foreground">/</kbd>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-96 p-0"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          editor.commands.focus();
        }}
      >
        <Command>
          <CommandInput placeholder={t("legal.editor.searchValues")} />
          <CommandList>
            <CommandEmpty>{t("common.noResults")}</CommandEmpty>
            <CommandGroup>
              {variables.map((v) => {
                const label = t(`legal.variables.${v.key}`, { defaultValue: v.key });
                const value = v.values[locale];
                return (
                  <CommandItem
                    key={v.key}
                    value={`${label} ${v.key}`}
                    onSelect={() => {
                      editor.chain().focus().insertLegalVariable(v.key).run();
                      onOpenChange(false);
                    }}
                    className="flex-col items-start gap-0.5"
                  >
                    <div className="flex w-full items-center gap-2">
                      <span className="font-medium">{label}</span>
                      {v.material && (
                        <Badge variant="outline" className="ms-auto text-[10px]">
                          {t("legal.kind.MATERIAL")}
                        </Badge>
                      )}
                    </div>
                    <span
                      className={cn("truncate text-xs", value ? "text-muted-foreground" : "text-destructive")}
                      dir="ltr"
                    >
                      {value || t("legal.editor.notConfigured")}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
        <p className="border-t px-3 py-2 text-xs text-muted-foreground">{t("legal.editor.valuesFrozenHint")}</p>
      </PopoverContent>
    </Popover>
  );
}
