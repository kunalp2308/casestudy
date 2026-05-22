import { ClipboardList } from "lucide-react";
import { ToolbarButton } from "../common";

export function Sidebar({ navigation, activeTab, onTabChange }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <ClipboardList size={26} />
        <span>Task Tracker</span>
      </div>
      <nav>
        {navigation.map((item) => (
          <ToolbarButton
            key={item.id}
            active={activeTab === item.id}
            icon={item.icon}
            label={item.label}
            onClick={() => onTabChange(item.id)}
          />
        ))}
      </nav>
    </aside>
  );
}
