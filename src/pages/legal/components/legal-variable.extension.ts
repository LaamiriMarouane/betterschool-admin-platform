import { Node, mergeAttributes } from "@tiptap/core";

export interface LegalVariableOptions {
  /** Current config value for a key in this editor's locale (shown inside the chip). */
  resolveValue: (key: string) => string | undefined;
  /** Translated label for a key, shown when the value is not configured. */
  resolveLabel: (key: string) => string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    legalVariable: {
      insertLegalVariable: (key: string) => ReturnType;
    };
  }
}

/**
 * Inline atom for a config value (app name, company, URLs) — stored as
 * `<span data-legal-var="key"></span>` and resolved + frozen by the backend at publish
 * (TERMS_AND_PRIVACY_VERSIONING.md §5.4). Authors can delete it but never edit inside it.
 */
export const LegalVariable = Node.create<LegalVariableOptions>({
  name: "legalVariable",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addOptions() {
    return {
      resolveValue: () => undefined,
      resolveLabel: (key) => key,
    };
  },

  addAttributes() {
    return {
      key: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-legal-var"),
        renderHTML: (attributes) => ({ "data-legal-var": attributes.key }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-legal-var]" }];
  },

  // Serialized empty: the value is never part of the template, only of the published text.
  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes)];
  },

  renderText({ node }) {
    return this.options.resolveValue(node.attrs.key) ?? `{${node.attrs.key}}`;
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("span");
      const key = node.attrs.key as string;
      const value = this.options.resolveValue(key);
      dom.setAttribute("data-legal-var", key);
      dom.contentEditable = "false";
      dom.title = this.options.resolveLabel(key);
      dom.className = value
        ? "mx-0.5 rounded bg-primary/10 px-1 py-0.5 text-primary ring-1 ring-primary/20"
        : "mx-0.5 rounded bg-destructive/10 px-1 py-0.5 text-destructive ring-1 ring-destructive/30";
      dom.textContent = value || `⟨${this.options.resolveLabel(key)}⟩`;
      return { dom };
    };
  },

  addCommands() {
    return {
      insertLegalVariable:
        (key) =>
        ({ commands }) =>
          commands.insertContent([{ type: this.name, attrs: { key } }, { type: "text", text: " " }]),
    };
  },
});
