export const TASK_STATUSES = [
  "new",
  "in-progress",
  "blocked",
  "completed",
  "not-started",
];

export function createEmptyUser() {
  return { full_name: "", email: "", is_active: true, role_ids: [] };
}

export function createEmptyRole() {
  return { name: "", description: "" };
}

export function createEmptyProject() {
  return {
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    owner_id: "",
  };
}

export function createEmptyTask(projectId = "") {
  return {
    description: "",
    due_date: "",
    status: "not-started",
    owner_id: "",
    project_id: projectId,
  };
}
