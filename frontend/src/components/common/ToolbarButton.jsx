export function ToolbarButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      className={active ? "nav-button active" : "nav-button"}
      type="button"
      onClick={onClick}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );
}
