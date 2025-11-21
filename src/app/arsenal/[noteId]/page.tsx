// "use client";

// import { useEffect, useRef, useState } from "react";
// import { useRouter, useParams } from "next/navigation";
// import notesApi from "@/api/notesApi";
// import tagsApi from "@/api/tagsApi";
// import { NoteDto } from "@/types/notes";
// import { Tag } from "@/types/tags";
// import { DashboardFrame } from "@/components/layout/DashboardFrame";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { toast } from "sonner";
// import { createClient } from "@/utils/supabase/client";
// import { Loader2, Section } from "lucide-react";

// // BlockNote imports
// import { PartialBlock } from "@blocknote/core";
// import { en } from "@blocknote/core/locales";
// import "@blocknote/core/fonts/inter.css";
// import { BlockNoteView } from "@blocknote/shadcn";
// import "@blocknote/shadcn/style.css";
// import {
//   FormattingToolbar,
//   FormattingToolbarController,
//   getFormattingToolbarItems,
//   SuggestionMenuController,
//   getDefaultReactSlashMenuItems,
//   useCreateBlockNote,
// } from "@blocknote/react";

// // Optional AI extension (will be disabled if env missing)
// import {
//   AIMenuController,
//   AIToolbarButton,
//   createAIExtension,
//   getAISlashMenuItems,
// } from "@blocknote/xl-ai";
// import { en as aiEn } from "@blocknote/xl-ai/locales";
// import "@blocknote/xl-ai/style.css";
// import { DefaultChatTransport } from "ai";
// import partiesApi from "@/api/partiesApi";
// import { PartyDto } from "@/types/parties";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { usePartyRole } from "@/hooks/usePartyRole";

// type EditorStatus = "loading" | "ready" | "saving" | "dirty";

// export default function NoteEditorPage() {
//   const router = useRouter();
//   const params = useParams();
//   const noteIdParam = (params as any)?.noteId;
//   const noteId = Array.isArray(noteIdParam) ? noteIdParam[0] : noteIdParam;

//   const [authUserId, setAuthUserId] = useState<string | null>(null);
//   const [note, setNote] = useState<NoteDto | null>(null);
//   const [title, setTitle] = useState("");
//   const [isPublic, setIsPublic] = useState(false);
//   const [lastSavedIsPublic, setLastSavedIsPublic] = useState<boolean>(false);
//   const [status, setStatus] = useState<EditorStatus>("loading");
//   const [initialBlocks, setInitialBlocks] = useState<
//     PartialBlock[] | undefined
//   >(undefined);

//   const [myTags, setMyTags] = useState<Tag[]>([]);
//   const [noteTags, setNoteTags] = useState<Tag[]>([]);
//   const [newTagName, setNewTagName] = useState<string>("");
//   const [lastTagAction, setLastTagAction] = useState<{ type: "attach" | "detach"; tagId: string; tagName: string } | null>(null);
//   const [aiSuggestions, setAiSuggestions] = useState<
//     {
//       label: string;
//       confidence: number;
//       matchedTagId?: string;
//       reason?: string;
//       isExisting: boolean;
//     }[]
//   >([]);
//   const [aiLoading, setAiLoading] = useState(false);
//   const [selectedAiKeys, setSelectedAiKeys] = useState<string[]>([]);
//   const saveTimerRef = useRef<number | null>(null);
//   const [queuedCount, setQueuedCount] = useState(0);

//   // Share to Party Stash modal state
//   const [shareOpen, setShareOpen] = useState(false);
//   const [myParties, setMyParties] = useState<PartyDto[]>([]);
//   const [sharePartyId, setSharePartyId] = useState<string | null>(null);
//   const [shareTitle, setShareTitle] = useState<string>("");
//   const [shareTags, setShareTags] = useState<string>("");
//   const { role: shareRole } = usePartyRole(sharePartyId ?? "");

//   useEffect(() => {
//     const supabase = createClient();
//     supabase.auth
//       .getUser()
//       .then(({ data }) => setAuthUserId(data.user?.id ?? null));
//   }, []);

//   useEffect(() => {
//     if (!noteId) return;
//     const load = async () => {
//       setStatus("loading");
//       try {
//         const res = await notesApi.getById(noteId);
//         if (res.isSuccess && res.data) {
//           const n = res.data;
//           setNote(n);
//           setTitle(n.title);
//           setIsPublic(n.isPublic);
//           setLastSavedIsPublic(n.isPublic);
//           // Parse content which may be a JSON string or an object already
//           let blocks: PartialBlock[] | undefined = undefined;
//           const raw = n.content;
//           if (raw) {
//             if (typeof raw === "string") {
//               try {
//                 const parsed = JSON.parse(raw);
//                 if (Array.isArray(parsed)) {
//                   blocks = parsed as PartialBlock[];
//                 } else if (parsed && typeof parsed === "object" && Array.isArray((parsed as any).blocks)) {
//                   blocks = (parsed as any).blocks as PartialBlock[];
//                 }
//               } catch {
//                 // Ignore parse errors
//               }
//             } else if (typeof raw === "object") {
//               if (Array.isArray(raw)) {
//                 blocks = raw as PartialBlock[];
//               } else if (Array.isArray((raw as any).blocks)) {
//                 blocks = (raw as any).blocks as PartialBlock[];
//               }
//             }
//           }
//           // Provide a valid fallback block if content is empty or parsing failed
//           const fallback: PartialBlock[] = [
//             {
//               type: "paragraph",
//               content: [{ type: "text", text: n.title ?? "", styles: {} }],
//             },
//           ];
//           setInitialBlocks(blocks && blocks.length > 0 ? blocks : fallback);
//         }
//       } finally {
//         setStatus("ready");
//       }
//     };
//     const loadTags = async () => {
//       try {
//         const my = await tagsApi.getMyTags();
//         if (my.isSuccess) setMyTags((my.data as any)?.tags ?? []);
//         const nt = await tagsApi.getTagsForNote(noteId);
//         if (nt.isSuccess) setNoteTags(nt.data.tags);
//         const parties = await partiesApi.getMine();
//         if (parties.isSuccess) setMyParties(parties.data);
//       } catch {}
//     };
//     try {
//       const raw = localStorage.getItem(`noteDraft:${noteId}`);
//       if (raw) {
//         const d = JSON.parse(raw);
//         if (typeof d?.title === "string") setTitle(d.title);
//         if (typeof d?.isPublic === "boolean") setIsPublic(d.isPublic);
//         if (Array.isArray(d?.content) && d.content.length > 0) setInitialBlocks(d.content);
//       }
//     } catch {}
//     load();
//     loadTags();
//   }, [noteId]);

//   const AI_BASE_URL = process.env.NEXT_PUBLIC_BLOCKNOTE_AI_SERVER_BASE_URL;

//   const editor = useCreateBlockNote(
//     {
//       initialContent: initialBlocks,
//       dictionary: AI_BASE_URL ? ({ ...en, ai: aiEn } as any) : undefined,
//       extensions: AI_BASE_URL
//         ? [
//             createAIExtension({
//               transport: new DefaultChatTransport({
//                 api: `${AI_BASE_URL}/regular/streamText`,
//               }),
//             }),
//           ]
//         : undefined,
//     },
//     [initialBlocks, AI_BASE_URL]
//   );

//   // Autosave title & public toggle
//   useEffect(() => {
//     if (!noteId || !authUserId) return;
//     // Immediately mark as dirty to reflect unsaved changes
//     const existingContentNow = editor
//       ? JSON.stringify(editor.document)
//       : typeof note?.content === "string" && note.content.length > 0
//         ? note.content
//         : null;
//     if (existingContentNow != null) {
//       setStatus("dirty");
//     }
//     const handle = setTimeout(async () => {
//       // Only autosave title/public when we can safely include content
//       const existingContent = editor
//         ? JSON.stringify(editor.document)
//         : typeof note?.content === "string" && note.content.length > 0
//           ? note.content
//           : null;
//       if (existingContent == null) return; // avoid overwriting with empty content
//       setStatus("saving");
//       const payload = {
//         authUserId,
//         title: title.trim(),
//         isPublic: isPublic,
//         content: existingContent,
//       };
//       try {
//         if (!navigator.onLine) {
//           const qk = `notesQueue:${noteId}`;
//           const raw = localStorage.getItem(qk);
//           const arr = raw ? JSON.parse(raw) : [];
//           arr.push({ ts: Date.now(), payload });
//           localStorage.setItem(qk, JSON.stringify(arr));
//           localStorage.setItem(`noteDraft:${noteId}`, JSON.stringify({ title, isPublic, content: editor ? editor.document : initialBlocks }));
//           setQueuedCount(arr.length);
//         } else {
//           await notesApi.update(noteId, payload);
//           localStorage.setItem(`noteDraft:${noteId}`, JSON.stringify({ title, isPublic, content: editor ? editor.document : initialBlocks }));
//           setLastSavedIsPublic(isPublic);
//         }
//       } catch (e: any) {
//         if (navigator.onLine) {
//           if (e?.response?.status === 403) {
//             toast.error("Permission denied updating public state");
//           } else {
//             toast.error("Failed to save changes");
//           }
//           setIsPublic(lastSavedIsPublic);
//         }
//       } finally {
//         setStatus("ready");
//       }
//     }, 1000);
//     return () => clearTimeout(handle);
//   }, [title, isPublic, noteId, authUserId, editor, initialBlocks, lastSavedIsPublic, note]);

//   // Save content on change (debounced by BlockNoteView onChange frequency)
//   const onEditorChange = () => {
//     if (!noteId || !authUserId || !editor) return;
//     // Debounce saves to avoid spamming the API and to make status updates visible
//     if (saveTimerRef.current) {
//       clearTimeout(saveTimerRef.current);
//     }
//     // Show unsaved changes immediately on keystroke
//     setStatus("dirty");
//     saveTimerRef.current = window.setTimeout(async () => {
//       setStatus("saving");
//       const json = editor.document;
//       const payload = {
//         authUserId,
//         content: JSON.stringify(json),
//         isPublic: isPublic,
//         title: title.trim(),
//       };
//       try {
//         if (!navigator.onLine) {
//           const qk = `notesQueue:${noteId}`;
//           const raw = localStorage.getItem(qk);
//           const arr = raw ? JSON.parse(raw) : [];
//           arr.push({ ts: Date.now(), payload });
//           localStorage.setItem(qk, JSON.stringify(arr));
//           localStorage.setItem(`noteDraft:${noteId}`, JSON.stringify({ title, isPublic, content: json }));
//           setQueuedCount(arr.length);
//         } else {
//           await notesApi.update(noteId, payload);
//           localStorage.setItem(`noteDraft:${noteId}`, JSON.stringify({ title, isPublic, content: json }));
//         }
//       } catch (e: any) {
//         if (navigator.onLine) {
//           toast.error("Failed to save changes");
//         }
//       } finally {
//         setStatus("ready");
//       }
//     }, 2000);
//   };

//   useEffect(() => {
//     return () => {
//       if (saveTimerRef.current) {
//         clearTimeout(saveTimerRef.current);
//       }
//     };
//   }, []);

//   useEffect(() => {
//     const drain = async () => {
//       if (!noteId || !authUserId) return;
//       const qk = `notesQueue:${noteId}`;
//       const raw = localStorage.getItem(qk);
//       if (!raw) return;
//       const arr = JSON.parse(raw);
//       if (!Array.isArray(arr) || arr.length === 0) return;
//       arr.sort((a: any, b: any) => a.ts - b.ts);
//       for (const it of arr) {
//         try {
//           await notesApi.update(noteId, it.payload);
//         } catch {
//           break;
//         }
//       }
//       localStorage.setItem(qk, JSON.stringify([]));
//       setQueuedCount(0);
//       toast.success("Queued changes synced");
//     };
//     const onOnline = () => {
//       drain();
//     };
//     window.addEventListener("online", onOnline);
//     drain();
//     return () => {
//       window.removeEventListener("online", onOnline);
//     };
//   }, [noteId, authUserId]);

//   const requestAiTags = async () => {
//     if (!authUserId || !noteId) return;
//     setAiLoading(true);
//     try {
//       const res = await notesApi.suggestTags({
//         authUserId,
//         noteId,
//         maxTags: 8,
//       });
//       if (res.isSuccess) setAiSuggestions(res.data.suggestions);
//       setSelectedAiKeys([]);
//     } finally {
//       setAiLoading(false);
//     }
//   };

//   const commitAiTags = async (existingIds: string[], newNames: string[]) => {
//     if (!authUserId || !noteId) return;
//     const res = await notesApi.commitTagSelections({
//       authUserId,
//       noteId,
//       selectedTagIds: existingIds,
//       newTagNames: newNames,
//     });
//     if (res.isSuccess) {
//       toast.success(`Applied ${res.data.totalTagsAssigned} tags`);
//       setAiSuggestions([]);
//       setSelectedAiKeys([]);
//       const nt = await tagsApi.getTagsForNote(noteId);
//       if (nt.isSuccess) setNoteTags(nt.data.tags);
//     }
//   };

//   const keyForSuggestion = (s: { label: string; matchedTagId?: string }) =>
//     s.matchedTagId ? `id:${s.matchedTagId}` : `new:${s.label.toLowerCase()}`;

//   const toggleSelectSuggestion = (s: { label: string; matchedTagId?: string }) => {
//     const k = keyForSuggestion(s);
//     setSelectedAiKeys((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
//   };

//   const applySelected = () => {
//     const existingIds: string[] = [];
//     const newNames: string[] = [];
//     for (const s of aiSuggestions) {
//       const k = keyForSuggestion(s);
//       if (!selectedAiKeys.includes(k)) continue;
//       if (s.matchedTagId) existingIds.push(s.matchedTagId);
//       else newNames.push(s.label);
//     }
//     if (existingIds.length === 0 && newNames.length === 0) {
//       toast.info("No suggestions selected");
//       return;
//     }
//     commitAiTags(existingIds, newNames);
//   };

//   const attachTag = async (tagId: string) => {
//     if (!authUserId || !noteId) return;
//     const res = await tagsApi.attachToNote({ authUserId, noteId, tagId });
//     if (res.isSuccess) {
//       toast.success(`Attached tag '${res.data.tag.name}'`);
//       const nt = await tagsApi.getTagsForNote(noteId);
//       if (nt.isSuccess) setNoteTags(nt.data.tags);
//       setLastTagAction({ type: "attach", tagId, tagName: res.data.tag.name });
//     }
//   };

//   const detachTag = async (tagId: string) => {
//     if (!authUserId || !noteId) return;
//     await tagsApi.removeFromNote({ authUserId, noteId, tagId });
//     const nt = await tagsApi.getTagsForNote(noteId);
//     if (nt.isSuccess) setNoteTags(nt.data.tags);
//     const t = myTags.find((x) => x.id === tagId);
//     setLastTagAction({ type: "detach", tagId, tagName: t?.name ?? "" });
//   };

//   if (status === "loading") {
//     return (
//       <DashboardFrame>
//         <div className="flex h-[60vh] items-center justify-center">
//           <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading note...
//         </div>
//       </DashboardFrame>
//     );
//   }

//   return (
//     <DashboardFrame>
//       <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 pb-24">
//         <section className="relative overflow-hidden rounded-[28px] border border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810]/60 via-[#1a0a08]/80 to-black/90 p-6">
//           <div
//             className="pointer-events-none absolute inset-0 opacity-20"
//             style={{
//               backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
//               backgroundSize: "100px",
//               backgroundBlendMode: "overlay",
//             }}
//           >
//           <div className="relative z-10">
//             <div className="flex items-center gap-3">
//               <Input
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 placeholder="Title"
//                 className="border-[#f5c16c]/20 bg-black/40 font-semibold text-white focus-visible:border-[#f5c16c] focus-visible:ring-[#f5c16c]/30"
//               />
//               <Label htmlFor="public-toggle" className="text-xs">
//                 Public
//               </Label>
//               <span className="text-xs text-foreground/60">
//                 {status === "saving"
//                   ? "Saving..."
//                   : status === "dirty"
//                     ? "Unsaved changes"
//                     : "Saved"}
//               </span>
//               {queuedCount > 0 && (
//                 <span className="ml-2 rounded-md border border-yellow-600/40 bg-yellow-900/20 px-2 py-1 text-xs text-yellow-200">
//                   {queuedCount} queued
//                 </span>
//               )}
//               {/* Share to Party Stash */}
//               <TooltipProvider>
//                 <Tooltip>
//                   <TooltipTrigger asChild>
//                     <Dialog open={shareOpen} onOpenChange={setShareOpen}>
//                       <DialogTrigger asChild>
//                         <Button
//                           variant="secondary"
//                           size="sm"
//                           disabled={!isPublic}
//                         >
//                           Share to Party Stash
//                         </Button>
//                       </DialogTrigger>
//                       <DialogContent>
//                         <DialogHeader>
//                           <DialogTitle>Share to Party Stash</DialogTitle>
//                         </DialogHeader>
//                         <div className="space-y-3">
//                           {!isPublic && (
//                             <div className="rounded-md border border-yellow-600/40 bg-yellow-900/20 p-2 text-xs text-yellow-200">
//                               Note must be public to share.
//                             </div>
//                           )}
//                           {sharePartyId && !(shareRole === "Leader" || shareRole === "CoLeader") && (
//                             <div className="rounded-md border border-red-600/40 bg-red-900/20 p-2 text-xs text-red-200">
//                               Only Leader or CoLeader of the selected party can share notes.
//                             </div>
//                           )}
//                           <div className="grid grid-cols-2 gap-2 items-center">
//                             <Label className="text-xs">Party</Label>
//                             <Select
//                               onValueChange={(v) => setSharePartyId(v)}
//                               value={sharePartyId ?? undefined}
//                             >
//                               <SelectTrigger className="h-8">
//                                 <SelectValue placeholder="Select a party" />
//                               </SelectTrigger>
//                               <SelectContent>
//                                 {myParties.map((p) => (
//                                   <SelectItem key={p.id} value={p.id}>
//                                     {p.name}
//                                   </SelectItem>
//                                 ))}
//                               </SelectContent>
//                             </Select>
//                           </div>
//                           <div className="grid grid-cols-2 gap-2 items-center">
//                             <Label className="text-xs">Title</Label>
//                             <Input
//                               value={shareTitle || title}
//                               onChange={(e) => setShareTitle(e.target.value)}
//                               placeholder="Stash item title"
//                             />
//                           </div>
//                           <div className="grid grid-cols-2 gap-2 items-center">
//                             <Label className="text-xs">Tags</Label>
//                             <Input
//                               value={shareTags}
//                               onChange={(e) => setShareTags(e.target.value)}
//                               placeholder="Comma-separated tags"
//                             />
//                           </div>
//                         </div>
//                         <DialogFooter>
//                           <Button
//                             disabled={!isPublic || !sharePartyId || !(shareRole === "Leader" || shareRole === "CoLeader")}
//                             onClick={async () => {
//                               if (!isPublic) {
//                                 toast.error("Note must be public to share.");
//                                 return;
//                               }
//                               if (!sharePartyId) {
//                                 toast.error("Please select a party.");
//                                 return;
//                               }
//                               if (!(shareRole === "Leader" || shareRole === "CoLeader")) {
//                                 toast.error("Only Leader or CoLeader can share to this party.");
//                                 return;
//                               }
//                               try {
//                                 const tags = shareTags
//                                   .split(",")
//                                   .map((t) => t.trim())
//                                   .filter((t) => t.length > 0);
//                                 // provenance tag
//                                 if (noteId) tags.push(`source:note:${noteId}`);
//                                 // Share raw BlockNote document array (no wrapper), same as note content
//                                 const contentArray = (editor?.document ?? initialBlocks ?? []) as any[];
//                                 const res = await partiesApi.addResource(sharePartyId, {
//                                   title: (shareTitle || title).trim(),
//                                   content: contentArray,
//                                   tags,
//                                   originalNoteId: noteId,
//                                 });
//                                 if (res.isSuccess) {
//                                   toast.success("Shared to party stash");
//                                   setShareOpen(false);
//                                   setShareTags("");
//                                   setSharePartyId(null);
//                                 }
//                               } catch (e: any) {
//                                 toast.error(e?.response?.status === 403 ? "Permission denied" : "Failed to share");
//                               }
//                             }}
//                           >
//                             Share
//                           </Button>
//                         </DialogFooter>
//                       </DialogContent>
//                     </Dialog>
//                   </TooltipTrigger>
//                   {!isPublic && (
//                     <TooltipContent>
//                       Make note public to enable sharing
//                     </TooltipContent>
//                   )}
//                 </Tooltip>
//               </TooltipProvider>
//         </div>
//       </div>
//       <Separator className="my-3" />

//           <BlockNoteView
//             editor={editor}
//             onChange={onEditorChange}
//             formattingToolbar={false}
//             slashMenu={false}
//             style={{ minHeight: "60vh" }}
//           >
//             {/* AI command menu if enabled */}
//             {AI_BASE_URL && <AIMenuController />}

//             {/* Custom formatting toolbar including AI button */}
//             <FormattingToolbarController
//               formattingToolbar={() => (
//                 <FormattingToolbar>
//                   {...getFormattingToolbarItems()}
//                   {AI_BASE_URL && <AIToolbarButton />}
//                 </FormattingToolbar>
//               )}
//             />

//             {/* Slash menu with AI if enabled */}
//             <SuggestionMenuController
//               triggerCharacter="/"
//               getItems={async (query) => {
//                 const items = [
//                   ...getDefaultReactSlashMenuItems(editor),
//                   ...(AI_BASE_URL ? getAISlashMenuItems(editor) : []),
//                 ];
//                 const q = (query ?? "").toLowerCase();
//                 if (!q) return items;
//                 return items.filter((item: any) => {
//                   const title = (
//                     item?.title ||
//                     item?.label ||
//                     ""
//                   ).toLowerCase();
//                   const keywords: string[] =
//                     item?.keywords || item?.aliases || [];
//                   const matchKeywords =
//                     Array.isArray(keywords) &&
//                     keywords.some((k) => (k || "").toLowerCase().includes(q));
//                   return title.includes(q) || matchKeywords;
//                 });
//               }}
//             />
//           </BlockNoteView>
//           </div>
//         </section>
//         </ div>

//         {/* Sidebar: Tags & AI Suggestions */}
//         <aside className="relative overflow-hidden rounded-[28px] border border-[#f5c16c]/20 bg-gradient-to-br from-[#2d1810]/60 via-[#1a0a08]/80 to-black/90 p-6">
//           <div
//             className="pointer-events-none absolute inset-0 opacity-20"
//             style={{
//               backgroundImage: "url('https://www.transparenttextures.com/patterns/asfalt-dark.png')",
//               backgroundSize: "100px",
//               backgroundBlendMode: "overlay",
//             }}
//           />
//           <div className="relative z-10">
//             <h3 className="mb-2 text-sm font-semibold text-[#f5c16c]">Tags</h3>
//             <div className="mb-3 flex flex-wrap gap-2">
//               {noteTags.map((t) => (
//                 <span
//                   key={t.id}
//                   className="inline-flex items-center gap-2 rounded-full border border-[#f5c16c]/40 bg-[#f5c16c]/10 px-2 py-1 text-xs text-[#f5c16c]"
//                 >
//                   {t.name}
//                   <button
//                     className="text-white/60 hover:text-white"
//                     onClick={() => detachTag(t.id)}
//                   >
//                     ✕
//                   </button>
//                 </span>
//               ))}
//             </div>
//             <Label htmlFor="attach-tag" className="text-xs text-[#f5c16c]/80">
//               Attach existing tag
//             </Label>
//             <div className="mt-1 grid grid-cols-[1fr_auto] gap-2">
//               <select
//                 id="attach-tag"
//                 className="rounded-md border border-[#f5c16c]/20 bg-black/40 p-2 text-sm text-white focus:border-[#f5c16c] focus:outline-none focus:ring-1 focus:ring-[#f5c16c]/30"
//               >
//                 {myTags.map((t) => (
//                   <option key={t.id} value={t.id}>
//                     {t.name}
//                   </option>
//                 ))}
//               </select>
//               <Button
//                 variant="secondary"
//                 size="sm"
//                 onClick={() => {
//                   const sel = (
//                     document.getElementById(
//                       "attach-tag"
//                     ) as HTMLSelectElement | null
//                   )?.value;
//                   if (sel) attachTag(sel);
//                 }}
//                 className="border-[#f5c16c]/20 bg-black/40 hover:border-[#f5c16c]/40 hover:bg-black/60"
//               >
//                 Attach
//               </Button>
//             </div>

//             <Separator className="my-4 bg-[#f5c16c]/20" />
//             <h3 className="mb-2 text-sm font-semibold text-[#f5c16c]">
//               AI Tag Suggestions
//             </h3>
//             <Button
//               variant="secondary"
//               size="sm"
//               onClick={requestAiTags}
//               disabled={aiLoading}
//               className="border-[#f5c16c]/20 bg-black/40 hover:border-[#f5c16c]/40 hover:bg-black/60"
//             >
//               {aiLoading ? "Suggesting..." : "Suggest tags"}
//             </Button>
//           </div>

//           <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
//             <Input
//               value={newTagName}
//               onChange={(e) => setNewTagName(e.target.value)}
//               placeholder="Create new tag"
//               aria-label="New tag name"
//             />
//             <Button
//               size="sm"
//               onClick={async () => {
//                 if (!authUserId || !noteId) return;
//                 const name = newTagName.trim();
//                 if (!name) {
//                   toast.error("Tag name cannot be empty");
//                   return;
//                 }
//                 const exists = myTags.some((t) => t.name.toLowerCase() === name.toLowerCase());
//                 if (exists) {
//                   toast.error("Tag already exists");
//                   return;
//                 }
//                 try {
//                   const res = await tagsApi.create({ authUserId, name });
//                   if (res.isSuccess) {
//                     setNewTagName("");
//                     const my = await tagsApi.getMyTags();
//                     if (my.isSuccess) setMyTags((my.data as any)?.tags ?? []);
//                     toast.success("Tag created");
//                   }
//                 } catch {
//                   toast.error("Failed to create tag");
//                 }
//               }}
//             >
//               Create
//             </Button>
//           </div>

//           {lastTagAction && (
//             <div className="mt-2 flex items-center gap-2 text-xs text-foreground/70">
//               <span>
//                 Last action: {lastTagAction.type === "attach" ? "Attached" : "Detached"} &quot;{lastTagAction.tagName}&quot;
//               </span>
//               <Button
//                 size="sm"
//                 variant="ghost"
//                 onClick={async () => {
//                   if (!authUserId || !noteId || !lastTagAction) return;
//                   if (lastTagAction.type === "attach") {
//                     await tagsApi.removeFromNote({ authUserId, noteId, tagId: lastTagAction.tagId });
//                   } else {
//                     await tagsApi.attachToNote({ authUserId, noteId, tagId: lastTagAction.tagId });
//                   }
//                   const nt = await tagsApi.getTagsForNote(noteId);
//                   if (nt.isSuccess) setNoteTags(nt.data.tags);
//                   setLastTagAction(null);
//                 }}
//                 aria-label="Undo last tag action"
//               >
//                 Undo
//               </Button>
//             </div>
//           )}

//           <Separator className="my-4" />
//           <h3 className="mb-2 text-sm font-semibold text-white">
//             AI Tag Suggestions
//           </h3>
//           <Button
//             variant="secondary"
//             size="sm"
//             onClick={requestAiTags}
//             disabled={aiLoading}
//           >
//             {aiLoading ? "Suggesting..." : "Suggest tags"}
//           </Button>
//           {aiSuggestions.length > 0 && (
//             <div className="mt-3 space-y-2">
//               {aiSuggestions.map((s, idx) => (
//                 <Card key={idx} className="border-white/10 bg-black/30">
//                   <CardHeader className="py-2">
//                     <CardTitle className="flex items-center justify-between text-sm text-white">
//                       <span>
//                         {s.label}{" "}
//                         <span className="ml-2 text-xs text-foreground/60">
//                           {Math.round(s.confidence * 100)}%
//                         </span>
//                       </span>
//                       <div className="flex items-center gap-2">
//                         {s.matchedTagId && (
//                           <span className="rounded-full border border-green-500/40 bg-green-500/15 px-2 py-0.5 text-[10px] text-green-300">Existing</span>
//                         )}
//                         <Checkbox
//                           checked={selectedAiKeys.includes(keyForSuggestion(s))}
//                           onCheckedChange={() => toggleSelectSuggestion(s)}
//                           aria-label="Select suggestion"
//                         />
//                       </div>
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent className="py-2 text-xs text-foreground/70">
//                     {s.reason}
//                   </CardContent>
//                 </Card>
//               ))}
//               <div className="flex gap-2">
//                 <Button size="sm" onClick={applySelected}>Apply selected</Button>
//                 <Button
//                   size="sm"
//                   onClick={() => {
//                     const existingIds = aiSuggestions
//                       .filter((s) => s.matchedTagId)
//                       .map((s) => s.matchedTagId!);
//                     const newNames = aiSuggestions
//                       .filter((s) => !s.matchedTagId)
//                       .map((s) => s.label);
//                     commitAiTags(existingIds, newNames);
//                   }}
//                 >
//                   Apply all
//                 </Button>
//                 <Button
//                   size="sm"
//                   variant="ghost"
//                   onClick={() => { setAiSuggestions([]); setSelectedAiKeys([]); }}
//                 >
//                   Clear
//                 </Button>
//               </div>
//             {'}'}}
//           </div>
//         </aside>
//       </ DashboardFrame>
//   );
// }
