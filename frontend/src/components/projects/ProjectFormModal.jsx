import { Check } from "lucide-react";
import { Field, Modal } from "../common";

export function ProjectFormModal({
  editingId,
  form,
  users,
  onCancel,
  onChange,
  onSubmit,
}) {
  return (
    <Modal
      title={editingId ? "Edit Project" : "New Project"}
      onClose={onCancel}
      onSubmit={onSubmit}
      footer={
        <>
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
          <button className="submit-button" type="submit">
            <Check size={18} />
            Save Project
          </button>
        </>
      }
    >
      <Field label="Name">
        <input
          value={form.name}
          onChange={(event) => onChange({ name: event.target.value })}
          required
          autoFocus
        />
      </Field>
      <Field label="Description">
        <textarea
          value={form.description}
          onChange={(event) => onChange({ description: event.target.value })}
          rows={3}
          required
        />
      </Field>
      <div className="two-column">
        <Field label="Start date">
          <input
            type="date"
            value={form.start_date}
            onChange={(event) => onChange({ start_date: event.target.value })}
            max={form.end_date || undefined}
            required
          />
        </Field>
        <Field label="End date">
          <input
            type="date"
            value={form.end_date}
            onChange={(event) => onChange({ end_date: event.target.value })}
            min={form.start_date || undefined}
            required
          />
        </Field>
      </div>
      <Field label="Owner">
        <select
          value={form.owner_id}
          onChange={(event) => onChange({ owner_id: event.target.value })}
          required
        >
          <option value="">Select owner</option>
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
