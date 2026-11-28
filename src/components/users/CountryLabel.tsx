export default function CountryLabel({ code, name }: { code: string; name: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {name}
      <span className="code-badge">{code}</span>
    </span>
  );
}
