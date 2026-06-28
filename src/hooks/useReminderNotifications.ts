import { useEffect } from "react";
import type { Reminder } from "../types";

const dayMs = 24 * 60 * 60 * 1000;

function nextDelay(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const target = new Date();
  target.setHours(hours || 0, minutes || 0, 0, 0);
  if (target.getTime() <= Date.now()) target.setDate(target.getDate() + 1);
  return Math.max(1000, target.getTime() - Date.now());
}

export function useReminderNotifications(reminders: Reminder[]) {
  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return undefined;

    const timers = reminders
      .filter((reminder) => reminder.enabled)
      .map((reminder) =>
        window.setTimeout(() => {
          new Notification(reminder.title, { body: "PGT reminder" });
          if (reminder.repeatType === "daily") {
            window.setInterval(() => new Notification(reminder.title, { body: "PGT reminder" }), dayMs);
          }
        }, nextDelay(reminder.time))
      );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [reminders]);
}
