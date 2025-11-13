"use client";

import { ClientSideSuspense, RoomProvider } from "@liveblocks/react/suspense";
import { Loader } from "lucide-react";
import { ReactNode } from "react";

// Room needs to be in a client component, and one should be used in each document page
export function Room({
  children,
  roomId,
}: {
  children: ReactNode;
  roomId: string;
}) {
  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        cursor: null,
      }}
    >
      <ClientSideSuspense fallback={<Loader />}>{children}</ClientSideSuspense>
    </RoomProvider>
  );
}
