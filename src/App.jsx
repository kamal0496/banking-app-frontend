import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import { AccountsProvider } from "./context/AccountsContext";
import LandingPage from "./components/LandingPage";

function App() {
  return (
    <>
      <AccountsProvider>
        <LandingPage />
      </AccountsProvider>
    </>
  );
}

export default App;
