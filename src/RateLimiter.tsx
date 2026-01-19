import "./App.css";
import { useMemo, useState } from "react";
import {
  rateLimiterOptions,
  useRateLimiter,
} from "@tanstack/react-pacer/rate-limiter";
import { Pill } from "./components/Pill";
import { Card } from "./components/Card";
import { Field } from "./components/Field";
import { Row } from "./components/Row";
import { Stat } from "./components/Stat";
import { ButtonBar } from "./components/ButtonBar";
import { CodeBlock } from "./components/CodeBlock";
import { useNow } from "./hooks/useNow";
import { formatMs } from "./utils/general";

export function RateLimiterDemo() {
  const now = useNow(250);
  const [enabled, setEnabled] = useState(true);
  const [limit, setLimit] = useState(5);
  const [windowMs, setWindowMs] = useState(5000);
  const [windowType, setWindowType] = useState<"fixed" | "sliding">("fixed");

  const [instantCount, setInstantCount] = useState(0);
  const [limitedCount, setLimitedCount] = useState(0);
  const [lastRejectMs, setLastRejectMs] = useState<number | null>(null);

  const common = useMemo(
    () => rateLimiterOptions({ limit, window: windowMs }),
    [limit, windowMs],
  );

  const rateLimiter = useRateLimiter(
    setLimitedCount,
    {
      ...common,
      windowType,
      enabled: () => enabled,
      onReject: (rl) => setLastRejectMs(rl.getMsUntilNextWindow()),
    },
    (state) => ({
      executionCount: state.executionCount,
      rejectionCount: state.rejectionCount,
      executionTimes: state.executionTimes,
    }),
  );

  const remaining = rateLimiter.getRemainingInWindow();
  const msUntilNextWindow = rateLimiter.getMsUntilNextWindow();
  const isLimited = remaining <= 0;

  function send(n: number) {
    setInstantCount((prev) => {
      let next = prev;
      for (let i = 0; i < n; i += 1) {
        next += 1;
        rateLimiter.maybeExecute(next);
      }
      return next;
    });
  }

  function resetAll() {
    rateLimiter.reset();
    setInstantCount(0);
    setLimitedCount(0);
    setLastRejectMs(null);
  }

  return (
    <Card
      title="Rate Limiter"
      subtitle="Enforce hard caps within a time window (API quotas, abuse prevention). Calls beyond the limit are rejected until the window resets."
    >
      <div className="content">
        <Row>
          <Field label={`Limit: ${limit} per window`}>
            <input
              className="range"
              type="range"
              min={1}
              max={20}
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value, 10))}
            />
          </Field>
          <Field label={`Window: ${windowMs}ms`}>
            <input
              className="range"
              type="range"
              min={500}
              max={20000}
              step={500}
              value={windowMs}
              onChange={(e) => setWindowMs(parseInt(e.target.value, 10))}
            />
          </Field>
        </Row>

        <Row>
          <Field label="Window type">
            <div className="radioRow">
              <label className="radio">
                <input
                  type="radio"
                  checked={windowType === "fixed"}
                  onChange={() => setWindowType("fixed")}
                />
                Fixed
              </label>
              <label className="radio">
                <input
                  type="radio"
                  checked={windowType === "sliding"}
                  onChange={() => setWindowType("sliding")}
                />
                Sliding
              </label>
            </div>
          </Field>
          <Field label="Enabled">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
          </Field>
        </Row>

        <ButtonBar>
          <button className="btn" onClick={() => send(1)}>
            Send 1
          </button>
          <button className="btn" onClick={() => send(10)}>
            Burst 10
          </button>
          <button className="btn" onClick={resetAll}>
            Reset
          </button>
        </ButtonBar>

        <div className="stats">
          <Stat
            label="Status"
            value={<Pill>{isLimited ? "limited" : "ok"}</Pill>}
          />
          <Stat label="Instant clicks" value={instantCount} />
          <Stat label="Allowed" value={limitedCount} />
          <Stat label="Executions" value={rateLimiter.state.executionCount} />
          <Stat label="Rejected" value={rateLimiter.state.rejectionCount} />
          <Stat label="Remaining" value={remaining} />
          <Stat label="Next window in" value={formatMs(msUntilNextWindow)} />
          <Stat
            label="Last reject (ms)"
            value={lastRejectMs != null ? lastRejectMs : "—"}
          />
          <Stat
            label="Tick"
            value={<span className="muted">{Math.floor(now / 1000)}s</span>}
          />
        </div>

        <details className="details">
          <summary>Full rate limiter state (Subscribe)</summary>
          <rateLimiter.Subscribe selector={(s) => s}>
            {(s) => <CodeBlock value={s} />}
          </rateLimiter.Subscribe>
        </details>
      </div>
    </Card>
  );
}
