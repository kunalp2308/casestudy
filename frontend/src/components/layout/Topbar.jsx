import { Loader2, LogOut, RotateCcw, UserCircle } from "lucide-react";

export function Topbar({ title, user, roleLabel, loading, onRefresh, onLogout }) {
  return (
    <header className="topbar">
      <div>
        <span className="eyebrow">Workspace</span>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        <div className="account-chip">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" />
          ) : (
            <UserCircle size={30} />
          )}
          <span>
            <strong>{user.full_name}</strong>
            <small>{roleLabel}</small>
          </span>
        </div>
        <button className="secondary-button" type="button" onClick={onRefresh}>
          {loading ? (
            <Loader2 className="spin" size={18} />
          ) : (
            <RotateCcw size={18} />
          )}
          Refresh
        </button>
        <button className="secondary-button" type="button" onClick={onLogout}>
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </header>
  );
}
