"use client";
import { useEffect, useMemo, useRef } from "react";
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
import { BlockNoteSchema, createCodeBlockSpec } from "@blocknote/core";
import { codeBlockOptions } from "@blocknote/code-block";
import { CursorUsersProvider } from "@/components/collab/CursorUsersProvider";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { insertOrUpdateBlock } from "@blocknote/core";

type Props = {
  initialBlocks?: PartialBlock[];
  editable: boolean;
  provider: any;
  fragment: any;
  cursorName: string;
  cursorColor: string;
  onChange: (doc: any) => void;
  aiBaseUrl?: string;
  partyId: string;
};

export default function BlockNoteStashEditor({ initialBlocks, editable, provider, fragment, cursorName, cursorColor, onChange, aiBaseUrl = "/api/blocknote", partyId }: Props) {
  const editor = useCreateBlockNote(
    {
      schema: BlockNoteSchema.create().extend({
        blockSpecs: {
          codeBlock: createCodeBlockSpec(codeBlockOptions),
        },
      }),
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
      uploadFile: async (file: File) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const uid = user?.id;
        if (!uid) { toast.error("Not authenticated"); throw new Error("Not authenticated"); }
        const nameSafe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${partyId}/${uid}/${Date.now()}-${nameSafe}`;
        const { data, error } = await supabase.storage.from("party-stash-media").upload(path, file, { contentType: file.type, upsert: false });
        if (error) { toast.error("Image upload failed"); throw error; }
        const { data: signed } = await supabase.storage.from("party-stash-media").createSignedUrl(data.path, 604800);
        return signed?.signedUrl ?? "";
      },
      collaboration: {
        provider,
        fragment,
        user: { name: cursorName, color: cursorColor },
        showCursorLabels: "always",
      },
    },
    [aiBaseUrl, provider, fragment, cursorName, cursorColor, initialBlocks, partyId]
  );

  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    if (!initialBlocks || initialBlocks.length === 0) return;
    try {
      const fragLen = (fragment as any)?.length ?? 0;
      if (fragLen === 0) {
        editor.replaceBlocks(editor.document, initialBlocks);
        seededRef.current = true;
      }
    } catch {}
  }, [editor, initialBlocks, fragment]);

  const handleChange = () => {
    try { onChange(editor.document); } catch { }
  };

  return (
    <CursorUsersProvider provider={provider} defaultName={cursorName} defaultColor={cursorColor}>
      <BlockNoteView editor={editor} onChange={handleChange} formattingToolbar={false} slashMenu={false} editable={editable} style={{ minHeight: "60vh", position: "relative" }}>
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
              const baseItems = [
                ...getDefaultReactSlashMenuItems(editor),
                ...(aiBaseUrl ? getAISlashMenuItems(editor) : []),
              ];
              const filtered = baseItems.filter((item: any) => {
                const t = (item?.title || item?.label || "").toLowerCase();
                return t !== "video";
              });
              const items = filtered.map((item: any) => {
                const t = (item?.title || item?.label || "").toLowerCase();
                if (t === "image") {
                  return {
                    ...item,
                    onItemClick: () => {
                      try { insertOrUpdateBlock(editor, { type: "image", props: { previewWidth: 512 } } as any); } catch {}
                    },
                  };
                }
                return item;
              });
              const q = (query || "").toLowerCase();
              if (!q) return items;
              return items.filter((item: any) => {
                const t = (item?.title || item?.label || "").toLowerCase();
                const kw: string[] = item?.keywords || item?.aliases || [];
                const matchKw = Array.isArray(kw) && kw.some((k) => (k || "").toLowerCase().includes(q));
                return t.includes(q) || matchKw;
              });
            }}
          />
        )}
      </BlockNoteView>
    </CursorUsersProvider>
  );
}