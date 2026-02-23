import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchNotificationPreferences,
  updateNotificationPreferences,
  NotificationPreferences,
} from "@/api/notifications";
import { toast } from "sonner";

export function useNotificationPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch preferences on mount and when user changes
  useEffect(() => {
    async function loadPreferences() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await fetchNotificationPreferences(user.id);
        if (error) {
          console.warn("Error loading preferences:", error);
          // Create default preferences if none exist
          setPreferences({
            id: "",
            user_id: user.id,
            claim_notifications: true,
            follow_notifications: true,
            wishlist_share_notifications: true,
            weekly_digest: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else {
          setPreferences(data);
        }
      } catch (err) {
        console.error("Error fetching preferences:", err);
        // Set defaults on error
        setPreferences({
          id: "",
          user_id: user.id,
          claim_notifications: true,
          follow_notifications: true,
          wishlist_share_notifications: true,
          weekly_digest: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } finally {
        setLoading(false);
      }
    }

    loadPreferences();
  }, [user]);

  const updatePreference = async (
    key: keyof Omit<
      NotificationPreferences,
      "id" | "user_id" | "created_at" | "updated_at"
    >,
    value: boolean,
  ) => {
    if (!user || !preferences) return;

    setUpdating(true);
    try {
      const { data, error } = await updateNotificationPreferences(user.id, {
        [key]: value,
      });

      if (error) {
        toast.error("Failed to update notification preference");
        return;
      }

      if (data) {
        setPreferences(data);
        toast.success("Notification preference updated");
      }
    } catch (err) {
      console.error("Error updating preference:", err);
      toast.error("Failed to update preference");
    } finally {
      setUpdating(false);
    }
  };

  return {
    preferences,
    loading,
    updating,
    updatePreference,
  };
}
