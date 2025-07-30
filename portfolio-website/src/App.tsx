// import { useState } from "react";
// import reactLogo from "./assets/react.svg";
// import viteLogo from "/vite.svg";
import "./App.css";
import { Header } from "./components/Header";
import { InfiniteScrollContainer } from "./components/InfiniteScrollContainer";

function App() {
  return (
    <div className="w-full min-h-screen flex flex-col bg-neutral-900 text-white">
      <Header />
      <InfiniteScrollContainer />
    </div>
  );
}

export default App;
