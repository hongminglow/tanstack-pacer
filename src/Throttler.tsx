import "./App.css";
import { useState } from "react";
import { Card } from "./components/Card";
import { Field } from "./components/Field";
import { Row } from "./components/Row";
import { Stat } from "./components/Stat";
import { ButtonBar } from "./components/ButtonBar";
import { CodeBlock } from "./components/CodeBlock";
import { ToggleField } from "./components/ToggleField";
import { useNow } from "./hooks/useNow";
import { formatMs } from "./utils/general";
import { useThrottler } from "@tanstack/react-pacer";

export function ThrottlerDemo() {
  const now = useNow(250);
  const [waitMs, setWaitMs] = useState(500);
  const [leading, setLeading] = useState(true);
  const [trailing, setTrailing] = useState(true);

  const [instantValue, setInstantValue] = useState(25);
  const [throttledValue, setThrottledValue] = useState(25);
  const [instantMoves, setInstantMoves] = useState(0);

  const throttler = useThrottler(
    setThrottledValue,
    { wait: waitMs, leading, trailing },
    (state) => ({
      isPending: state.isPending,
      executionCount: state.executionCount,
      lastExecutionTime: state.lastExecutionTime,
      nextExecutionTime: state.nextExecutionTime,
    }),
  );

  const coreSnippet = `// Core idea: "run at most once per ${waitMs}ms window"
const throttler = useThrottler(setThrottledValue, {
  wait: ${waitMs},
  leading: ${leading},
  trailing: ${trailing},
})

throttler.maybeExecute(nextValue)`;

  function onRange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = parseInt(e.target.value, 10);
    setInstantValue(next);
    setInstantMoves((c) => c + 1);
    throttler.maybeExecute(next);
  }

  const msUntilNext =
    throttler.state.nextExecutionTime != null
      ? throttler.state.nextExecutionTime - now
      : undefined;

  return (
    <Card
      title="Throttler"
      subtitle="Guarantee at most one execution per window. Useful for scroll/drag handlers and expensive UI updates."
    >
      <div className="content">
        <div className="help">
          <div className="helpTitle">How to try</div>
          <ul className="helpList">
            <li>
              Drag the slider quickly: the throttled value updates at most once
              per window.
            </li>
            <li>
              Turn off <b>Trailing</b> to stop the “final” update after you stop
              dragging.
            </li>
            <li>
              Turn off <b>Leading</b> to delay the first update until the window
              passes.
            </li>
          </ul>
        </div>

        <details className="details">
          <summary>Core snippet</summary>
          <CodeBlock value={coreSnippet} />
        </details>

        <Row>
          <Field
            label={`Drag (instant: ${instantValue}, throttled: ${throttledValue})`}
          >
            <input
              className="range"
              type="range"
              min={0}
              max={100}
              value={instantValue}
              onChange={onRange}
            />
          </Field>
        </Row>

        <Row>
          <Field label={`Wait: ${waitMs}ms`}>
            <input
              className="range"
              type="range"
              min={50}
              max={2000}
              step={50}
              value={waitMs}
              onChange={(e) => setWaitMs(parseInt(e.target.value, 10))}
            />
          </Field>
          <ToggleField
            label="Leading"
            checked={leading}
            onChange={setLeading}
          />
          <ToggleField
            label="Trailing"
            checked={trailing}
            onChange={setTrailing}
          />
        </Row>

        <div className="help">
          <div className="helpTitle">What the key options mean</div>
          <ul className="helpList">
            <li>
              <b>leading</b>: execute immediately when the window opens.
            </li>
            <li>
              <b>trailing</b>: execute once more at the end of the window with
              the latest value.
            </li>
          </ul>
        </div>

        <details className="details">
          <summary>Advanced controls</summary>
          <ButtonBar>
            <button className="btn" onClick={() => throttler.flush()}>
              Flush now
            </button>
            <button className="btn" onClick={() => throttler.cancel()}>
              Cancel pending
            </button>
            <button className="btn" onClick={() => throttler.reset()}>
              Reset
            </button>
          </ButtonBar>
        </details>

        <div className="stats">
          <Stat label="Pending" value={String(throttler.state.isPending)} />
          <Stat label="Instant moves" value={instantMoves} />
          <Stat label="Executions" value={throttler.state.executionCount} />
          <Stat
            label="Until next"
            value={msUntilNext != null ? formatMs(msUntilNext) : "—"}
          />
        </div>

        <details className="details">
          <summary>Advanced: full throttler state</summary>
          <throttler.Subscribe selector={(s) => s}>
            {(s) => <CodeBlock value={s} />}
          </throttler.Subscribe>
        </details>
      </div>
    </Card>
  );
}
