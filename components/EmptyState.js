import React from "react";
import { Plus } from "lucide-react";

export default function EmptyState({ icon: Icon, title, description, actionText, onAction }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 2rem",
        background: "var(--surface-color)",
        border: "2px dashed #cbd5e1",
        borderRadius: "16px",
        textAlign: "center",
        margin: "1rem 0",
        animation: "fadeIn 0.4s ease-out",
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)",
      }}
    >
      <div
        style={{
          width: "64px",
          height: "64px",
          background: "#f1f5f9",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.5rem",
          color: "#94a3b8",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
        }}
      >
        <Icon size={32} strokeWidth={1.5} />
      </div>
      <h3
        style={{
          fontSize: "1.25rem",
          fontWeight: "600",
          color: "var(--text-primary)",
          marginBottom: "0.5rem",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: "var(--text-secondary)",
          fontSize: "0.95rem",
          maxWidth: "400px",
          marginBottom: actionText ? "2rem" : "0",
        }}
      >
        {description}
      </p>

      {actionText && onAction && (
        <button 
          className="btn btn-success" 
          onClick={onAction}
          style={{
            transform: "translateY(0)",
            transition: "all 0.2s ease",
            boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.2)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <Plus size={18} /> {actionText}
        </button>
      )}
    </div>
  );
}
