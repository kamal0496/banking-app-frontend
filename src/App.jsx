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
        <h5>Hello, from App component</h5>
        <LandingPage />
      </AccountsProvider>
    </>
  );
}

export default App;
