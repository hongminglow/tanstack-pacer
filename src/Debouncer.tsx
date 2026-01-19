import "./App.css";
import { useMemo, useState } from "react";
import { Pill } from "./components/Pill";
import { Card } from "./components/Card";
import { Field } from "./components/Field";
import { Row } from "./components/Row";
import { Stat } from "./components/Stat";
import { ButtonBar } from "./components/ButtonBar";
import { CodeBlock } from "./components/CodeBlock";
import { useDebouncer } from "@tanstack/react-pacer";

export function DebouncerDemo() {
  const [enabled, setEnabled] = useState(true);
  const [leading, setLeading] = useState(false);
  const [waitMs, setWaitMs] = useState(500);

  const [instantSearch, setInstantSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const options = useMemo(
    () => ({
      wait: waitMs,
      leading,
      enabled: () => enabled && instantSearch.trim().length > 2,
    }),
    [enabled, instantSearch, leading, waitMs],
  );

  // Uses the 3rd argument selector to opt-in to state updates (advanced config).
  const debouncer = useDebouncer(setDebouncedSearch, options, (state) => ({
    status: state.status,
    isPending: state.isPending,
    executionCount: state.executionCount,
    lastArgs: state.lastArgs,
    canLeadingExecute: state.canLeadingExecute,
  }));

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value;
    setInstantSearch(next);
    debouncer.maybeExecute(next);
  }

  return (
    <Card
      title="Debouncer"
      subtitle="Collapse rapid changes into one call after a quiet period. Great for search boxes, resizing, or autosave."
    >
      <div className="content">
        <Row>
          <Field label="Type (executes once you pause)">
            <input
              className="input"
              type="search"
              value={instantSearch}
              onChange={onChange}
              placeholder="Try typing fast… (debounces after you stop)"
            />
          </Field>
        </Row>

        <Row>
          <Field label={`Wait: ${waitMs}ms`}>
            <input
              className="range"
              type="range"
              min={50}
              max={1500}
              step={50}
              value={waitMs}
              onChange={(e) => setWaitMs(parseInt(e.target.value, 10))}
            />
          </Field>
          <Field label="Enabled (also requires 3+ chars)">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
          </Field>
          <Field label="Leading edge">
            <input
              type="checkbox"
              checked={leading}
              onChange={(e) => setLeading(e.target.checked)}
            />
          </Field>
        </Row>

        <ButtonBar>
          <button className="btn" onClick={() => debouncer.flush()}>
            Flush
          </button>
          <button className="btn" onClick={() => debouncer.cancel()}>
            Cancel
          </button>
          <button className="btn" onClick={() => debouncer.reset()}>
            Reset
          </button>
        </ButtonBar>

        <div className="stats">
          <Stat label="Status" value={<Pill>{debouncer.state.status}</Pill>} />
          <Stat label="Pending" value={String(debouncer.state.isPending)} />
          <Stat label="Executions" value={debouncer.state.executionCount} />
          <Stat
            label="Last Args"
            value={
              debouncer.state.lastArgs
                ? JSON.stringify(debouncer.state.lastArgs)
                : "—"
            }
          />
        </div>

        <Row>
          <div className="split">
            <div>
              <div className="k">Instant</div>
              <div className="v">
                {instantSearch || <span className="muted">(empty)</span>}
              </div>
            </div>
            <div>
              <div className="k">Debounced</div>
              <div className="v">
                {debouncedSearch || <span className="muted">(empty)</span>}
              </div>
            </div>
          </div>
        </Row>

        <details className="details">
          <summary>Full debouncer state (Subscribe)</summary>
          <debouncer.Subscribe selector={(s) => s}>
            {(s) => <CodeBlock value={s} />}
          </debouncer.Subscribe>
        </details>
      </div>
    </Card>
  );
}
