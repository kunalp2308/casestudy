import { useEffect, useState } from "react";
import { Check, Edit3, Plus, Trash2 } from "lucide-react";
import { createEmptyTask, TASK_STATUSES } from "../../constants/entities";
import {
  getProjectName,
  getUserName,
  normalizeDate,
  normalizeOptionalId,
} from "../../utils/entityFormatters";
import { EmptyState, IconButton, StatusPill } from "../common";
import { TaskFormModal } from "./TaskFormModal";

export function TasksView({
  tasks,
  projects,
  users,
  currentUser,
  canManageTasks,
  projectFilter,
  onSave,
  onDelete,
  onComplete,
  onProjectFilterChange,
}) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => createEmptyTask());
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);

  const visibleTasks = tasks.filter((task) => {
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;
    const matchesProject =
      projectFilter === "all" || String(task.project_id) === projectFilter;
    return matchesStatus && matchesProject;
  });

  function getDefaultProjectId() {
    return projects[0]?.id || "";
  }

  function reset() {
    setEditingId(null);
    setForm(createEmptyTask(getDefaultProjectId()));
    setShowModal(false);
  }

  function openNewTask() {
    setEditingId(null);
    setForm(createEmptyTask(getDefaultProjectId()));
    setShowModal(true);
  }

  function edit(task) {
    setEditingId(task.id);
    setForm({
      description: task.description,
      due_date: task.due_date || "",
      status: task.status,
      owner_id: task.owner_id || "",
      project_id: task.project_id,
    });
    setShowModal(true);
  }

  function updateForm(values) {
    setForm((current) => ({ ...current, ...values }));
  }

  useEffect(() => {
    if (!editingId && !form.project_id && projects[0]?.id) {
      setForm((current) => ({ ...current, project_id: projects[0].id }));
    }
  }, [editingId, form.project_id, projects]);

  async function submit(event) {
    event.preventDefault();
    await onSave("tasks", editingId, {
      ...form,
      due_date: normalizeDate(form.due_date),
      owner_id: normalizeOptionalId(form.owner_id),
      project_id: Number(form.project_id),
    });
    reset();
  }

  return (
    <section className="view">
      <section className="surface table-surface">
        <div className="section-heading">
          <h2>Tasks</h2>
          <div className="toolbar-group">
            <select
              className="project-filter-select"
              value={projectFilter}
              onChange={(event) => onProjectFilterChange(event.target.value)}
            >
              <option value="all">All projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All</option>
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {canManageTasks && (
              <button
                className="primary-button"
                type="button"
                onClick={openNewTask}
              >
                <Plus size={17} />
                New Task
              </button>
            )}
          </div>
        </div>
        {visibleTasks.length === 0 ? (
          <EmptyState label="No tasks" />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Project</th>
                  <th>Owner</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visibleTasks.map((task) => {
                  const canCompleteTask =
                    canManageTasks || task.owner_id === currentUser?.id;

                  return (
                    <tr key={task.id}>
                      <td>{task.description}</td>
                      <td>{getProjectName(projects, task.project_id)}</td>
                      <td>{getUserName(users, task.owner_id)}</td>
                      <td>{task.due_date || ""}</td>
                      <td>
                        <StatusPill status={task.status} />
                      </td>
                      <td className="row-actions">
                        {canCompleteTask && (
                          <IconButton
                            label="Mark complete"
                            onClick={() => onComplete(task.id)}
                            disabled={task.status === "completed"}
                          >
                            <Check size={16} />
                          </IconButton>
                        )}
                        {canManageTasks && (
                          <>
                            <IconButton
                              label="Edit task"
                              onClick={() => edit(task)}
                            >
                              <Edit3 size={16} />
                            </IconButton>
                            <IconButton
                              label="Delete task"
                              className="danger"
                              onClick={() => onDelete("tasks", task.id)}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {canManageTasks && showModal && (
        <TaskFormModal
          editingId={editingId}
          form={form}
          projects={projects}
          users={users}
          onCancel={reset}
          onChange={updateForm}
          onSubmit={submit}
        />
      )}
    </section>
  );
}
