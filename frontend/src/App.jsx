import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  ClipboardList,
  LayoutDashboard,
  Shield,
  Users,
} from "lucide-react";
import { api, clearAccessToken, getAccessToken, setAccessToken } from "./api";
import { LoginScreen } from "./components/auth/LoginScreen";
import { FullPageLoader, LoadingState } from "./components/common";
import { Dashboard } from "./components/dashboard/Dashboard";
import { AppLayout } from "./components/layout/AppLayout";
import { ProjectsView } from "./components/projects/ProjectsView";
import { RolesView } from "./components/roles/RolesView";
import { TasksView } from "./components/tasks/TasksView";
import { UsersView } from "./components/users/UsersView";
import { hasAnyRole, hasRole } from "./utils/permissions";
import { showToast } from "./utils/toast";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [authUser, setAuthUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin = hasRole(authUser, "admin");
  const canManageWorkItems = hasAnyRole(authUser, ["admin", "task creator"]);

  const navigation = useMemo(() => {
    const items = [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "tasks", label: "Tasks", icon: ClipboardList },
    ];

    if (canManageWorkItems) {
      items.splice(1, 0, {
        id: "projects",
        label: "Projects",
        icon: BriefcaseBusiness,
      });
    }

    if (isAdmin) {
      items.push({ id: "users", label: "Users", icon: Users });
      items.push({ id: "roles", label: "Roles", icon: Shield });
    }

    return items;
  }, [canManageWorkItems, isAdmin]);

  useEffect(() => {
    if (!navigation.some((item) => item.id === activeTab)) {
      setActiveTab("dashboard");
    }
  }, [activeTab, navigation]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [nextUsers, nextRoles, nextProjects, nextTasks] = await Promise.all(
        [
          api.users.list(),
          api.roles.list(),
          api.projects.list(),
          api.tasks.list(),
        ],
      );

      setUsers(nextUsers);
      setRoles(nextRoles);
      setProjects(nextProjects);
      setTasks(nextTasks);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadSession({ showLoginToast = false } = {}) {
    setAuthLoading(true);
    setError("");

    try {
      const currentUser = await api.auth.me();
      setAuthUser(currentUser);
      if (showLoginToast) {
        showToast.success("Logged in successfully");
      }
      await loadData();
    } catch (err) {
      clearAccessToken();
      setAuthUser(null);
      setError(err.message);
      showToast.error("Authentication failed: " + err.message);
      setLoading(false);
    } finally {
      setAuthLoading(false);
    }
  }

  useEffect(() => {
    const hash = window.location.hash;

    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get("access_token");
      const authError = params.get("auth_error");

      if (authError) {
        setError(decodeURIComponent(authError));
        setAuthLoading(false);
      } else if (token) {
        setAccessToken(token);
        // Clear hash from URL without reloading
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
        loadSession({ showLoginToast: true });
        return;
      }
    }

    if (getAccessToken()) {
      loadSession();
    } else {
      setAuthLoading(false);
    }
  }, []);

  async function saveEntity(entity, id, payload) {
    setError("");

    try {
      if (id) {
        await api[entity].update(id, payload);
        showToast.success(`${entity} updated successfully`);
      } else {
        await api[entity].create(payload);
        showToast.success(`${entity} created successfully`);
      }

      await loadData();
    } catch (err) {
      setError(err.message);
      showToast.error(err.message);
      throw err;
    }
  }

  async function deleteEntity(entity, id) {
    setError("");

    try {
      await api[entity].remove(id);
      showToast.success(`${entity} deleted successfully`);
      await loadData();
    } catch (err) {
      setError(err.message);
      showToast.error(err.message);
    }
  }

  async function completeTask(id) {
    setError("");

    try {
      await api.tasks.complete(id);
      showToast.success("Task marked as complete");
      await loadData();
    } catch (err) {
      setError(err.message);
      showToast.error(err.message);
    }
  }

  function handleTabChange(tabId) {
    if (tabId === "tasks") {
      setSelectedProjectId("all");
    }
    setActiveTab(tabId);
  }

  function openProjectTasks(projectId) {
    setSelectedProjectId(String(projectId));
    setActiveTab("tasks");
  }

  function logout() {
    clearAccessToken();
    setAuthUser(null);
    setUsers([]);
    setRoles([]);
    setProjects([]);
    setTasks([]);
    setSelectedProjectId("all");
    setActiveTab("dashboard");
    setError("");
    showToast.info("Logged out successfully");
  }

  function renderActiveView() {
    if (loading) {
      return <LoadingState />;
    }

    if (activeTab === "dashboard") {
      return (
        <Dashboard
          projects={projects}
          tasks={tasks}
          users={users}
          roles={roles}
          onTabChange={handleTabChange}
        />
      );
    }

    if (activeTab === "projects" && canManageWorkItems) {
      return (
        <ProjectsView
          projects={projects}
          users={users}
          onSave={saveEntity}
          onDelete={deleteEntity}
          onOpenProjectTasks={openProjectTasks}
        />
      );
    }

    if (activeTab === "tasks") {
      return (
        <TasksView
          tasks={tasks}
          projects={projects}
          users={users}
          currentUser={authUser}
          canManageTasks={canManageWorkItems}
          projectFilter={selectedProjectId}
          onSave={saveEntity}
          onDelete={deleteEntity}
          onComplete={completeTask}
          onProjectFilterChange={setSelectedProjectId}
        />
      );
    }

    if (activeTab === "users" && isAdmin) {
      return (
        <UsersView
          users={users}
          roles={roles}
          onSave={saveEntity}
          onDelete={deleteEntity}
        />
      );
    }

    if (activeTab === "roles" && isAdmin) {
      return (
        <RolesView roles={roles} onSave={saveEntity} onDelete={deleteEntity} />
      );
    }

    return null;
  }

  if (authLoading) {
    return <FullPageLoader />;
  }

  if (!authUser) {
    return <LoginScreen error={error} />;
  }

  const activeTitle =
    navigation.find((item) => item.id === activeTab)?.label ?? "Dashboard";
  const roleLabel =
    authUser.roles.map((role) => role.name).join(", ") || "No role";

  return (
    <AppLayout
      activeTab={activeTab}
      error={error}
      loading={loading}
      navigation={navigation}
      roleLabel={roleLabel}
      title={activeTitle}
      user={authUser}
      onLogout={logout}
      onRefresh={loadSession}
      onTabChange={handleTabChange}
    >
      {renderActiveView()}
    </AppLayout>
  );
}
