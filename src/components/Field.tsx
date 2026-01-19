export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <div className="fieldLabel">{label}</div>
      {children}
    </label>
  );
}
