import { useCallback, useEffect, useState } from "react";
import PreviewFrame from "./components/PreviewFrame.jsx";

const EXAMPLES = [
  "A dark pricing section with 3 tiers, middle one highlighted",
  "A login card with email field and Google + GitHub buttons",
  "A dashboard row of 4 stat cards with trend indicators",
  "A testimonial wall with initials avatars, no external images",
];

// Bundled demo so the preview/code tabs can be tried without an API key.
const SAMPLE = {
  componentName: "PricingSection",
  explanation: "Sample output — dark 3-tier pricing with the middle tier highlighted in lime.",
  code: `function PricingSection() {
  const tiers = [
    { name: "Starter", price: "₹499", period: "/project",
      features: ["1 AI product film", "2 revisions", "48-hr delivery"], highlighted: false },
    { name: "Growth", price: "₹1,499", period: "/month",
      features: ["4 AI product films", "Unlimited revisions", "Priority support"], highlighted: true },
    { name: "Scale", price: "₹4,999", period: "/month",
      features: ["12 AI product films", "Dedicated manager", "Ad creatives bundle"], highlighted: false },
  ];
  return (
    <div className="bg-[#0a0a0a] text-white rounded-2xl px-8 py-12">
      <h2 className="text-3xl font-extrabold text-center tracking-tight">Simple pricing</h2>
      <p className="text-zinc-400 text-center mt-2 mb-10 text-sm">No shoot. No studio. Just scroll-stopping creative.</p>
      <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {tiers.map((t) => (
          <div key={t.name} className={"rounded-2xl p-6 border " + (t.highlighted
            ? "bg-[#d8f800] text-black border-[#d8f800] md:scale-105"
            : "bg-[#141414] border-zinc-800")}>
            <p className={"text-xs font-bold uppercase tracking-widest " + (t.highlighted ? "text-black/60" : "text-zinc-500")}>{t.name}</p>
            <p className="mt-3 text-4xl font-black">{t.price}
              <span className={"text-sm font-medium " + (t.highlighted ? "text-black/60" : "text-zinc-500")}>{t.period}</span>
            </p>
            <ul className="mt-6 space-y-2.5 text-sm">
              {t.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className={t.highlighted ? "text-black" : "text-[#d8f800]"}>✓</span>
                  <span className={t.highlighted ? "text-black/80" : "text-zinc-300"}>{f}</span>
                </li>
              ))}
            </ul>
            <button className={"mt-8 w-full rounded-xl py-3 text-sm font-bold " + (t.highlighted ? "bg-black text-[#d8f800]" : "bg-[#d8f800] text-black")}>
              Choose {t.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}`,
};

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [current, setCurrent] = useState(null); // { componentName, code, explanation }
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null); // { message, fixable }
  const [tab, setTab] = useState("preview");
  const [api, setApi] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setApi)
      .catch(() => setApi({ ok: false }));
  }, []);

  const handleGenerate = async (e) => {
    e?.preventDefault();
    const text = prompt.trim();
    if (!text || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, previousCode: current?.code || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setCurrent(data.component);
      setHistory((h) => [...h, { prompt: text, name: data.component.componentName }]);
      setTab("preview");
      setPrompt("");
    } catch (err) {
      setError({ message: err.message, fixable: false });
    } finally {
      setBusy(false);
    }
  };

  const handleAutoFix = async () => {
    if (!current || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: current.code, error: error.message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fix failed");
      setCurrent(data.component);
      setError(null);
      setTab("preview");
    } catch (err) {
      setError({ message: err.message, fixable: false });
    } finally {
      setBusy(false);
    }
  };

  const onPreviewError = useCallback((message) => {
    setError({ message, fixable: true });
  }, []);

  const loadSample = () => {
    setCurrent(SAMPLE);
    setHistory((h) => [...h, { prompt: "Sample: dark pricing section, 3 tiers", name: SAMPLE.componentName }]);
    setError(null);
    setTab("preview");
  };

  const copyCode = async () => {
    if (!current) return;
    await navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadCode = () => {
    if (!current) return;
    const blob = new Blob([current.code], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${current.componentName}.jsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#d8f800] flex items-center justify-center text-black font-black text-lg">F</div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">ComponentForge</h1>
            <p className="text-xs text-zinc-500">prompt → React component · Nebius x NVIDIA hackathon</p>
          </div>
        </div>
        <div
          className={`text-xs px-3 py-1.5 rounded-full border ${
            api?.keyConfigured
              ? "border-lime-400/40 text-lime-300 bg-lime-400/10"
              : "border-amber-400/40 text-amber-300 bg-amber-400/10"
          }`}
        >
          {api == null ? "checking…" : api.keyConfigured ? `● ${api.model || "Nemotron"} ready` : "● API key missing — see README"}
        </div>
      </header>

      <main className="grid lg:grid-cols-[380px_1fr] gap-6 p-6 max-w-[1400px] mx-auto">
        {/* Left: prompt + history */}
        <section className="space-y-5">
          <form onSubmit={handleGenerate} className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 space-y-4">
            <label className="text-sm font-semibold text-zinc-300">
              {current ? "Iterate on the current component" : "Describe your component"}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              placeholder={current ? "e.g. make the middle tier highlighted in lime…" : "e.g. a dark pricing section with 3 tiers…"}
              className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 placeholder:text-zinc-600 resize-y"
            />
            <button
              type="submit"
              disabled={busy || !prompt.trim()}
              className="w-full bg-[#d8f800] text-black font-bold text-sm rounded-xl py-3 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition"
            >
              {busy ? "Forging…" : current ? "Iterate with AI" : "Generate component"}
            </button>
            <button
              type="button"
              onClick={loadSample}
              className="w-full text-xs text-zinc-500 hover:text-[#d8f800] transition"
            >
              No API key? Load a sample →
            </button>
          </form>

          <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-5">
            <p className="text-sm font-semibold text-zinc-300 mb-3">Try an example</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setPrompt(ex)}
                  className="text-xs text-left text-zinc-400 border border-zinc-800 rounded-full px-3 py-1.5 hover:border-[#d8f800] hover:text-zinc-200 transition"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <div className="bg-[#141414] border border-zinc-800 rounded-2xl p-5">
              <p className="text-sm font-semibold text-zinc-300 mb-3">Session history</p>
              <ol className="space-y-2 text-xs">
                {history.map((h, i) => (
                  <li key={i} className="text-zinc-500">
                    <span className="text-zinc-600 font-mono mr-2">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-zinc-300">{h.name}</span> — {h.prompt.slice(0, 60)}
                    {h.prompt.length > 60 ? "…" : ""}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>

        {/* Right: preview / code */}
        <section className="bg-[#141414] border border-zinc-800 rounded-2xl p-5 space-y-4 min-h-[640px]">
          {!current ? (
            <div className="h-full min-h-[560px] flex flex-col items-center justify-center text-center gap-3 text-zinc-600">
              <div className="text-5xl">◈</div>
              <p className="text-sm max-w-xs">Describe a UI on the left and hit Generate. The agent writes the React code and renders it live here.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-2">
                  {["preview", "code"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`text-xs font-semibold px-4 py-2 rounded-full capitalize transition ${
                        tab === t ? "bg-[#d8f800] text-black" : "border border-zinc-700 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={copyCode} className="text-xs font-semibold border border-zinc-700 rounded-full px-4 py-2 text-zinc-300 hover:border-[#d8f800] transition">
                    {copied ? "Copied ✓" : "Copy code"}
                  </button>
                  <button onClick={downloadCode} className="text-xs font-semibold border border-zinc-700 rounded-full px-4 py-2 text-zinc-300 hover:border-[#d8f800] transition">
                    Download .jsx
                  </button>
                </div>
              </div>

              {current.explanation && (
                <p className="text-xs text-zinc-500">
                  <span className="font-mono text-[#d8f800]">{current.componentName}</span> — {current.explanation}
                </p>
              )}

              {error && (
                <div className="border border-red-500/40 bg-red-500/10 rounded-xl p-4 flex items-start justify-between gap-4">
                  <p className="text-xs text-red-300 font-mono break-words">{error.message}</p>
                  {error.fixable && (
                    <button
                      onClick={handleAutoFix}
                      disabled={busy}
                      className="shrink-0 text-xs font-bold bg-red-400 text-black rounded-full px-4 py-2 disabled:opacity-40 hover:brightness-110 transition"
                    >
                      {busy ? "Fixing…" : "Auto-fix with AI"}
                    </button>
                  )}
                </div>
              )}

              {tab === "preview" ? (
                <PreviewFrame code={current.code} componentName={current.componentName} onError={onPreviewError} />
              ) : (
                <pre className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-300 overflow-auto max-h-[560px] whitespace-pre-wrap">
                  {current.code}
                </pre>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="text-center text-xs text-zinc-600 pb-8">
        Built for the Nebius x NVIDIA Global AI Hackathon · Coding & Agentic Engineering track
      </footer>
    </div>
  );
}
