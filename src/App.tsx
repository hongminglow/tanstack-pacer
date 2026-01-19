import "./App.css";
import { Pill } from "./components/Pill";
import { DebouncerDemo } from "./Debouncer";
import { ThrottlerDemo } from "./Throttler";
import { RateLimiterDemo } from "./RateLimiter";
import { QueueDemo } from "./Queue";
import { BatchingDemo } from "./Batching";

function App() {
  return (
    <div className="page">
      <header className="hero">
        <div className="heroTop">
          <h1 className="heroTitle">TanStack Pacer Showcase</h1>
          <p className="heroSubtitle">
            Five practical patterns (debounce, throttle, rate limit, queue,
            batching) with interactive controls and live state.
          </p>
        </div>
        <div className="heroBadges">
          <Pill>React + TypeScript</Pill>
          <Pill>@tanstack/react-pacer</Pill>
          <Pill>Selectors + Subscribe</Pill>
        </div>
      </header>

      <main className="grid">
        <DebouncerDemo />
        <ThrottlerDemo />
        <RateLimiterDemo />
        <QueueDemo />
        <BatchingDemo />
      </main>

      <footer className="footer">
        <span className="muted">
          Tip: open DevTools console if you add your own callbacks/logs.
        </span>
      </footer>
    </div>
  );
}

export default App;
