import "./App.css";
import { useMemo, useState } from "react";
import { Card } from "./components/Card";
import { Field } from "./components/Field";
import { Row } from "./components/Row";
import { Stat } from "./components/Stat";
import { ButtonBar } from "./components/ButtonBar";
import { CodeBlock } from "./components/CodeBlock";
import { ToggleField } from "./components/ToggleField";
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
    isPending: state.isPending,
    executionCount: state.executionCount,
    lastArgs: state.lastArgs,
    canLeadingExecute: state.canLeadingExecute,
  }));

  const coreSnippet = `// Core idea: "only run after the user stops typing"
const debouncer = useDebouncer(setDebouncedSearch, {
  wait: ${waitMs},
  leading: ${leading},
  enabled: () => enabled && instantSearch.trim().length > 2,
})

debouncer.maybeExecute(nextValue)`;

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
        <div className="help">
          <div className="helpTitle">How to try</div>
          <ul className="helpList">
            <li>
              Type quickly, then stop: the debounced value updates after{" "}
              {waitMs}ms.
            </li>
            <li>
              Turn on <b>Leading</b> to fire immediately on the first keystroke
              of a burst.
            </li>
            <li>
              Turn off <b>Enabled</b> (or type &lt; 3 chars): nothing executes.
            </li>
          </ul>
        </div>

        <details className="details">
          <summary>Core snippet</summary>
          <CodeBlock value={coreSnippet} />
        </details>

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
          <ToggleField
            label="Enabled (also requires 3+ chars)"
            checked={enabled}
            onChange={setEnabled}
          />
          <ToggleField
            label="Leading"
            checked={leading}
            onChange={setLeading}
          />
        </Row>

        <ButtonBar>
          <button className="btn" onClick={() => debouncer.flush()}>
            Flush now
          </button>
          <button className="btn" onClick={() => debouncer.reset()}>
            Reset
          </button>
        </ButtonBar>

        <div className="help">
          <div className="helpTitle">What the key options mean</div>
          <ul className="helpList">
            <li>
              <b>wait</b>: how long the input must be quiet before the callback
              runs.
            </li>
            <li>
              <b>leading</b>: also run immediately on the first call in a burst.
            </li>
            <li>
              <b>enabled</b>: a gate—when it returns false, calls are ignored.
            </li>
          </ul>
        </div>

        <div className="stats">
          <Stat label="Pending" value={String(debouncer.state.isPending)} />
          <Stat label="Executions" value={debouncer.state.executionCount} />
          <Stat
            label="Leading ready"
            value={String(debouncer.state.canLeadingExecute)}
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
          <summary>Advanced: full debouncer state</summary>
          <debouncer.Subscribe selector={(s) => s}>
            {(s) => <CodeBlock value={s} />}
          </debouncer.Subscribe>
        </details>
      </div>
    </Card>
  );
}
