import {
  BriefcaseBusiness,
  ClipboardList,
  Shield,
  Users,
} from "lucide-react";
import { EmptyState, StatusPill } from "../common";
import { getProjectName, getUserName } from "../../utils/entityFormatters";

export function Dashboard({ projects, tasks, users, roles, onTabChange }) {
  const dueSoon = [...tasks]
    .filter((task) => task.status !== "completed")
    .sort((a, b) =>
      (a.due_date || "9999-12-31").localeCompare(b.due_date || "9999-12-31"),
    )
    .slice(0, 5);

  const completedCount = tasks.filter(
    (task) => task.status === "completed",
  ).length;

  return (
    <section className="view">
      <div className="metrics-grid">
        <button
          className="metric"
          type="button"
          onClick={() => onTabChange("projects")}
        >
          <BriefcaseBusiness size={22} />
          <span>Projects</span>
          <strong>{projects.length}</strong>
        </button>
        <button
          className="metric"
          type="button"
          onClick={() => onTabChange("tasks")}
        >
          <ClipboardList size={22} />
          <span>Tasks</span>
          <strong>{tasks.length}</strong>
        </button>
        <button
          className="metric"
          type="button"
          onClick={() => onTabChange("users")}
        >
          <Users size={22} />
          <span>Users</span>
          <strong>{users.length}</strong>
        </button>
        <button
          className="metric"
          type="button"
          onClick={() => onTabChange("roles")}
        >
          <Shield size={22} />
          <span>Roles</span>
          <strong>{roles.length}</strong>
        </button>
      </div>

      <div className="dashboard-grid">
        <section className="surface">
          <div className="section-heading">
            <h2>Due Queue</h2>
            <span>{completedCount} complete</span>
          </div>
          {dueSoon.length === 0 ? (
            <EmptyState label="No open tasks" />
          ) : (
            <div className="task-stack">
              {dueSoon.map((task) => (
                <article className="task-card" key={task.id}>
                  <div>
                    <p>{task.description}</p>
                    <small>
                      {getProjectName(projects, task.project_id)} /{" "}
                      {getUserName(users, task.owner_id)}
                    </small>
                  </div>
                  <StatusPill status={task.status} />
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="surface">
          <div className="section-heading">
            <h2>Workload</h2>
          </div>
          {users.length === 0 ? (
            <EmptyState label="No users" />
          ) : (
            <div className="workload-list">
              {users.map((user) => {
                const count = tasks.filter(
                  (task) =>
                    task.owner_id === user.id && task.status !== "completed",
                ).length;

                return (
                  <div className="workload-row" key={user.id}>
                    <span>{user.full_name}</span>
                    <strong>{count}</strong>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
