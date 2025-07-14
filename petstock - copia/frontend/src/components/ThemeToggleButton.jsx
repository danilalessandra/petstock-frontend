import React, { useState, useEffect } from "react";

function ThemeToggleButton() {
  // Estado para controlar si el tema oscuro está activo
  const [isDark, setIsDark] = useState(() => {
    // Intenta leer la preferencia guardada en localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    // Si no hay preferencia guardada, usa la preferencia del sistema
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Efecto para aplicar o remover la clase 'dark' en el body
  useEffect(() => {
    if (isDark) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Función para alternar el tema
  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Cambiar tema claro/oscuro"
      style={{
        padding: "0.6rem 1.2rem",
        fontSize: "1rem",
        borderRadius: "0.6rem",
        border: "none",
        cursor: "pointer",
        background: isDark ? "#6c63ff" : "#ffb366",
        color: "#fff",
        transition: "background 0.3s ease",
      }}
    >
      {isDark ? "Modo Claro" : "Modo Oscuro"}
    </button>
  );
}

export default ThemeToggleButton;
