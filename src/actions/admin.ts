"use server";
export async function listUsers() {
  return { ok: true, count: 0, users: [] };
}
export async function deleteUser() {
  return { ok: true };
}
export async function updateUserStats() {
  return { ok: true };
}
