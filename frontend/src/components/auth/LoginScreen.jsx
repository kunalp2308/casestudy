import { ClipboardList, LogIn } from "lucide-react";
import { getLoginUrl } from "../../api";
import { AlertMessage } from "../common";

export function LoginScreen({ error }) {
  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand">
          <ClipboardList size={34} />
          <h1>Task Tracker</h1>
        </div>
        <AlertMessage message={error} />
        <a href={getLoginUrl()} className="primary-button">
          <LogIn size={18} />
          Sign in with Google
        </a>
      </section>
    </main>
  );
}
