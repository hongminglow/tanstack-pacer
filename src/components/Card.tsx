export function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card">
      <header className="cardHeader">
        <h2 className="cardTitle">{title}</h2>
        <p className="cardSubtitle">{subtitle}</p>
      </header>
      {children}
    </section>
  );
}
