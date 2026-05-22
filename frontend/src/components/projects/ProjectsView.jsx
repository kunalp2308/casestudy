import { useState } from "react";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { createEmptyProject } from "../../constants/entities";
import {
  getUserName,
  normalizeDate,
  normalizeOptionalId,
} from "../../utils/entityFormatters";
import { EmptyState, IconButton } from "../common";
import { ProjectFormModal } from "./ProjectFormModal";

export function ProjectsView({
  projects,
  users,
  onSave,
  onDelete,
  onOpenProjectTasks,
}) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => createEmptyProject());
  const [showModal, setShowModal] = useState(false);

  function reset() {
    setEditingId(null);
    setForm(createEmptyProject());
    setShowModal(false);
  }

  function openNewProject() {
    setEditingId(null);
    setForm(createEmptyProject());
    setShowModal(true);
  }

  function edit(project) {
    setEditingId(project.id);
    setForm({
      name: project.name,
      description: project.description || "",
      start_date: project.start_date || "",
      end_date: project.end_date || "",
      owner_id: project.owner_id || "",
    });
    setShowModal(true);
  }

  function updateForm(values) {
    setForm((current) => ({ ...current, ...values }));
  }

  async function submit(event) {
    event.preventDefault();
    await onSave("projects", editingId, {
      ...form,
      start_date: normalizeDate(form.start_date),
      end_date: normalizeDate(form.end_date),
      owner_id: normalizeOptionalId(form.owner_id),
    });
    reset();
  }

  return (
    <section className="view">
      <section className="surface table-surface">
        <div className="section-heading">
          <h2>Projects</h2>
          <button
            className="primary-button"
            type="button"
            onClick={openNewProject}
          >
            <Plus size={17} />
            New Project
          </button>
        </div>
        {projects.length === 0 ? (
          <EmptyState label="No projects" />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Owner</th>
                  <th>Start</th>
                  <th>End</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <button
                        className="table-link"
                        type="button"
                        onClick={() => onOpenProjectTasks(project.id)}
                      >
                        {project.name}
                      </button>
                      <small>{project.description || ""}</small>
                    </td>
                    <td>{getUserName(users, project.owner_id)}</td>
                    <td>{project.start_date || ""}</td>
                    <td>{project.end_date || ""}</td>
                    <td className="row-actions">
                      <IconButton
                        label="Edit project"
                        onClick={() => edit(project)}
                      >
                        <Edit3 size={16} />
                      </IconButton>
                      <IconButton
                        label="Delete project"
                        className="danger"
                        onClick={() => onDelete("projects", project.id)}
                      >
                        <Trash2 size={16} />
                      </IconButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showModal && (
        <ProjectFormModal
          editingId={editingId}
          form={form}
          users={users}
          onCancel={reset}
          onChange={updateForm}
          onSubmit={submit}
        />
      )}
    </section>
  );
}
