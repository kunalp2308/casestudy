import { CircleAlert } from "lucide-react";

export function AlertMessage({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div className="alert">
      <CircleAlert size={18} />
      <span>{message}</span>
    </div>
  );
}
