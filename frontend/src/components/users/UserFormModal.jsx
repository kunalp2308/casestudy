import { Check } from "lucide-react";
import { Field, Modal } from "../common";

export function UserFormModal({
  editingId,
  form,
  roles,
  onCancel,
  onChange,
  onSubmit,
  onToggleRole,
}) {
  return (
    <Modal
      title={editingId ? "Edit User" : "New User"}
      onClose={onCancel}
      onSubmit={onSubmit}
      footer={
        <>
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
          <button className="submit-button" type="submit">
            <Check size={18} />
            Save User
          </button>
        </>
      }
    >
      <Field label="Full name">
        <input
          value={form.full_name}
          onChange={(event) => onChange({ full_name: event.target.value })}
          required
          autoFocus
        />
      </Field>
      <Field label="Email">
        <input
          type="email"
          value={form.email}
          onChange={(event) => onChange({ email: event.target.value })}
          required
        />
      </Field>
      <label className="check-field">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(event) => onChange({ is_active: event.target.checked })}
        />
        <span>Active</span>
      </label>
      <div className="checkbox-group">
        <span>Roles</span>
        {roles.map((role) => (
          <label className="check-field" key={role.id}>
            <input
              type="checkbox"
              checked={form.role_ids.includes(role.id)}
              onChange={() => onToggleRole(role.id)}
            />
            <span>{role.name}</span>
          </label>
        ))}
      </div>
    </Modal>
  );
}
