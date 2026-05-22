import { Check } from "lucide-react";
import { Field, Modal } from "../common";

export function RoleFormModal({ editingId, form, onCancel, onChange, onSubmit }) {
  return (
    <Modal
      title={editingId ? "Edit Role" : "New Role"}
      onClose={onCancel}
      onSubmit={onSubmit}
      footer={
        <>
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
          <button className="submit-button" type="submit">
            <Check size={18} />
            Save Role
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
          rows={4}
        />
      </Field>
    </Modal>
  );
}
