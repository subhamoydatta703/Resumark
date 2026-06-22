import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { UploadPage } from "./pages/UploadPage";
import { LandingPage } from "./pages/LandingPage";
import { registerGetToken } from "./services/api";

function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((p) => (p === "dark" ? "light" : "dark"));

  return (
    <>
      <SignedIn>
        <AuthenticatedApp theme={theme} toggleTheme={toggleTheme} />
      </SignedIn>
      <SignedOut>
        <LandingPage theme={theme} toggleTheme={toggleTheme} />
      </SignedOut>
    </>
  );
}

/* ─── Authenticated ──────────────────────── */
function AuthenticatedApp({ theme, toggleTheme }: { theme: "light" | "dark"; toggleTheme: () => void }) {
  const { getToken } = useAuth();
  useEffect(() => {
    registerGetToken(getToken);
  }, [getToken]);

  return <UploadPage theme={theme} toggleTheme={toggleTheme} />;
}

export default App;
