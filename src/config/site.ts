export const siteConfig = {
  // ====== CUSTOMIZE THESE FOR EACH TOOL ======
  name: "iFrame Embed Generator",
  title: "iFrame Embed Generator — YouTube, Google Maps, Vimeo & More",
  description:
    "Generate clean, customizable iframe embed codes for YouTube videos, Google Maps, Vimeo, and CodePen. Instant live preview, no login required.",
  url: "https://iframe-embed-generator.tools.jagodana.com",
  ogImage: "/opengraph-image",

  // Header
  headerIcon: "Code2",
  brandAccentColor: "#6366f1", // hex accent for OG image gradient (must match --brand-accent in globals.css)

  // SEO
  keywords: [
    "iframe embed generator",
    "youtube embed code generator",
    "google maps embed code",
    "vimeo embed generator",
    "embed code generator",
    "html iframe generator",
    "responsive iframe embed",
    "youtube iframe embed",
    "embed youtube video website",
    "free iframe tool",
  ],
  applicationCategory: "DeveloperApplication",

  // Theme
  themeColor: "#3b82f6",

  // Branding
  creator: "Jagodana",
  creatorUrl: "https://jagodana.com",
  twitterHandle: "@jagodana",

  // Social Profiles (for Organization schema sameAs)
  socialProfiles: [
    "https://twitter.com/jagodana",
  ],

  // Links
  links: {
    github: "https://github.com/Jagodana-Studio-Private-Limited/iframe-embed-generator",
    website: "https://jagodana.com",
  },

  // Footer
  footer: {
    about:
      "iFrame Embed Generator is a free, no-login tool to instantly create customizable embed codes for YouTube, Google Maps, Vimeo, and CodePen.",
    featuresTitle: "Features",
    features: [
      "YouTube embed with options",
      "Google Maps embed",
      "Vimeo embed",
      "CodePen embed",
    ],
  },

  // Hero Section
  hero: {
    badge: "Free iFrame Embed Tool",
    titleLine1: "Generate Embed Codes",
    titleGradient: "Instantly",
    subtitle:
      "Paste a YouTube, Google Maps, Vimeo, or CodePen URL and get a perfectly crafted iframe embed code with live preview in seconds.",
  },

  // Feature Cards (shown on homepage)
  featureCards: [
    {
      icon: "🎬",
      title: "YouTube & Vimeo",
      description:
        "Embed videos with autoplay, loop, privacy mode, and custom start time options.",
    },
    {
      icon: "🗺️",
      title: "Google Maps",
      description:
        "Embed any Google Maps location with adjustable zoom, satellite, or street view.",
    },
    {
      icon: "📋",
      title: "Copy & Use",
      description:
        "One-click copy of production-ready HTML. Paste directly into your website or CMS.",
    },
  ],

  // Related Tools (cross-linking to sibling Jagodana tools for internal SEO)
  relatedTools: [
    {
      name: "Meta Tag Generator",
      url: "https://meta-tag-generator.tools.jagodana.com",
      icon: "🏷️",
      description: "Generate SEO meta tags for any webpage.",
    },
    {
      name: "OG Preview",
      url: "https://og-preview.tools.jagodana.com",
      icon: "🔍",
      description: "Preview how your page looks when shared on social media.",
    },
    {
      name: "HTML to JSX Converter",
      url: "https://html-to-jsx-converter.tools.jagodana.com",
      icon: "⚛️",
      description: "Convert plain HTML to valid JSX for React components.",
    },
    {
      name: "Social Card Preview",
      url: "https://social-card-preview.tools.jagodana.com",
      icon: "📱",
      description: "Preview social sharing cards for Twitter, Facebook, and LinkedIn.",
    },
    {
      name: "UTM Builder",
      url: "https://utm-builder.tools.jagodana.com",
      icon: "🔗",
      description: "Build UTM tracking links for your campaigns.",
    },
    {
      name: "URL Parser",
      url: "https://url-parser.tools.jagodana.com",
      icon: "🔎",
      description: "Parse and inspect every component of any URL.",
    },
  ],

  // HowTo Steps (drives HowTo JSON-LD schema for rich results)
  howToSteps: [
    {
      name: "Select a platform",
      text: "Choose YouTube, Google Maps, Vimeo, or CodePen from the tabs.",
      url: "",
    },
    {
      name: "Paste your URL",
      text: "Paste the video, map, or pen URL into the input field.",
      url: "",
    },
    {
      name: "Customize options",
      text: "Adjust width, height, autoplay, loop, and other settings for your embed.",
      url: "",
    },
    {
      name: "Copy the code",
      text: "Click the Copy button to copy the ready-to-use iframe HTML code.",
      url: "",
    },
  ],
  howToTotalTime: "PT1M",

  // FAQ (drives both the FAQ UI section and FAQPage JSON-LD schema)
  faq: [
    {
      question: "What platforms does the iFrame Embed Generator support?",
      answer:
        "The tool supports YouTube videos, Google Maps locations, Vimeo videos, and CodePen pens. Simply paste the URL for any of these platforms and get the correct iframe embed code instantly.",
    },
    {
      question: "Is the embed code responsive?",
      answer:
        "Yes. The generator outputs a responsive wrapper by default so the embed scales to fit any screen size. You can also set a fixed width and height if you prefer.",
    },
    {
      question: "Do I need to create an account or log in?",
      answer:
        "No. The iFrame Embed Generator is completely free and requires no account or login. All processing happens in your browser.",
    },
    {
      question: "Can I enable autoplay for YouTube embeds?",
      answer:
        "Yes. Toggle the Autoplay option in the YouTube settings panel. Note that most modern browsers require the video to be muted for autoplay to work — the tool handles this automatically.",
    },
    {
      question: "How do I embed a YouTube video with a custom start time?",
      answer:
        "Enable the 'Start at' option and enter the timestamp in seconds. For example, entering 90 will start the video at the 1:30 mark.",
    },
    {
      question: "What is YouTube Privacy-Enhanced Mode?",
      answer:
        "Privacy-enhanced mode uses youtube-nocookie.com instead of youtube.com for the embed, which means YouTube won't set cookies on your visitors until they click play. This can help with GDPR compliance.",
    },
  ],

  // ====== PAGES (for sitemap + per-page SEO) ======
  pages: {
    "/": {
      title: "iFrame Embed Generator — YouTube, Google Maps, Vimeo & More",
      description:
        "Generate clean, customizable iframe embed codes for YouTube videos, Google Maps, Vimeo, and CodePen. Instant live preview, no login required.",
      changeFrequency: "weekly" as const,
      priority: 1 as const,
    },
  },
} as const;

export type SiteConfig = typeof siteConfig;
