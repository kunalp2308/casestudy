import { X } from "lucide-react";

export function Modal({ title, onClose, onSubmit, children, footer }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <form
        className="modal-content"
        onClick={(event) => event.stopPropagation()}
        onSubmit={onSubmit}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </form>
    </div>
  );
}
