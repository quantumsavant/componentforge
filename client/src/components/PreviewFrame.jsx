import { useEffect, useMemo, useRef } from "react";

/**
 * Renders AI-generated React code live in a sandboxed iframe.
 * The generated code is a single component (no imports/exports by contract).
 * Babel compiles the JSX in-frame; React 18 UMD + Tailwind CDN do the rest.
 * Runtime errors are posted back to the parent for the auto-fix loop.
 */
export default function PreviewFrame({ code, componentName, onError }) {
  const safeName = (componentName || "ForgeComponent").replace(/[^A-Za-z0-9_]/g, "") || "ForgeComponent";

  const srcDoc = useMemo(() => {
    const safeCode = code.replace(/<\/script>/gi, "<\\/script>");
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"><\/script>
<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"><\/script>
<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"><\/script>
<script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"><\/script>
<style>body{margin:0;padding:28px;background:#f4f4f5;font-family:ui-sans-serif,system-ui,sans-serif;}</style>
</head>
<body>
<div id="root"></div>
<script>
window.__forgeReport = function (message) {
  parent.postMessage({ type: "forge-error", message: String(message) }, "*");
};
window.onerror = function (msg, src, line) {
  window.__forgeReport(msg + " (line " + line + ")");
};
<\/script>
<script type="text/babel" data-presets="react">
${safeCode}
try {
  var __el = React.createElement(${safeName});
  ReactDOM.createRoot(document.getElementById("root")).render(__el);
} catch (err) {
  window.__forgeReport(err && err.message ? err.message : String(err));
}
<\/script>
</body>
</html>`;
  }, [code, safeName]);

  const handlerRef = useRef(onError);
  handlerRef.current = onError;

  useEffect(() => {
    const listener = (e) => {
      if (e.data && e.data.type === "forge-error") handlerRef.current?.(e.data.message);
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  // Remount the iframe on every new generation so stale errors don't linger.
  return (
    <iframe
      key={srcDoc.length + safeName}
      title="component-preview"
      sandbox="allow-scripts"
      srcDoc={srcDoc}
      className="w-full h-full min-h-[560px] rounded-xl bg-[#f4f4f5]"
    />
  );
}
