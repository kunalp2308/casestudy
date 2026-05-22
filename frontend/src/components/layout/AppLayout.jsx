import { AlertMessage } from "../common";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout({
  activeTab,
  children,
  error,
  loading,
  navigation,
  roleLabel,
  title,
  user,
  onLogout,
  onRefresh,
  onTabChange,
}) {
  return (
    <div className="app-shell">
      <Sidebar
        activeTab={activeTab}
        navigation={navigation}
        onTabChange={onTabChange}
      />

      <main className="main-panel">
        <Topbar
          loading={loading}
          roleLabel={roleLabel}
          title={title}
          user={user}
          onLogout={onLogout}
          onRefresh={onRefresh}
        />
        <AlertMessage message={error} />
        {children}
      </main>
    </div>
  );
}
