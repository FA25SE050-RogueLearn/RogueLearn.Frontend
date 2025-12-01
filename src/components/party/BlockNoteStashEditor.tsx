"use client";
import { useMemo } from "react";
import { BlockNoteView } from "@blocknote/shadcn";
import { DefaultChatTransport } from "ai";
import {
  FormattingToolbar,
  FormattingToolbarController,
  getFormattingToolbarItems,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
} from "@blocknote/react";
import {
  AIMenuController,
  AIToolbarButton,
  createAIExtension,
  getAISlashMenuItems,
} from "@blocknote/xl-ai";
import { en } from "@blocknote/core/locales";
import { en as aiEn } from "@blocknote/xl-ai/locales";
import type { PartialBlock } from "@blocknote/core";
import { CursorUsersProvider } from "@/components/collab/CursorUsersProvider";

type Props = {
  initialBlocks?: PartialBlock[];
  editable: boolean;
  provider: any;
  fragment: any;
  cursorName: string;
  cursorColor: string;
  onChange: (doc: any) => void;
  aiBaseUrl?: string;
};

export default function BlockNoteStashEditor({ initialBlocks, editable, provider, fragment, cursorName, cursorColor, onChange, aiBaseUrl = "/api/blocknote" }: Props) {
  const editor = useCreateBlockNote(
    {
      dictionary: aiBaseUrl ? ({ ...en, ai: aiEn } as any) : undefined,
      extensions: aiBaseUrl
        ? [
            createAIExtension({
              transport: new DefaultChatTransport({
                api: `${aiBaseUrl}/regular/streamText`,
              }),
            }),
          ]
        : undefined,
      collaboration: {
        provider,
        fragment,
        user: { name: cursorName, color: cursorColor },
        showCursorLabels: "always",
      },
      initialContent: initialBlocks,
    },
    [aiBaseUrl, provider, fragment, cursorName, cursorColor, initialBlocks]
  );

  const handleChange = () => {
    try { onChange(editor.document); } catch { }
  };

  return (
    <CursorUsersProvider provider={provider} defaultName={cursorName} defaultColor={cursorColor}>
      <BlockNoteView editor={editor} onChange={handleChange} formattingToolbar={false} slashMenu={false} editable={editable} style={{ minHeight: "60vh" }}>
        {aiBaseUrl && editable && <AIMenuController />}
        <FormattingToolbarController formattingToolbar={() => (
          <FormattingToolbar>
            {getFormattingToolbarItems()}
            {aiBaseUrl && editable && <AIToolbarButton />}
          </FormattingToolbar>
        )} />
        {editable && (
          <SuggestionMenuController
            triggerCharacter="/"
            getItems={async (query) => {
              const items = [
                ...getDefaultReactSlashMenuItems(editor),
                ...(aiBaseUrl ? getAISlashMenuItems(editor) : []),
              ];
              const q = (query ?? "").toLowerCase();
              if (!q) return items;
              return items.filter((item: any) => {
                const title = (item?.title || item?.label || "").toLowerCase();
                const keywords: string[] = item?.keywords || item?.aliases || [];
                const matchKeywords = Array.isArray(keywords) && keywords.some((k) => (k || "").toLowerCase().includes(q));
                return title.includes(q) || matchKeywords;
              });
            }}
          />
        )}
      </BlockNoteView>
    </CursorUsersProvider>
  );
}