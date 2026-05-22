import { useState } from "react";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { createEmptyRole } from "../../constants/entities";
import { EmptyState, IconButton } from "../common";
import { RoleFormModal } from "./RoleFormModal";

export function RolesView({ roles, onSave, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => createEmptyRole());
  const [showModal, setShowModal] = useState(false);

  function reset() {
    setEditingId(null);
    setForm(createEmptyRole());
    setShowModal(false);
  }

  function openNewRole() {
    setEditingId(null);
    setForm(createEmptyRole());
    setShowModal(true);
  }

  function edit(role) {
    setEditingId(role.id);
    setForm({
      name: role.name,
      description: role.description || "",
    });
    setShowModal(true);
  }

  function updateForm(values) {
    setForm((current) => ({ ...current, ...values }));
  }

  async function submit(event) {
    event.preventDefault();
    await onSave("roles", editingId, form);
    reset();
  }

  return (
    <section className="view">
      <section className="surface table-surface">
        <div className="section-heading">
          <h2>Roles</h2>
          <button
            className="primary-button"
            type="button"
            onClick={openNewRole}
          >
            <Plus size={17} />
            New Role
          </button>
        </div>
        {roles.length === 0 ? (
          <EmptyState label="No roles" />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td>{role.name}</td>
                    <td>{role.description || ""}</td>
                    <td className="row-actions">
                      <IconButton label="Edit role" onClick={() => edit(role)}>
                        <Edit3 size={16} />
                      </IconButton>
                      <IconButton
                        label="Delete role"
                        className="danger"
                        onClick={() => onDelete("roles", role.id)}
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
        <RoleFormModal
          editingId={editingId}
          form={form}
          onCancel={reset}
          onChange={updateForm}
          onSubmit={submit}
        />
      )}
    </section>
  );
}
