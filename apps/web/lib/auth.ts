export type Role = "doctor" | "admin" | null;

export function getRole(): Role {
  if (typeof window === "undefined") return null;
  return (localStorage.getItem("fmd_role") as Role) ?? null;
}

export function setRole(role: Role) {
  if (!role) localStorage.removeItem("fmd_role");
  else localStorage.setItem("fmd_role", role);
}

export function clearAuth() {
  localStorage.removeItem("fmd_role");
}

export function isDoctor() {
  return getRole() === "doctor";
}

export function isAdmin() {
  return getRole() === "admin";
}
