"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar, { SidebarSection } from "@/components/sidebar";
import { extractDominantColor } from "@/lib/color-extract";

interface Frame {
  id: string;
  title: string;
  story: string;
  image_url: string;
  supplement_images: string[];
  credits: Record<string, string>;
  accent_color: string | null;
  created_at: string;
}

interface QRData {
  qrPng: string;
  qrSvg: string;
  url: string;
}

interface Admin {
  id: number;
  name: string;
  created_at: string;
}

const NAV_ITEMS: SidebarSection[] = [
  {
    id: "frames",
    label: "Frames",
    defaultOpen: true,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "admins",
    label: "Admins",
    defaultOpen: false,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    id: "analytics",
    label: "Analytics",
    defaultOpen: false,
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
];

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [adminName, setAdminName] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeSection, setActiveSection] = useState("frames");

  // Frames
  const [frames, setFrames] = useState<Frame[]>([]);
  const [editing, setEditing] = useState<Frame | null>(null);
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [blobUrl, setBlobUrl] = useState("");
  const [credits, setCredits] = useState<{ key: string; value: string }[]>([]);
  const [accentColor, setAccentColor] = useState("");
  const [autoAccent, setAutoAccent] = useState(true);
  const [supplementImages, setSupplementImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [qrData, setQrData] = useState<QRData | null>(null);
  const [scanCounts, setScanCounts] = useState<Record<string, number>>({});

  // Admins
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminSuccess, setAdminSuccess] = useState("");

  const svgRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supplementInputRef = useRef<HTMLInputElement>(null);
  const imgPreviewRef = useRef<HTMLImageElement>(null);

  const isSuperuser = adminName === "superuser";

  // Auth
  useEffect(() => {
    if (!loggedIn) return;
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/frames");
      const data = await res.json();
      if (cancelled) return;
      setFrames(data);
      const counts: Record<string, number> = {};
      for (const f of data) {
        const scanRes = await fetch(`/api/scan/count?frameId=${f.id}`);
        const scanData = await scanRes.json();
        counts[f.id] = scanData.count || 0;
      }
      setScanCounts(counts);
    })();
    return () => { cancelled = true; };
  }, [loggedIn]);

  useEffect(() => {
    if (!loggedIn || !isSuperuser) return;
    fetch("/api/admin").then((r) => r.json()).then(setAdmins);
  }, [loggedIn, isSuperuser]);

  async function fetchFrames() {
    const res = await fetch("/api/frames");
    const data = await res.json();
    setFrames(data);
    const counts: Record<string, number> = {};
    for (const f of data) {
      const scanRes = await fetch(`/api/scan/count?frameId=${f.id}`);
      const scanData = await scanRes.json();
      counts[f.id] = scanData.count || 0;
    }
    setScanCounts(counts);
  }

  async function fetchAdmins() {
    const res = await fetch("/api/admin");
    setAdmins(await res.json());
  }

  // Color extraction when image loads
  const handleImagePreviewLoad = useCallback(() => {
    if (!autoAccent || !imgPreviewRef.current) return;
    const color = extractDominantColor(imgPreviewRef.current);
    setAccentColor(color);
  }, [autoAccent]);

  // Upload — single image
  async function uploadFile(file: File) {
    setUploading(true);
    const preview = URL.createObjectURL(file);
    setBlobUrl(preview);

    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (data.url) setImageUrl(data.url);
    setUploading(false);
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) uploadFile(file);
  }, []);

  async function uploadSupplement(file: File) {
    if (supplementImages.length >= 10) return;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (data.url) setSupplementImages((prev) => [...prev, data.url].slice(0, 10));
  }

  const handleSupplementDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    files.slice(0, 10 - supplementImages.length).forEach(uploadSupplement);
  }, [supplementImages.length]);

  // Auth
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: adminName, password }),
      });
      const data = await res.json();
      if (data.ok) {
        setLoggedIn(true);
        if (adminName === "superuser") fetchAdmins();
      } else {
        setLoginError("Invalid credentials");
      }
    } catch {
      setLoginError("Login failed");
    }
  }

  // Frames CRUD
  function handleNew() {
    setEditing(null);
    setTitle("");
    setStory("");
    setImageUrl("");
    setBlobUrl("");
    setCredits([]);
    setAccentColor("");
    setAutoAccent(true);
    setSupplementImages([]);
    setQrData(null);
  }

  function handleEdit(frame: Frame) {
    setEditing(frame);
    setTitle(frame.title);
    setStory(frame.story);
    setImageUrl(frame.image_url);
    setBlobUrl("");
    const c = frame.credits || {};
    setCredits(Object.entries(c).map(([key, value]) => ({ key, value })));
    setAccentColor(frame.accent_color || "");
    setAutoAccent(false);
    setSupplementImages(frame.supplement_images || []);
    setQrData(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!imageUrl) return;
    setSaving(true);
    const creditsObj: Record<string, string> = {};
    credits.filter((c) => c.key.trim()).forEach((c) => { creditsObj[c.key.trim()] = c.value.trim(); });
    const body = {
      ...(editing ? { id: editing.id } : {}),
      title,
      story,
      image_url: imageUrl,
      supplement_images: supplementImages,
      credits: creditsObj,
      accent_color: accentColor || null,
      admin_name: adminName,
    };
    const res = await fetch("/api/frames", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setQrData(data);
    setSaving(false);
    fetchFrames();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this frame? The QR code will stop working.")) return;
    await fetch("/api/frames", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (editing?.id === id) handleNew();
    fetchFrames();
  }

  // Admins
  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    setAdminError("");
    setAdminSuccess("");
    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newAdminName, password: newAdminPassword, created_by: adminName }),
    });
    const data = await res.json();
    if (data.ok) {
      setAdminSuccess(`Admin "${newAdminName}" created`);
      setNewAdminName("");
      setNewAdminPassword("");
      fetchAdmins();
    } else {
      setAdminError(data.error || "Failed");
    }
  }

  async function handleDeleteAdmin(id: number) {
    if (!confirm("Delete this admin?")) return;
    await fetch("/api/admin", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, admin_name: adminName }),
    });
    fetchAdmins();
  }

  // QR download
  function downloadSvg() {
    if (!svgRef.current) return;
    const svg = svgRef.current.querySelector("svg");
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `frame-dynasty-qr-${editing?.id || "new"}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadPng() {
    if (!qrData?.qrPng) return;
    const a = document.createElement("a");
    a.href = qrData.qrPng;
    a.download = `frame-dynasty-qr-${editing?.id || "new"}.png`;
    a.click();
  }

  // Login
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <img src="/logo.png" alt="Frame Dynasty" className="h-10 mx-auto mb-8" />
          <h1 className="text-white text-xl font-[family-name:var(--font-handorty)] text-center">Admin</h1>
          {loginError && <p className="text-red-400 text-xs text-center">{loginError}</p>}
          <input type="text" placeholder="Admin name" value={adminName} onChange={(e) => setAdminName(e.target.value)} required autoFocus
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 font-[family-name:var(--font-montserrat)] text-sm focus:outline-none focus:border-gold/50 transition-colors" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
            className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 font-[family-name:var(--font-montserrat)] text-sm focus:outline-none focus:border-gold/50 transition-colors" />
          <button type="submit"
            className="w-full py-3 rounded-lg bg-gold text-black font-[family-name:var(--font-montserrat)] font-semibold hover:bg-gold-dark transition-colors duration-150 active:scale-[0.96]">
            Sign In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} sections={NAV_ITEMS} />

      <main className="flex-1 min-h-screen lg:ml-64">
        <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="lg:hidden w-10" />
              <h2 className="font-[family-name:var(--font-montserrat)] font-semibold text-white capitalize">
                {activeSection}
              </h2>
            </div>
            <button
              onClick={() => setLoggedIn(false)}
              className="text-white/30 hover:text-white/60 text-sm font-[family-name:var(--font-montserrat)] transition-colors"
            >
              Sign Out
            </button>
          </div>
        </header>

        <div className="p-6 max-w-5xl">
          {/* ===== FRAMES SECTION ===== */}
          {activeSection === "frames" && (
            <div className="space-y-8">
              {/* Frame editor */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-[family-name:var(--font-montserrat)] font-semibold text-white">
                    {editing ? `Editing: ${editing.title}` : "New Frame"}
                  </h3>
                  {editing && (
                    <button onClick={handleNew}
                      className="text-xs text-white/40 hover:text-white/60 font-[family-name:var(--font-montserrat)] transition-colors">
                      + Create new instead
                    </button>
                  )}
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  {/* Image dropzone — single image */}
                  <div>
                    <label className="block text-white/40 text-xs font-[family-name:var(--font-montserrat)] mb-1.5">Image</label>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative w-full h-48 rounded-lg border-2 border-dashed transition-colors cursor-pointer flex items-center justify-center overflow-hidden ${
                        dragging ? "border-gold bg-gold/5" : imageUrl ? "border-white/10" : "border-white/20 hover:border-white/30"
                      }`}
                    >
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />

                      {uploading ? (
                        <div className="text-center">
                          <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          <span className="text-white/40 text-xs font-[family-name:var(--font-montserrat)]">Uploading...</span>
                        </div>
                      ) : imageUrl ? (
                        <>
                          <img ref={imgPreviewRef} src={blobUrl || imageUrl} alt="Preview"
                            className="w-full h-full object-cover" onLoad={handleImagePreviewLoad} />
                          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-sm font-[family-name:var(--font-montserrat)]">Click or drop to replace</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center px-4">
                          <svg className="w-10 h-10 text-white/20 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                          <span className="text-white/40 text-sm font-[family-name:var(--font-montserrat)] block">Drag & drop or click</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Supplement images */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-white/40 text-xs font-[family-name:var(--font-montserrat)]">
                        Supplement Images ({supplementImages.length}/10)
                      </label>
                    </div>
                    {supplementImages.length > 0 && (
                      <div className="grid grid-cols-5 gap-2 mb-3">
                        {supplementImages.map((url, i) => (
                          <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                            <img src={url} alt={`Supplement ${i + 1}`} className="w-full h-full object-cover" />
                            <button type="button"
                              onClick={() => setSupplementImages((prev) => prev.filter((_, j) => j !== i))}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white/60 hover:text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {supplementImages.length < 10 && (
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleSupplementDrop}
                        onClick={() => supplementInputRef.current?.click()}
                        className="w-full h-24 rounded-lg border-2 border-dashed border-white/20 hover:border-white/30 transition-colors cursor-pointer flex items-center justify-center"
                      >
                        <input ref={supplementInputRef} type="file" accept="image/*" multiple className="hidden"
                          onChange={(e) => { Array.from(e.target.files || []).forEach(uploadSupplement); e.target.value = ""; }} />
                        <div className="text-center">
                          <svg className="w-6 h-6 text-white/20 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                          <span className="text-white/30 text-xs font-[family-name:var(--font-montserrat)]">Add images (max 10)</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-white/40 text-xs font-[family-name:var(--font-montserrat)] mb-1.5">Title</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 font-[family-name:var(--font-montserrat)] text-sm focus:outline-none focus:border-gold/50 transition-colors" />
                  </div>

                  <div>
                    <label className="block text-white/40 text-xs font-[family-name:var(--font-montserrat)] mb-1.5">Story</label>
                    <textarea value={story} onChange={(e) => setStory(e.target.value)} required rows={6}
                      className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 font-[family-name:var(--font-montserrat)] text-sm focus:outline-none focus:border-gold/50 transition-colors resize-y" />
                  </div>

                  {/* Accent color */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-white/40 text-xs font-[family-name:var(--font-montserrat)]">Accent Color</label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={autoAccent} onChange={(e) => setAutoAccent(e.target.checked)}
                          className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 text-gold focus:ring-gold/50" />
                        <span className="text-white/30 text-xs font-[family-name:var(--font-montserrat)]">Auto-detect from image</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="color" value={accentColor || "#FFC825"} onChange={(e) => { setAutoAccent(false); setAccentColor(e.target.value); }}
                        className="w-10 h-10 rounded border border-white/10 cursor-pointer bg-transparent" />
                      <input type="text" value={accentColor} onChange={(e) => { setAutoAccent(false); setAccentColor(e.target.value); }}
                        placeholder="#FFC825"
                        className="flex-1 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 font-[family-name:var(--font-montserrat)] text-sm focus:outline-none focus:border-gold/50 transition-colors" />
                    </div>
                  </div>

                  {/* Credits — key value pairs */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-white/40 text-xs font-[family-name:var(--font-montserrat)]">Credits (optional)</label>
                      <button type="button" onClick={() => setCredits((prev) => [...prev, { key: "", value: "" }])}
                        className="text-gold/60 hover:text-gold text-xs font-[family-name:var(--font-montserrat)] transition-colors">
                        + Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {credits.map((c, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <input type="text" value={c.key} placeholder="Role (e.g. Camera)"
                            onChange={(e) => setCredits((prev) => prev.map((x, j) => j === i ? { ...x, key: e.target.value } : x))}
                            className="w-2/5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 font-[family-name:var(--font-montserrat)] text-sm focus:outline-none focus:border-gold/50 transition-colors" />
                          <input type="text" value={c.value} placeholder="Name"
                            onChange={(e) => setCredits((prev) => prev.map((x, j) => j === i ? { ...x, value: e.target.value } : x))}
                            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 font-[family-name:var(--font-montserrat)] text-sm focus:outline-none focus:border-gold/50 transition-colors" />
                          <button type="button" onClick={() => setCredits((prev) => prev.filter((_, j) => j !== i))}
                            className="text-white/20 hover:text-red-400 p-1.5 transition-colors flex-shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button type="submit" disabled={saving || uploading || !imageUrl}
                    className="w-full py-3 rounded-lg bg-gold text-black font-[family-name:var(--font-montserrat)] font-semibold hover:bg-gold-dark transition-colors duration-150 active:scale-[0.96] disabled:opacity-50">
                    {saving ? "Saving..." : editing ? "Update Frame" : "Create Frame"}
                  </button>
                </form>

                {/* QR Code */}
                {qrData && (
                  <div className="mt-6 p-5 rounded-lg border border-white/10 bg-white/[0.02]">
                    <h4 className="font-[family-name:var(--font-montserrat)] font-semibold text-white mb-2 text-sm">QR Code</h4>
                    <p className="text-white/40 text-xs font-[family-name:var(--font-montserrat)] mb-3 break-all">{qrData.url}</p>
                    <div className="flex justify-center mb-3">
                      <div ref={svgRef} className="bg-white p-3 rounded-lg inline-block" dangerouslySetInnerHTML={{ __html: qrData.qrSvg }} />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={downloadSvg}
                        className="flex-1 py-2 rounded-lg border border-gold/30 text-gold text-xs font-[family-name:var(--font-montserrat)] font-medium hover:border-gold/60 hover:bg-gold/5 transition-all duration-150 active:scale-[0.96]">
                        SVG
                      </button>
                      <button onClick={downloadPng}
                        className="flex-1 py-2 rounded-lg border border-gold/30 text-gold text-xs font-[family-name:var(--font-montserrat)] font-medium hover:border-gold/60 hover:bg-gold/5 transition-all duration-150 active:scale-[0.96]">
                        PNG
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Frame list */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-[family-name:var(--font-montserrat)] font-semibold text-white">
                    All Frames ({frames.length})
                  </h3>
                </div>

                <div className="space-y-2">
                  {frames.map((frame) => (
                    <div key={frame.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                        editing?.id === frame.id ? "border-gold/50 bg-gold/5" : "border-white/5 bg-white/[0.02] hover:border-white/10"
                      }`}
                      onClick={() => handleEdit(frame)}
                    >
                      <img src={frame.image_url} alt={frame.title} className="w-12 h-12 rounded object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-[family-name:var(--font-montserrat)] font-medium text-white text-sm truncate">{frame.title}</h4>
                        <p className="text-white/30 text-xs font-[family-name:var(--font-montserrat)]">
                          /f/{frame.id} &middot; {scanCounts[frame.id] || 0} scans
                        </p>
                      </div>
                      {frame.accent_color && (
                        <div className="w-4 h-4 rounded-full flex-shrink-0 border border-white/10"
                          style={{ backgroundColor: frame.accent_color }} />
                      )}
                      <a href={`/api/qr?id=${frame.id}&format=svg`} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-white/20 hover:text-gold transition-colors p-1 flex-shrink-0" title="Download QR">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                      </a>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(frame.id); }}
                        className="text-white/20 hover:text-red-400 transition-colors p-1 flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {frames.length === 0 && (
                    <p className="text-white/30 text-sm text-center py-12 font-[family-name:var(--font-montserrat)]">
                      No frames yet. Create your first one above.
                    </p>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* ===== ADMINS SECTION ===== */}
          {activeSection === "admins" && isSuperuser && (
            <div className="space-y-8">
              <section>
                <h3 className="font-[family-name:var(--font-montserrat)] font-semibold text-white mb-4">Create Admin</h3>
                <form onSubmit={handleCreateAdmin} className="space-y-3 max-w-md">
                  {adminError && <p className="text-red-400 text-xs">{adminError}</p>}
                  {adminSuccess && <p className="text-green-400 text-xs">{adminSuccess}</p>}
                  <input type="text" placeholder="Admin name" value={newAdminName} onChange={(e) => setNewAdminName(e.target.value)} required
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 font-[family-name:var(--font-montserrat)] text-sm focus:outline-none focus:border-gold/50 transition-colors" />
                  <input type="password" placeholder="Password" value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} required
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 font-[family-name:var(--font-montserrat)] text-sm focus:outline-none focus:border-gold/50 transition-colors" />
                  <button type="submit"
                    className="px-5 py-2.5 rounded-lg bg-orange text-white text-sm font-[family-name:var(--font-montserrat)] font-medium hover:bg-orange-dark transition-colors duration-150 active:scale-[0.96]">
                    Create Admin
                  </button>
                </form>
              </section>

              <section>
                <h3 className="font-[family-name:var(--font-montserrat)] font-semibold text-white mb-4">
                  All Admins ({admins.length})
                </h3>
                <div className="space-y-2 max-w-md">
                  {admins.map((admin) => (
                    <div key={admin.id} className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                      <div>
                        <span className="text-white text-sm font-[family-name:var(--font-montserrat)]">{admin.name}</span>
                        {admin.name === "superuser" && (
                          <span className="ml-2 text-gold text-xs font-[family-name:var(--font-montserrat)]">(superuser)</span>
                        )}
                      </div>
                      {admin.name !== "superuser" && (
                        <button onClick={() => handleDeleteAdmin(admin.id)}
                          className="text-white/20 hover:text-red-400 transition-colors p-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ===== ANALYTICS SECTION (placeholder) ===== */}
          {activeSection === "analytics" && (
            <div className="text-center py-20">
              <svg className="w-12 h-12 text-white/10 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-white/30 font-[family-name:var(--font-montserrat)]">Analytics dashboard coming soon.</p>
              <p className="text-white/20 text-xs font-[family-name:var(--font-montserrat)] mt-1">Scan data is being collected in the background.</p>
            </div>
          )}

          {activeSection === "admins" && !isSuperuser && (
            <div className="text-center py-20">
              <p className="text-white/30 font-[family-name:var(--font-montserrat)]">Only superuser can manage admins.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
