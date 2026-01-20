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
import { ToggleField } from "./components/ToggleField";
import { formatMs } from "./utils/general";

export function RateLimiterDemo() {
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
    }),
  );

  const coreSnippet = `// Core idea: "allow only ${limit} calls per ${windowMs}ms"
const rateLimiter = useRateLimiter(fn, {
  ...rateLimiterOptions({ limit: ${limit}, window: ${windowMs} }),
  windowType: "${windowType}",
})

rateLimiter.maybeExecute(payload)`;

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
        <div className="help">
          <div className="helpTitle">How to try</div>
          <ul className="helpList">
            <li>
              Click <b>Burst 10</b> to exceed the limit and trigger rejects.
            </li>
            <li>
              Watch <b>Remaining</b> drop to 0, then wait for the window to
              reset.
            </li>
            <li>
              Switch <b>Fixed</b> vs <b>Sliding</b> to see how “refill” timing
              changes.
            </li>
          </ul>
        </div>

        <details className="details">
          <summary>Core snippet</summary>
          <CodeBlock value={coreSnippet} />
        </details>

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
          <ToggleField
            label="Enabled"
            checked={enabled}
            onChange={setEnabled}
          />
        </Row>

        <div className="help">
          <div className="helpTitle">What the key options mean</div>
          <ul className="helpList">
            <li>
              <b>limit</b> + <b>window</b>: the quota and the time range it
              applies to.
            </li>
            <li>
              <b>windowType=fixed</b>: resets in chunks; you can burst again
              after the reset.
            </li>
            <li>
              <b>windowType=sliding</b>: a moving window; capacity “returns”
              gradually over time.
            </li>
          </ul>
        </div>

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
          <Stat label="Rejected" value={rateLimiter.state.rejectionCount} />
          <Stat label="Remaining" value={remaining} />
          <Stat label="Next window in" value={formatMs(msUntilNextWindow)} />
          <Stat
            label="Last reject (ms)"
            value={lastRejectMs != null ? lastRejectMs : "—"}
          />
        </div>

        <details className="details">
          <summary>Advanced: full rate limiter state</summary>
          <rateLimiter.Subscribe selector={(s) => s}>
            {(s) => <CodeBlock value={s} />}
          </rateLimiter.Subscribe>
        </details>
      </div>
    </Card>
  );
}
