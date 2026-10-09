"use client";
import { useState } from "react";
import {
  notificationsFixture,
  notificationPreferencesFixture,
} from "@/features/design-preview/data/fixtures";
export function useNotificationsPreview() {
  const [notifications, setNotifications] = useState(notificationsFixture);
  const [filter, setFilter] = useState("ALL");
  const [preferences, setPreferences] = useState<Record<string, boolean>>({
    ...notificationPreferencesFixture,
  });
  const [message, setMessage] = useState("");
  const mark = (id?: string) => {
    setNotifications((previous) =>
      previous.map((item) => (!id || item.id === id ? { ...item, read: true } : item)),
    );
    setMessage("Status baca hanya berubah lokal.");
  };
  const togglePreference = (key: string, checked: boolean) => {
    setPreferences((previous) => ({ ...previous, [key]: checked }));
    setMessage("Preferensi contoh berubah lokal; tidak mengirim notifikasi.");
  };
  return { notifications, filter, setFilter, preferences, message, mark, togglePreference };
}
