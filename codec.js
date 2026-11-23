// Guarda los datos de una demo dentro del propio enlace (#z=...), comprimidos.
// Así no hace falta subir nada a GitHub para cada demo.
(function () {
  const b64url = (bytes) => {
    let s = "";
    bytes.forEach((b) => (s += String.fromCharCode(b)));
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };
  const fromB64url = (str) => {
    const s = atob(str.replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(s, (c) => c.charCodeAt(0));
  };
  async function pipe(bytes, stream) {
    const out = new Response(new Blob([bytes]).stream().pipeThrough(stream));
    return new Uint8Array(await out.arrayBuffer());
  }
  async function encode(obj) {
    const raw = new TextEncoder().encode(JSON.stringify(obj));
    if ("CompressionStream" in window) {
      try { return "z=" + b64url(await pipe(raw, new CompressionStream("deflate-raw"))); } catch { /* sin compresión */ }
    }
    return "j=" + b64url(raw);
  }
  async function decode(hash) {
    const m = String(hash || "").replace(/^#/, "").match(/^(z|j)=(.+)$/);
    if (!m) return null;
    let bytes = fromB64url(m[2]);
    if (m[1] === "z") bytes = await pipe(bytes, new DecompressionStream("deflate-raw"));
    return JSON.parse(new TextDecoder().decode(bytes));
  }
  window.DemoCodec = { encode, decode };
})();
