import { useState } from "react";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { createEmptyUser } from "../../constants/entities";
import { EmptyState, IconButton } from "../common";
import { UserFormModal } from "./UserFormModal";

export function UsersView({ users, roles, onSave, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(() => createEmptyUser());
  const [showModal, setShowModal] = useState(false);

  function reset() {
    setEditingId(null);
    setForm(createEmptyUser());
    setShowModal(false);
  }

  function openNewUser() {
    setEditingId(null);
    setForm(createEmptyUser());
    setShowModal(true);
  }

  function edit(user) {
    setEditingId(user.id);
    setForm({
      full_name: user.full_name,
      email: user.email,
      is_active: user.is_active,
      role_ids: user.roles.map((role) => role.id),
    });
    setShowModal(true);
  }

  function updateForm(values) {
    setForm((current) => ({ ...current, ...values }));
  }

  function toggleRole(roleId) {
    setForm((current) => ({
      ...current,
      role_ids: current.role_ids.includes(roleId)
        ? current.role_ids.filter((id) => id !== roleId)
        : [...current.role_ids, roleId],
    }));
  }

  async function submit(event) {
    event.preventDefault();
    await onSave("users", editingId, form);
    reset();
  }

  return (
    <section className="view">
      <section className="surface table-surface">
        <div className="section-heading">
          <h2>Users</h2>
          <button
            className="primary-button"
            type="button"
            onClick={openNewUser}
          >
            <Plus size={17} />
            New User
          </button>
        </div>
        {users.length === 0 ? (
          <EmptyState label="No users" />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Roles</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.full_name}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.roles.map((role) => role.name).join(", ") || "None"}
                    </td>
                    <td>{user.is_active ? "Active" : "Inactive"}</td>
                    <td className="row-actions">
                      <IconButton label="Edit user" onClick={() => edit(user)}>
                        <Edit3 size={16} />
                      </IconButton>
                      <IconButton
                        label="Delete user"
                        className="danger"
                        onClick={() => onDelete("users", user.id)}
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
        <UserFormModal
          editingId={editingId}
          form={form}
          roles={roles}
          onCancel={reset}
          onChange={updateForm}
          onSubmit={submit}
          onToggleRole={toggleRole}
        />
      )}
    </section>
  );
}
