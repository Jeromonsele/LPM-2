import Link from "next/link";

export default function Pricing() {
  return (
    <main className="mx-auto max-w-6xl p-6 space-y-8">
      <h1 className="text-3xl font-bold">Pricing</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { name: "Starter", price: "$0", features: ["5 SOPs", "PDF export"] },
          { name: "Team", price: "$29", features: ["Unlimited SOPs", "DOCX export", "Comments"] },
          { name: "Business", price: "Contact", features: ["SAML SSO", "SLAs", "Priority support"] },
        ].map((t) => (
          <div key={t.name} className="rounded-xl border p-4">
            <h3 className="font-medium">{t.name}</h3>
            <div className="text-2xl font-semibold my-2">{t.price}</div>
            <ul className="text-sm list-disc ml-5 space-y-1">
              {t.features.map((f) => (<li key={f}>{f}</li>))}
            </ul>
            <Link href="/signup" className="btn-primary mt-4 inline-block">Get started</Link>
          </div>
        ))}
      </div>
    </main>
  );
}


