export function normalizeOptionalId(value) {
  return value === "" || value === null || value === undefined
    ? null
    : Number(value);
}

export function normalizeDate(value) {
  return value || null;
}

export function getUserName(users, id) {
  return users.find((user) => user.id === id)?.full_name ?? "Unassigned";
}

export function getProjectName(projects, id) {
  return projects.find((project) => project.id === id)?.name ?? "No project";
}
