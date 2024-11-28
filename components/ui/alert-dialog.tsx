import React from "react";

interface TournamentDialogProps {
  visible: boolean;
  onHide: () => void;
  header?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  icon?: React.ReactNode; // Permitir un icono personalizado
  color?: "info" | "success" | "warning" | "error"; // Colores temáticos
}

const AlertDialog: React.FC<TournamentDialogProps> = ({
  visible,
  onHide,
  header = "Dialog",
  children,
  footer,
  icon,
  color = "info",
}) => {
  if (!visible) return null;

  // Colores temáticos para el diálogo
  const colors = {
    info: {
      background: "#e0f3ff",
      border: "#90caf9",
      icon: "#1e88e5",
    },
    success: {
      background: "#e6f4ea",
      border: "#81c784",
      icon: "#43a047",
    },
    warning: {
      background: "#fff4e6",
      border: "#ffb74d",
      icon: "#f57c00",
    },
    error: {
      background: "#ffebee",
      border: "#e57373",
      icon: "#d32f2f",
    },
  };

  const theme = colors[color];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: theme.background,
          border: `3px solid ${theme.border}`,
          padding: "20px",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "40%",
          textAlign: "center",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)",
          position: "relative",
        }}
      >
        {icon && (
          <div
            style={{
              fontSize: "3rem",
              color: theme.icon,
              marginBottom: "10px",
            }}
          >
            {icon}
          </div>
        )}
        {header && (
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "10px",
              color: theme.icon,
            }}
          >
            {header}
          </div>
        )}
        <div style={{ marginBottom: "20px", fontSize: "1rem", color: theme.icon }}>
          {children}
        </div>
        {footer && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            {footer}
          </div>
        )}
        <button
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "transparent",
            border: "none",
            fontSize: "1.5rem",
            color: theme.icon,
            cursor: "pointer",
          }}
          onClick={onHide}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default AlertDialog;
