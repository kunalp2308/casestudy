import { Check } from "lucide-react";
import { TASK_STATUSES } from "../../constants/entities";
import { Field, Modal } from "../common";

export function TaskFormModal({
  editingId,
  form,
  projects,
  users,
  onCancel,
  onChange,
  onSubmit,
}) {
  return (
    <Modal
      title={editingId ? "Edit Task" : "New Task"}
      onClose={onCancel}
      onSubmit={onSubmit}
      footer={
        <>
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="submit-button"
            type="submit"
            disabled={projects.length === 0}
          >
            <Check size={18} />
            Save Task
          </button>
        </>
      }
    >
      <Field label="Description">
        <textarea
          value={form.description}
          onChange={(event) => onChange({ description: event.target.value })}
          rows={4}
          required
          autoFocus
        />
      </Field>
      <Field label="Project">
        <select
          value={form.project_id}
          onChange={(event) => onChange({ project_id: event.target.value })}
          required
        >
          <option value="">Select project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="two-column">
        <Field label="Due date">
          <input
            type="date"
            value={form.due_date}
            onChange={(event) => onChange({ due_date: event.target.value })}
            required
          />
        </Field>
        <Field label="Status">
          <select
            value={form.status}
            onChange={(event) => onChange({ status: event.target.value })}
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Owner">
        <select
          value={form.owner_id}
          onChange={(event) => onChange({ owner_id: event.target.value })}
        >
          <option value="">Unassigned</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.full_name}
            </option>
          ))}
        </select>
      </Field>
    </Modal>
  );
}
