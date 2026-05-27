"use client";

import { useState, useCallback } from "react";
import { Copy, Check, Code2, Youtube, Map, Video, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ToolEvents } from "@/lib/analytics";

// ─── helpers ───────────────────────────────────────────────────────────────

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function extractVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

function extractGoogleMapsEmbedSrc(url: string): string | null {
  // Accept share URLs like maps.app.goo.gl or google.com/maps
  if (!url.match(/google\.com\/maps|maps\.app\.goo\.gl|goo\.gl\/maps/i)) return null;
  // If already an embed URL, return as-is
  if (url.includes("maps/embed")) return url;
  // Build a search embed from share URL (best we can do client-side)
  const encoded = encodeURIComponent(url);
  return `https://www.google.com/maps?output=embed&q=${encoded}`;
}

function extractCodePenData(url: string): { user: string; slug: string } | null {
  const m = url.match(/codepen\.io\/([^/]+)\/(?:pen|full|details)\/([A-Za-z0-9]+)/);
  if (m) return { user: m[1], slug: m[2] };
  return null;
}

// ─── YouTube embed ──────────────────────────────────────────────────────────

interface YouTubeOptions {
  autoplay: boolean;
  mute: boolean;
  loop: boolean;
  controls: boolean;
  privacy: boolean;
  startAt: number;
  width: number;
  height: number;
  responsive: boolean;
}

function buildYouTubeEmbed(id: string, opts: YouTubeOptions): string {
  const base = opts.privacy ? "https://www.youtube-nocookie.com" : "https://www.youtube.com";
  const params = new URLSearchParams();
  if (opts.autoplay) { params.set("autoplay", "1"); params.set("mute", "1"); }
  if (opts.mute && !opts.autoplay) params.set("mute", "1");
  if (opts.loop) { params.set("loop", "1"); params.set("playlist", id); }
  if (!opts.controls) params.set("controls", "0");
  if (opts.startAt > 0) params.set("start", String(opts.startAt));
  const query = params.toString() ? `?${params.toString()}` : "";
  const src = `${base}/embed/${id}${query}`;

  if (opts.responsive) {
    return `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;">
  <iframe
    src="${src}"
    title="YouTube video player"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
    style="position:absolute;top:0;left:0;width:100%;height:100%;"
  ></iframe>
</div>`;
  }
  return `<iframe
  width="${opts.width}"
  height="${opts.height}"
  src="${src}"
  title="YouTube video player"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  allowfullscreen
></iframe>`;
}

// ─── Vimeo embed ────────────────────────────────────────────────────────────

interface VimeoOptions {
  autoplay: boolean;
  mute: boolean;
  loop: boolean;
  responsive: boolean;
  width: number;
  height: number;
}

function buildVimeoEmbed(id: string, opts: VimeoOptions): string {
  const params = new URLSearchParams();
  if (opts.autoplay) params.set("autoplay", "1");
  if (opts.mute) params.set("muted", "1");
  if (opts.loop) params.set("loop", "1");
  const src = `https://player.vimeo.com/video/${id}?${params.toString()}`;

  if (opts.responsive) {
    return `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;">
  <iframe
    src="${src}"
    title="Vimeo video player"
    frameborder="0"
    allow="autoplay; fullscreen; picture-in-picture"
    allowfullscreen
    style="position:absolute;top:0;left:0;width:100%;height:100%;"
  ></iframe>
</div>`;
  }
  return `<iframe
  width="${opts.width}"
  height="${opts.height}"
  src="${src}"
  title="Vimeo video player"
  frameborder="0"
  allow="autoplay; fullscreen; picture-in-picture"
  allowfullscreen
></iframe>`;
}

// ─── Maps embed ─────────────────────────────────────────────────────────────

interface MapsOptions {
  width: number;
  height: number;
  responsive: boolean;
}

function buildMapsEmbed(src: string, opts: MapsOptions): string {
  if (opts.responsive) {
    return `<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;">
  <iframe
    src="${src}"
    title="Google Maps"
    frameborder="0"
    style="border:0;position:absolute;top:0;left:0;width:100%;height:100%;"
    allowfullscreen
    loading="lazy"
    referrerpolicy="no-referrer-when-downgrade"
  ></iframe>
</div>`;
  }
  return `<iframe
  width="${opts.width}"
  height="${opts.height}"
  src="${src}"
  title="Google Maps"
  frameborder="0"
  style="border:0;"
  allowfullscreen
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
></iframe>`;
}

// ─── CodePen embed ──────────────────────────────────────────────────────────

interface CodePenOptions {
  height: number;
  themeId: string;
  defaultTab: string;
  editable: boolean;
}

function buildCodePenEmbed(user: string, slug: string, opts: CodePenOptions): string {
  return `<p class="codepen"
  data-height="${opts.height}"
  data-theme-id="${opts.themeId}"
  data-default-tab="${opts.defaultTab}"
  data-slug-hash="${slug}"
  data-user="${user}"
  ${opts.editable ? 'data-editable="true"' : ""}
  style="height:${opts.height}px;box-sizing:border-box;display:flex;align-items:center;justify-content:border-box;overflow:hidden;padding:1em;border:1px solid #e0e0e0;margin:1em 0;">
  <span>See the Pen on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>`;
}

// ─── Shared components ──────────────────────────────────────────────────────

function CodeBlock({ code, onCopy }: { code: string; onCopy: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative rounded-xl border border-border/50 bg-muted/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-muted/60">
        <span className="text-xs text-muted-foreground font-mono">HTML</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className="h-7 gap-1 text-xs"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre className="p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed text-foreground/80">
        {code}
      </pre>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
          checked ? "bg-brand" : "bg-muted-foreground/30"
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
    </label>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground w-28 shrink-0">{label}</span>
      {children}
    </div>
  );
}

// ─── YouTube tab ─────────────────────────────────────────────────────────────

function YouTubeTab() {
  const [url, setUrl] = useState("");
  const [opts, setOpts] = useState<YouTubeOptions>({
    autoplay: false,
    mute: false,
    loop: false,
    controls: true,
    privacy: false,
    startAt: 0,
    width: 560,
    height: 315,
    responsive: true,
  });

  const videoId = url ? extractYouTubeId(url) : null;
  const embedCode = videoId ? buildYouTubeEmbed(videoId, opts) : null;

  const set = <K extends keyof YouTubeOptions>(k: K, v: YouTubeOptions[K]) =>
    setOpts((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">YouTube URL</label>
        <Input
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="font-mono text-sm"
        />
        {url && !videoId && (
          <p className="text-xs text-destructive mt-1">
            Could not extract a YouTube video ID from this URL.
          </p>
        )}
      </div>

      {videoId && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Toggle checked={opts.responsive} onChange={(v) => set("responsive", v)} label="Responsive (16:9)" />
            <Toggle checked={opts.autoplay} onChange={(v) => set("autoplay", v)} label="Autoplay (mutes video)" />
            <Toggle checked={opts.mute} onChange={(v) => set("mute", v)} label="Muted" />
            <Toggle checked={opts.loop} onChange={(v) => set("loop", v)} label="Loop" />
            <Toggle checked={opts.controls} onChange={(v) => set("controls", v)} label="Show controls" />
            <Toggle checked={opts.privacy} onChange={(v) => set("privacy", v)} label="Privacy-enhanced mode" />
          </div>

          {!opts.responsive && (
            <div className="grid grid-cols-2 gap-4">
              <FieldRow label="Width (px)">
                <Input
                  type="number"
                  value={opts.width}
                  onChange={(e) => set("width", Number(e.target.value))}
                  className="w-24 font-mono text-sm"
                />
              </FieldRow>
              <FieldRow label="Height (px)">
                <Input
                  type="number"
                  value={opts.height}
                  onChange={(e) => set("height", Number(e.target.value))}
                  className="w-24 font-mono text-sm"
                />
              </FieldRow>
            </div>
          )}

          <FieldRow label="Start at (sec)">
            <Input
              type="number"
              min={0}
              value={opts.startAt}
              onChange={(e) => set("startAt", Number(e.target.value))}
              className="w-24 font-mono text-sm"
            />
          </FieldRow>

          <div className="rounded-xl overflow-hidden border border-border/50 bg-black aspect-video w-full max-w-lg mx-auto">
            <iframe
              width="100%"
              height="100%"
              src={`${opts.privacy ? "https://www.youtube-nocookie.com" : "https://www.youtube.com"}/embed/${videoId}${
                opts.startAt > 0 ? `?start=${opts.startAt}` : ""
              }`}
              title="YouTube preview"
              frameBorder="0"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          <CodeBlock
            code={embedCode!}
            onCopy={() => {
              ToolEvents.resultCopied();
              toast.success("YouTube embed code copied!");
            }}
          />
        </>
      )}
    </div>
  );
}

// ─── Google Maps tab ─────────────────────────────────────────────────────────

function GoogleMapsTab() {
  const [url, setUrl] = useState("");
  const [opts, setOpts] = useState<MapsOptions>({
    width: 600,
    height: 450,
    responsive: true,
  });

  const embedSrc = url ? extractGoogleMapsEmbedSrc(url) : null;
  const embedCode = embedSrc ? buildMapsEmbed(embedSrc, opts) : null;

  const set = <K extends keyof MapsOptions>(k: K, v: MapsOptions[K]) =>
    setOpts((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Google Maps URL</label>
        <Input
          placeholder="https://www.google.com/maps/place/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="font-mono text-sm"
        />
        {url && !embedSrc && (
          <p className="text-xs text-destructive mt-1">
            Please paste a Google Maps share URL.
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Open Google Maps → Share → Copy link, then paste it here.
        </p>
      </div>

      {embedSrc && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Toggle checked={opts.responsive} onChange={(v) => set("responsive", v)} label="Responsive" />
          </div>

          {!opts.responsive && (
            <div className="grid grid-cols-2 gap-4">
              <FieldRow label="Width (px)">
                <Input
                  type="number"
                  value={opts.width}
                  onChange={(e) => set("width", Number(e.target.value))}
                  className="w-24 font-mono text-sm"
                />
              </FieldRow>
              <FieldRow label="Height (px)">
                <Input
                  type="number"
                  value={opts.height}
                  onChange={(e) => set("height", Number(e.target.value))}
                  className="w-24 font-mono text-sm"
                />
              </FieldRow>
            </div>
          )}

          <div className="rounded-xl overflow-hidden border border-border/50 aspect-video w-full max-w-lg mx-auto">
            <iframe
              width="100%"
              height="100%"
              src={embedSrc}
              title="Google Maps preview"
              frameBorder="0"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
            />
          </div>

          <CodeBlock
            code={embedCode!}
            onCopy={() => {
              ToolEvents.resultCopied();
              toast.success("Google Maps embed code copied!");
            }}
          />
        </>
      )}
    </div>
  );
}

// ─── Vimeo tab ───────────────────────────────────────────────────────────────

function VimeoTab() {
  const [url, setUrl] = useState("");
  const [opts, setOpts] = useState<VimeoOptions>({
    autoplay: false,
    mute: false,
    loop: false,
    responsive: true,
    width: 640,
    height: 360,
  });

  const videoId = url ? extractVimeoId(url) : null;
  const embedCode = videoId ? buildVimeoEmbed(videoId, opts) : null;

  const set = <K extends keyof VimeoOptions>(k: K, v: VimeoOptions[K]) =>
    setOpts((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Vimeo URL</label>
        <Input
          placeholder="https://vimeo.com/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="font-mono text-sm"
        />
        {url && !videoId && (
          <p className="text-xs text-destructive mt-1">
            Could not extract a Vimeo video ID from this URL.
          </p>
        )}
      </div>

      {videoId && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Toggle checked={opts.responsive} onChange={(v) => set("responsive", v)} label="Responsive (16:9)" />
            <Toggle checked={opts.autoplay} onChange={(v) => set("autoplay", v)} label="Autoplay" />
            <Toggle checked={opts.mute} onChange={(v) => set("mute", v)} label="Muted" />
            <Toggle checked={opts.loop} onChange={(v) => set("loop", v)} label="Loop" />
          </div>

          {!opts.responsive && (
            <div className="grid grid-cols-2 gap-4">
              <FieldRow label="Width (px)">
                <Input
                  type="number"
                  value={opts.width}
                  onChange={(e) => set("width", Number(e.target.value))}
                  className="w-24 font-mono text-sm"
                />
              </FieldRow>
              <FieldRow label="Height (px)">
                <Input
                  type="number"
                  value={opts.height}
                  onChange={(e) => set("height", Number(e.target.value))}
                  className="w-24 font-mono text-sm"
                />
              </FieldRow>
            </div>
          )}

          <div className="rounded-xl overflow-hidden border border-border/50 aspect-video w-full max-w-lg mx-auto">
            <iframe
              width="100%"
              height="100%"
              src={`https://player.vimeo.com/video/${videoId}`}
              title="Vimeo preview"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>

          <CodeBlock
            code={embedCode!}
            onCopy={() => {
              ToolEvents.resultCopied();
              toast.success("Vimeo embed code copied!");
            }}
          />
        </>
      )}
    </div>
  );
}

// ─── CodePen tab ─────────────────────────────────────────────────────────────

function CodePenTab() {
  const [url, setUrl] = useState("");
  const [opts, setOpts] = useState<CodePenOptions>({
    height: 400,
    themeId: "default",
    defaultTab: "html,result",
    editable: false,
  });

  const penData = url ? extractCodePenData(url) : null;
  const embedCode = penData ? buildCodePenEmbed(penData.user, penData.slug, opts) : null;

  const tabOptions = ["html,result", "css,result", "js,result", "result"];

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">CodePen URL</label>
        <Input
          placeholder="https://codepen.io/user/pen/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="font-mono text-sm"
        />
        {url && !penData && (
          <p className="text-xs text-destructive mt-1">
            Could not extract a CodePen pen from this URL.
          </p>
        )}
      </div>

      {penData && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Toggle checked={opts.editable} onChange={(v) => setOpts((p) => ({ ...p, editable: v }))} label="Editable" />
          </div>

          <FieldRow label="Height (px)">
            <Input
              type="number"
              value={opts.height}
              onChange={(e) => setOpts((p) => ({ ...p, height: Number(e.target.value) }))}
              className="w-24 font-mono text-sm"
            />
          </FieldRow>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Default tab</label>
            <div className="flex gap-2 flex-wrap">
              {tabOptions.map((t) => (
                <button
                  key={t}
                  onClick={() => setOpts((p) => ({ ...p, defaultTab: t }))}
                  className={`px-3 py-1 rounded-md text-xs font-mono border transition-colors ${
                    opts.defaultTab === t
                      ? "bg-brand text-white border-brand"
                      : "border-border/50 text-muted-foreground hover:border-brand/50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/40 border border-border/50">
            <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
            <a
              href={`https://codepen.io/${penData.user}/pen/${penData.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand hover:underline truncate"
            >
              {`codepen.io/${penData.user}/pen/${penData.slug}`}
            </a>
          </div>

          <CodeBlock
            code={embedCode!}
            onCopy={() => {
              ToolEvents.resultCopied();
              toast.success("CodePen embed code copied!");
            }}
          />
        </>
      )}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function IframeEmbedGeneratorTool() {
  const trackTabChange = useCallback((value: string) => {
    ToolEvents.toolUsed(value);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="max-w-3xl mx-auto"
    >
      <div className="rounded-2xl border border-border/50 bg-card shadow-xl shadow-brand/5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border/50 bg-gradient-to-r from-brand/5 to-brand-accent/5">
          <div className="p-2 rounded-lg bg-gradient-to-br from-brand to-brand-accent">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-base">iFrame Embed Generator</h2>
            <p className="text-xs text-muted-foreground">
              Paste a URL and get instant embed code
            </p>
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="youtube" onValueChange={trackTabChange}>
            <TabsList className="grid grid-cols-4 mb-6 h-auto p-1">
              <TabsTrigger value="youtube" className="flex items-center gap-1.5 text-xs sm:text-sm py-2">
                <Youtube className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">YouTube</span>
              </TabsTrigger>
              <TabsTrigger value="maps" className="flex items-center gap-1.5 text-xs sm:text-sm py-2">
                <Map className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Maps</span>
              </TabsTrigger>
              <TabsTrigger value="vimeo" className="flex items-center gap-1.5 text-xs sm:text-sm py-2">
                <Video className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Vimeo</span>
              </TabsTrigger>
              <TabsTrigger value="codepen" className="flex items-center gap-1.5 text-xs sm:text-sm py-2">
                <Code2 className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">CodePen</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="youtube">
              <YouTubeTab />
            </TabsContent>
            <TabsContent value="maps">
              <GoogleMapsTab />
            </TabsContent>
            <TabsContent value="vimeo">
              <VimeoTab />
            </TabsContent>
            <TabsContent value="codepen">
              <CodePenTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}
