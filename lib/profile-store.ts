import { sampleProfiles } from "@/data/students";
import type { EditableProfile, GraduateProfile } from "@/lib/types";

const profileKeyPrefix = "gxu-memory-profile:";
const passwordKeyPrefix = "gxu-memory-password:";

export function findProfile(publicId: string): GraduateProfile | undefined {
  return sampleProfiles.find((profile) => profile.publicId === publicId);
}

export function loadLocalProfile(publicId: string): GraduateProfile | undefined {
  if (typeof window === "undefined") {
    return findProfile(publicId);
  }

  const base = findProfile(publicId);
  const saved = window.localStorage.getItem(`${profileKeyPrefix}${publicId}`);
  const password = window.localStorage.getItem(`${passwordKeyPrefix}${publicId}`);

  if (!base && !saved) {
    return undefined;
  }

  const profile = saved ? (JSON.parse(saved) as GraduateProfile) : base;

  if (!profile) {
    return undefined;
  }

  return {
    ...profile,
    passwordSet: Boolean(password) || profile.passwordSet
  };
}

export function saveLocalProfile(publicId: string, profile: EditableProfile) {
  const existing = loadLocalProfile(publicId);

  if (!existing) {
    return;
  }

  const nextProfile: GraduateProfile = {
    ...existing,
    ...profile,
    photos: profile.photos.slice(0, 10)
  };

  window.localStorage.setItem(
    `${profileKeyPrefix}${publicId}`,
    JSON.stringify(nextProfile)
  );
}

export function saveLocalPassword(publicId: string, password: string) {
  window.localStorage.setItem(`${passwordKeyPrefix}${publicId}`, password);
}

export function verifyLocalPassword(publicId: string, password: string) {
  const saved = window.localStorage.getItem(`${passwordKeyPrefix}${publicId}`);

  if (!saved) {
    return Boolean(password.trim());
  }

  return saved === password;
}
