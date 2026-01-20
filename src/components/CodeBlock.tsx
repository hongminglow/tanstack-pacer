export function CodeBlock({ value }: { value: unknown }) {
  const text =
    typeof value === "string"
      ? value.trimEnd()
      : JSON.stringify(value, null, 2);

  return (
    <pre className="code">
      <code>{text}</code>
    </pre>
  );
}
