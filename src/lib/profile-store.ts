import { create } from 'zustand';

// Bits of the signed-in user's /users/me record that more than one screen
// reacts to: the profile picture (sidebar + Account tab) and whether location
// access is enabled (Account tab toggle + the chat's location lookup).
// Shared so a change in Settings shows everywhere at once. Not persisted:
// refetched from /users/me on load.
interface ProfileState {
  /** Small inline image (data URL), or null to show initials. */
  avatarUrl: string | null;
  /** null until /users/me has loaded, so nothing prompts for location early. */
  locationEnabled: boolean | null;
  setAvatarUrl: (url: string | null) => void;
  setLocationEnabled: (enabled: boolean) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  avatarUrl: null,
  locationEnabled: null,
  setAvatarUrl: (avatarUrl) => set({ avatarUrl }),
  setLocationEnabled: (locationEnabled) => set({ locationEnabled }),
}));
