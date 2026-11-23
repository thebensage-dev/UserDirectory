import { countryName } from "@/lib/countries";

export default function CountryLabel({ code }: { code: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {countryName(code)}
      <span className="code-badge">{code}</span>
    </span>
  );
}
