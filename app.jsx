const { useState } = React;

const COLORS = {
  saffron: "#C8511B",
  saffronLight: "#F5E6DC",
  saffronDark: "#8B3512",
  gold: "#D4A017",
  goldLight: "#FBF3DC",
  burgundy: "#6B1A2E",
  burgundyLight: "#F5E6EC",
  cream: "#FDF8F3",
  text: "#1A0A0A",
  textMuted: "#6B5C52",
  border: "rgba(200, 81, 27, 0.15)",
  success: "#1D6E3A",
  successLight: "#E6F4EC",
};

const CREATORS = [
  { id: 1, name: "Meena Krishnamurthy", city: "Bhubaneswar", rating: 4.9, orders: 312, specialty: "Kanjivaram & Silk", avatar: "MK", badge: "Top Artisan", turnaround: "12–15 days", price: "$45–$120", bio: "Third-generation blouse maker specializing in intricate zari work and mirror embroidery.", portfolio: ["Deep neck with piping", "Backless with tassels", "Boat neck with lace border"] },
  { id: 2, name: "Anitha Subramaniam", city: "Cuttack", rating: 4.8, orders: 198, specialty: "Cotton & Linen", avatar: "AS", badge: "Eco Certified", turnaround: "10–12 days", price: "$30–$80", bio: "Sustainable fabric specialist. Hand-block prints and natural dyes are my signature.", portfolio: ["Puff sleeve casual", "Crop tie-back style", "Bishop sleeves"] },
  { id: 3, name: "Lakshmi Venkataraman", city: "Puri", rating: 4.95, orders: 445, specialty: "Bridal & Heavy Work", avatar: "LV", badge: "Bridal Expert", turnaround: "20–25 days", price: "$90–$250", bio: "Specializing in wedding blouses with stone work, kundan embellishments, and gold thread.", portfolio: ["Halter neck bridal", "Full back embroidery", "Sleeveless with border"] },
  { id: 4, name: "Priya Ramanathan", city: "Rourkela", rating: 4.7, orders: 156, specialty: "Pattu & Pochampally", avatar: "PR", badge: "Rising Star", turnaround: "14–18 days", price: "$40–$100", bio: "Young artisan bringing modern silhouettes to traditional pattu saree blouses.", portfolio: ["Cold shoulder design", "Princess cut structured", "Elbow sleeve with piping"] },
];

const MEASUREMENTS = ["Chest", "Waist", "Shoulder Width", "Sleeve Length", "Back Length", "Front Length", "Neck Depth (Front)", "Neck Depth (Back)", "Armhole", "Dart Position"];

function Avatar({ initials, size = 40, color = COLORS.saffron }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: COLORS.saffronLight, border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: size * 0.35, color: COLORS.saffronDark, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function Badge({ text, color = COLORS.saffron, bg = COLORS.saffronLight }) {
  return (
    <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, letterSpacing: "0.03em" }}>{text}</span>
  );
}

function StarRating({ rating }) {
  return (
    <span style={{ color: COLORS.gold, fontSize: 13, fontWeight: 500 }}>
      {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))} <span style={{ color: COLORS.textMuted }}>{rating}</span>
    </span>
  );
}

function UserSettingsMenu({ onAction }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const items = [
    { label: "My Account", icon: "👤", action: () => onAction("customer") },
    { label: "My Orders", icon: "📦", action: () => onAction("order-login") },
    { label: "Notifications", icon: "🔔", action: () => onAction("customer") },
    { label: "Preferences", icon: "⚙", action: () => onAction("customer") },
    { divider: true },
    { label: "Help & Support", icon: "?", action: () => onAction("feedback") },
    { label: "Sign Out", icon: "↩", action: () => onAction("customer") },
  ];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="User settings"
        title="User settings"
        style={{
          width: 40, height: 40, borderRadius: "50%",
          border: `1.5px solid ${COLORS.border}`,
          background: open ? COLORS.saffronLight : "#fff",
          color: COLORS.burgundy,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", padding: 0,
          transition: "all 0.15s",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          minWidth: 220,
          background: "#fff",
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12,
          boxShadow: "0 12px 28px -8px rgba(107, 26, 46, 0.25)",
          padding: "6px",
          zIndex: 20,
        }}>
          {items.map((it, i) => it.divider ? (
            <div key={i} style={{ height: 1, background: COLORS.border, margin: "6px 4px" }} />
          ) : (
            <button
              key={i}
              onClick={() => { setOpen(false); it.action?.(); }}
              style={{
                width: "100%", textAlign: "left",
                padding: "9px 12px", borderRadius: 8,
                background: "transparent", border: "none",
                cursor: "pointer", color: COLORS.text,
                fontSize: 14, fontWeight: 500, fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 10,
              }}
              onMouseEnter={e => e.currentTarget.style.background = COLORS.saffronLight}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ width: 18, textAlign: "center", color: COLORS.saffron }}>{it.icon}</span>
              <span>{it.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LandingPage({ onLogin }) {
  return (
    <div style={{ minHeight: "100vh", background: COLORS.cream, fontFamily: "'Georgia', serif" }}>
      <nav style={{ padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${COLORS.border}`, background: "#fff", position: "sticky", top: 0, zIndex: 10 }}>
        <a href="#home" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <div style={{ width: 36, height: 36, background: COLORS.saffron, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 16 }}>✦</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 20, color: COLORS.burgundy, letterSpacing: "-0.02em" }}>KarunaStitch</span>
        </a>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {[["Home", "home"]].map(([label, id]) => (
            <a key={id} href={`#${id}`} style={{ padding: "8px 16px", color: COLORS.text, fontWeight: 600, fontSize: 14, textDecoration: "none", borderRadius: 6 }}>{label}</a>
          ))}
          <button onClick={() => onLogin("order-login")} style={{ padding: "8px 16px", background: "none", border: "none", color: COLORS.text, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Place your order</button>
          <button onClick={() => onLogin("feedback")} style={{ padding: "8px 16px", background: "none", border: "none", color: COLORS.text, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Feedback</button>
          <button onClick={() => onLogin("artisan-apply")} style={{ padding: "8px 16px", background: "none", border: "none", color: COLORS.text, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Join as artisan</button>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={() => onLogin("customer")} style={{ padding: "8px 20px", border: `1.5px solid ${COLORS.saffron}`, borderRadius: 8, background: "transparent", color: COLORS.saffron, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Sign In</button>
          <button onClick={() => onLogin("signup")} style={{ padding: "8px 20px", border: "none", borderRadius: 8, background: COLORS.saffron, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Get Started</button>
          <UserSettingsMenu onAction={onLogin} />
        </div>
      </nav>

      <div id="home" style={{ position: "relative", width: "100%", minHeight: 560, overflow: "hidden", scrollMarginTop: 80, backgroundImage: "url('assets/hero.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}>
        {/* Dark overlay */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 1,
          background: "linear-gradient(180deg, rgba(20,8,12,0.45) 0%, rgba(20,8,12,0.55) 60%, rgba(20,8,12,0.72) 100%)"
        }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 2, padding: "96px 32px 88px", textAlign: "center", maxWidth: 760, margin: "0 auto" }}>
          <h1 style={{ fontSize: 76, lineHeight: 1, margin: 0, marginBottom: 28, letterSpacing: "-0.01em" }}>
            <span className="hero-script" style={{ color: "#E85A8A" }}>Karuna</span>
            <span style={{ display: "inline-block", width: 16 }} />
            <span className="hero-serif" style={{ color: "#fff" }}>Stitch</span>
          </h1>
          <div className="hero-serif" style={{ fontSize: 24, color: "#fff", marginBottom: 22, fontWeight: 500 }}>
            Custom Saree Blouses Designed to Fit You Perfectly
          </div>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.86)", lineHeight: 1.7, marginBottom: 28, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
            Beautiful custom blouses handcrafted by skilled artisans in Odisha, India.
            Every stitch supports talented differently-abled women artisans.
          </p>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24, marginBottom: 36, fontSize: 14, color: "rgba(255,255,255,0.9)", flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>♡ Social Impact</span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.5)" }} />
            <span>Premium Quality</span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.5)" }} />
            <span>Ships to USA</span>
          </div>
          <button onClick={() => onLogin("order-login")} style={{
            padding: "16px 40px",
            background: "#A8264D",
            border: "none",
            borderRadius: 10,
            color: "#fff",
            fontWeight: 600,
            fontSize: 17,
            cursor: "pointer",
            fontFamily: "'Playfair Display', Georgia, serif",
            letterSpacing: "0.01em",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 8px 24px rgba(168, 38, 77, 0.4)"
          }}>
            Design Your Blouse <span style={{ fontSize: 14 }}>✦</span>
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, maxWidth: 700, margin: "64px auto", background: "#fff", borderRadius: 16, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
        {[["2", "Artisans"], ["15", "Happy Customers"], ["60", "Blouses Delivered"]].map(([n, l], i, arr) => (
          <div key={i} style={{ flex: 1, padding: "24px 16px", textAlign: "center", borderRight: i < arr.length - 1 ? `1px solid ${COLORS.border}` : "none" }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.saffron }}>{n}</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      <div id="how-it-works" style={{ padding: "0 32px 72px", maxWidth: 1100, margin: "0 auto", scrollMarginTop: 80 }}>
        <h2 style={{ textAlign: "center", color: COLORS.burgundy, fontSize: 32, marginBottom: 8, fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600 }}>How It Works</h2>
        <p style={{ textAlign: "center", color: COLORS.textMuted, marginBottom: 48, fontSize: 16 }}>Getting your perfect custom blouse is simple</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, alignItems: "stretch", position: "relative" }}>
          {[
            {
              n: 1,
              title: "Choose Your Style",
              desc: "Pick from our curated designs or create your own unique style",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="13.5" cy="6.5" r=".5" fill="#fff" />
                  <circle cx="17.5" cy="10.5" r=".5" fill="#fff" />
                  <circle cx="8.5" cy="7.5" r=".5" fill="#fff" />
                  <circle cx="6.5" cy="12.5" r=".5" fill="#fff" />
                  <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
                </svg>
              ),
            },
            {
              n: 2,
              title: "Share Your Measurements",
              desc: "Provide your measurements so we can craft the perfect fit",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
                  <path d="m14.5 12.5 2-2" />
                  <path d="m11.5 9.5 2-2" />
                  <path d="m8.5 6.5 2-2" />
                  <path d="m17.5 15.5 2-2" />
                </svg>
              ),
            },
            {
              n: 3,
              title: "We Stitch & Deliver",
              desc: "We handcraft your blouse and deliver it to your doorstep",
              icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                  <path d="m3.3 7 8.7 5 8.7-5" />
                  <path d="M12 22V12" />
                </svg>
              ),
            },
          ].map((s, i) => (
            <div key={s.n} style={{ position: "relative", paddingTop: 28, paddingLeft: i === 0 ? 0 : 14, paddingRight: i === 2 ? 0 : 14 }}>
              {/* Connecting line to next card */}
              {i < 2 && (
                <div style={{
                  position: "absolute",
                  top: "50%",
                  right: -14,
                  width: 28,
                  height: 1,
                  background: COLORS.burgundy,
                  opacity: 0.4,
                  zIndex: 0,
                }} />
              )}
              {/* Step number badge */}
              <div style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: COLORS.burgundy,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 15,
                zIndex: 2,
                boxShadow: "0 4px 12px -3px rgba(107, 26, 46, 0.4)",
              }}>{s.n}</div>
              {/* Card */}
              <div style={{
                background: "#fff",
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16,
                padding: "44px 28px 32px",
                textAlign: "center",
                height: "100%",
                boxSizing: "border-box",
                boxShadow: "0 4px 14px -8px rgba(107, 26, 46, 0.15)",
                position: "relative",
                zIndex: 1,
              }}>
                {/* Gradient icon circle */}
                <div style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${COLORS.saffron} 0%, ${COLORS.burgundy} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 22px",
                  boxShadow: "0 6px 18px -6px rgba(168, 38, 77, 0.5)",
                }}>{s.icon}</div>
                <div style={{
                  fontWeight: 700,
                  fontSize: 18,
                  color: COLORS.text,
                  marginBottom: 10,
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}>{s.title}</div>
                <div style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "24px", borderTop: `1px solid ${COLORS.border}`, color: COLORS.textMuted, fontSize: 13 }}>
        © 2025 KarunaStitch · Handcrafted with ♡ · <span style={{ color: COLORS.saffron }}>support@karunastitch.com</span>
      </div>
    </div>
  );
}

function LoginPage({ mode, onSuccess, onBack }) {
  const [tab, setTab] = useState(mode === "creator" ? "creator" : "customer");
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const [form, setForm] = useState({ name: "", email: "", password: "", city: "", specialty: "" });

  const handle = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const submit = () => {
    if (!form.email || !form.password) return;
    const finalUser = { ...form, name: form.name || (tab === "creator" ? "Artisan Demo" : "Priya Sharma") };
    // Persist login/signup to backend
    window.KS_recordEvent?.("user", {
      event: isSignup ? "signup" : "login",
      name: finalUser.name,
      email: finalUser.email,
      role: tab,
      city: finalUser.city,
      specialty: finalUser.specialty,
    });
    onSuccess(tab, finalUser);
  };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.cream, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "Georgia, serif", position: "relative" }}>
      <button onClick={onBack} style={{ position: "absolute", top: 20, left: 24, background: "none", border: "none", color: COLORS.saffron, cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "inherit", padding: "8px 4px" }}>← Back to home</button>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontWeight: 700, fontSize: 22, color: COLORS.burgundy }}>KarunaStitch ✦</div>
        </div>

        <div style={{ display: "flex", background: "#fff", borderRadius: 12, padding: 4, marginBottom: 28, border: `1px solid ${COLORS.border}` }}>
          {[["customer", "I want to order"], ["creator", "I'm an artisan"]].map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "10px", borderRadius: 9, border: "none", background: tab === t ? COLORS.saffron : "transparent", color: tab === t ? "#fff" : COLORS.textMuted, fontWeight: 600, cursor: "pointer", fontSize: 14, transition: "all 0.2s" }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: 16, padding: "32px 28px", border: `1px solid ${COLORS.border}` }}>
          <h2 style={{ color: COLORS.burgundy, fontSize: 22, marginBottom: 4 }}>
            {isSignup ? (tab === "creator" ? "Join as Artisan" : "Create account") : "Welcome back"}
          </h2>
          <p style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 24 }}>
            {tab === "creator" ? "Start receiving orders from the Indian diaspora" : "Find and order from top Indian blouse artisans"}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {isSignup && (
              <input value={form.name} onChange={e => handle("name", e.target.value)} placeholder="Full name" style={{ padding: "12px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
            )}
            <input value={form.email} onChange={e => handle("email", e.target.value)} placeholder="Email address" type="email" style={{ padding: "12px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
            <input value={form.password} onChange={e => handle("password", e.target.value)} placeholder="Password" type="password" style={{ padding: "12px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
            {isSignup && tab === "creator" && (
              <React.Fragment>
                <input value={form.city} onChange={e => handle("city", e.target.value)} placeholder="City (e.g. Bhubaneswar, Cuttack)" style={{ padding: "12px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
                <input value={form.specialty} onChange={e => handle("specialty", e.target.value)} placeholder="Specialty (e.g. Kanjivaram, Bridal)" style={{ padding: "12px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
              </React.Fragment>
            )}
            <button onClick={submit} style={{ padding: "13px", background: COLORS.saffron, border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 4 }}>
              {isSignup ? "Create account" : "Sign in"} →
            </button>
          </div>

          <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: COLORS.textMuted }}>
            {isSignup ? "Already have an account? " : "Don't have an account? "}
            <span onClick={() => setIsSignup(!isSignup)} style={{ color: COLORS.saffron, cursor: "pointer", fontWeight: 600 }}>
              {isSignup ? "Sign in" : "Sign up"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomerDashboard({ user, onLogout }) {
  const [view, setView] = useState("browse");
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [orderStep, setOrderStep] = useState(0);
  const [measurements, setMeasurements] = useState({});
  const [orderNotes, setOrderNotes] = useState("");
  const [activeOrders] = useState([
    { id: "KS-2041", creator: "Meena Krishnamurthy", status: "In progress", item: "Kanjivaram blouse – boat neck", date: "May 2, 2025", eta: "May 18, 2025" },
    { id: "KS-1987", creator: "Lakshmi Venkataraman", status: "Shipped", item: "Bridal blouse – halter neck", date: "Apr 15, 2025", eta: "May 5, 2025" },
  ]);

  const statusColor = { "In progress": [COLORS.goldLight, COLORS.gold], "Shipped": [COLORS.successLight, COLORS.success], "Delivered": ["#e8e8e8", "#555"] };

  if (view === "order" && selectedCreator) {
    return (
      <div style={{ minHeight: "100vh", background: COLORS.cream, fontFamily: "Georgia, serif" }}>
        <div style={{ background: "#fff", padding: "16px 28px", borderBottom: `1px solid ${COLORS.border}`, display: "flex", alignItems: "center", gap: 16 }}>
          <button onClick={() => { setView("browse"); setOrderStep(0); }} style={{ background: "none", border: "none", color: COLORS.saffron, cursor: "pointer", fontSize: 14 }}>← Back</button>
          <span style={{ fontWeight: 700, color: COLORS.burgundy }}>New Order · {selectedCreator.name}</span>
        </div>
        <div style={{ maxWidth: 620, margin: "40px auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
            {["Design details", "Measurements", "Confirm"].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : undefined }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: i <= orderStep ? COLORS.saffron : "#e0d8d4", display: "flex", alignItems: "center", justifyContent: "center", color: i <= orderStep ? "#fff" : COLORS.textMuted, fontSize: 13, fontWeight: 700 }}>{i + 1}</div>
                <span style={{ fontSize: 13, marginLeft: 8, color: i <= orderStep ? COLORS.text : COLORS.textMuted, fontWeight: i === orderStep ? 600 : 400 }}>{s}</span>
                {i < 2 && <div style={{ flex: 1, height: 1, background: i < orderStep ? COLORS.saffron : COLORS.border, margin: "0 16px" }} />}
              </div>
            ))}
          </div>

          {orderStep === 0 && (
            <div style={{ background: "#fff", borderRadius: 14, padding: 28, border: `1px solid ${COLORS.border}` }}>
              <h3 style={{ color: COLORS.burgundy, marginBottom: 20, fontSize: 18 }}>Design Details</h3>
              {[["Blouse style", ["Princess cut", "Boat neck", "V-neck", "Backless", "Halter", "Sweetheart"]], ["Sleeve style", ["Sleeveless", "Short (4 inch)", "Short (6 inch)", "3/4 sleeve", "Full sleeve", "Puff sleeve"]], ["Fabric type", ["I'll send my own fabric", "Kanjivaram silk", "Cotton", "Georgette", "Crepe", "Velvet"]]].map(([label, opts]) => (
                <div key={label} style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, display: "block", marginBottom: 6 }}>{label}</label>
                  <select style={{ width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: "#fff" }}>
                    <option>Select…</option>
                    {opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, display: "block", marginBottom: 6 }}>Special instructions / reference photos</label>
                <textarea value={orderNotes} onChange={e => setOrderNotes(e.target.value)} rows={4} placeholder="Describe any special design elements, add reference links, or describe embellishments…" style={{ width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <button onClick={() => setOrderStep(1)} style={{ width: "100%", padding: 13, background: COLORS.saffron, border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Next: Measurements →</button>
            </div>
          )}

          {orderStep === 1 && (
            <div style={{ background: "#fff", borderRadius: 14, padding: 28, border: `1px solid ${COLORS.border}` }}>
              <h3 style={{ color: COLORS.burgundy, marginBottom: 6, fontSize: 18 }}>Your Measurements</h3>
              <p style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 20 }}>All measurements in inches. Need help? We'll send you a guide!</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {MEASUREMENTS.map(m => (
                  <div key={m}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, display: "block", marginBottom: 4 }}>{m}</label>
                    <input type="number" step="0.5" placeholder='e.g. 36"' value={measurements[m] || ""} onChange={e => setMeasurements(ms => ({ ...ms, [m]: e.target.value }))}
                      style={{ width: "100%", padding: "9px 10px", border: `1px solid ${COLORS.border}`, borderRadius: 7, fontSize: 14, boxSizing: "border-box", fontFamily: "inherit" }} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button onClick={() => setOrderStep(0)} style={{ flex: 1, padding: 12, background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>← Back</button>
                <button onClick={() => setOrderStep(2)} style={{ flex: 2, padding: 12, background: COLORS.saffron, border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Review Order →</button>
              </div>
            </div>
          )}

          {orderStep === 2 && (
            <div>
              <div style={{ background: "#fff", borderRadius: 14, padding: 28, border: `1px solid ${COLORS.border}`, marginBottom: 16 }}>
                <h3 style={{ color: COLORS.burgundy, marginBottom: 20, fontSize: 18 }}>Order Summary</h3>
                <div style={{ display: "flex", gap: 14, alignItems: "center", padding: "16px", background: COLORS.saffronLight, borderRadius: 10, marginBottom: 20 }}>
                  <Avatar initials={selectedCreator.avatar} size={48} />
                  <div>
                    <div style={{ fontWeight: 700, color: COLORS.text }}>{selectedCreator.name}</div>
                    <div style={{ fontSize: 13, color: COLORS.textMuted }}>{selectedCreator.city} · {selectedCreator.specialty}</div>
                    <div style={{ fontSize: 13, color: COLORS.saffron, marginTop: 2 }}>Est. delivery: {selectedCreator.turnaround}</div>
                  </div>
                </div>
                <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 16 }}>
                  {[["Price estimate", selectedCreator.price], ["Shipping to US", "$18–$25"], ["Total estimate", "Quoted after acceptance"]].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14, borderBottom: `1px solid ${COLORS.border}` }}>
                      <span style={{ color: COLORS.textMuted }}>{k}</span>
                      <span style={{ fontWeight: 600, color: COLORS.text }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setOrderStep(1)} style={{ flex: 1, padding: 12, background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 10, fontWeight: 600, cursor: "pointer" }}>← Back</button>
                <button onClick={() => { setView("orders"); setOrderStep(0); }} style={{ flex: 2, padding: 12, background: COLORS.burgundy, border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>Submit Order ✓</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.cream, fontFamily: "Georgia, serif" }}>
      <nav style={{ background: "#fff", borderBottom: `1px solid ${COLORS.border}`, padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: COLORS.burgundy }}>KarunaStitch ✦</div>
        <div style={{ display: "flex", gap: 6 }}>
          {[["browse", "Browse Artisans"], ["orders", "My Orders"]].map(([v, l]) => (
            <button key={v} onClick={() => setView(v)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: view === v ? COLORS.saffronLight : "transparent", color: view === v ? COLORS.saffron : COLORS.textMuted, fontWeight: view === v ? 700 : 400, cursor: "pointer", fontSize: 14 }}>{l}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar initials={(user.name || "PS").slice(0, 2).toUpperCase()} size={32} />
          <span style={{ fontSize: 14, color: COLORS.text, fontWeight: 600 }}>{user.name || "Priya Sharma"}</span>
          <button onClick={onLogout} style={{ padding: "6px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 6, background: "transparent", color: COLORS.textMuted, cursor: "pointer", fontSize: 13 }}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
        {view === "browse" && (
          <React.Fragment>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 26, color: COLORS.burgundy, marginBottom: 6 }}>Find Your Perfect Artisan</h1>
              <p style={{ color: COLORS.textMuted, fontSize: 15 }}>All artisans are verified. Ship directly to any US address.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
              {CREATORS.map(c => (
                <div key={c.id} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
                  <div style={{ background: COLORS.saffronLight, padding: "24px 20px 16px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <Avatar initials={c.avatar} size={52} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ fontWeight: 700, color: COLORS.text, fontSize: 16 }}>{c.name}</div>
                        <Badge text={c.badge} />
                      </div>
                      <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>{c.city} · {c.specialty}</div>
                      <div style={{ marginTop: 6 }}><StarRating rating={c.rating} /></div>
                    </div>
                  </div>
                  <div style={{ padding: "16px 20px" }}>
                    <p style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6, marginBottom: 14 }}>{c.bio}</p>
                    <div style={{ fontSize: 13, marginBottom: 14 }}>
                      <span style={{ color: COLORS.textMuted }}>Portfolio styles: </span>
                      <span style={{ color: COLORS.text }}>{c.portfolio.join(" · ")}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, fontSize: 13 }}>
                      <div><span style={{ color: COLORS.textMuted }}>Turnaround </span><span style={{ fontWeight: 600 }}>{c.turnaround}</span></div>
                      <div><span style={{ color: COLORS.textMuted }}>From </span><span style={{ fontWeight: 600, color: COLORS.saffron }}>{c.price}</span></div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ flex: 1, padding: "9px", border: `1px solid ${COLORS.border}`, borderRadius: 8, background: "transparent", cursor: "pointer", fontSize: 13, color: COLORS.textMuted }}>View profile</button>
                      <button onClick={() => { setSelectedCreator(c); setView("order"); }} style={{ flex: 1, padding: "9px", border: "none", borderRadius: 8, background: COLORS.saffron, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Order now</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </React.Fragment>
        )}

        {view === "orders" && (
          <React.Fragment>
            <h1 style={{ fontSize: 26, color: COLORS.burgundy, marginBottom: 24 }}>My Orders</h1>
            {activeOrders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: COLORS.textMuted }}>No orders yet. <span onClick={() => setView("browse")} style={{ color: COLORS.saffron, cursor: "pointer" }}>Browse artisans →</span></div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {activeOrders.map(o => {
                  const [sbg, sc] = statusColor[o.status] || ["#eee", "#555"];
                  return (
                    <div key={o.id} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${COLORS.border}`, padding: "20px 24px", display: "flex", alignItems: "center", gap: 20 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, color: COLORS.text, fontSize: 15 }}>{o.item}</span>
                          <span style={{ background: sbg, color: sc, fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20 }}>{o.status}</span>
                        </div>
                        <div style={{ fontSize: 13, color: COLORS.textMuted }}>{o.creator} · Order {o.id} · Placed {o.date}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 13, color: COLORS.textMuted }}>Est. arrival</div>
                        <div style={{ fontWeight: 700, color: COLORS.text, fontSize: 14 }}>{o.eta}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

function CreatorDashboard({ user, onLogout }) {
  const [view, setView] = useState("orders");
  const [requests] = useState([
    { id: "KS-2041", customer: "Priya Sharma", city: "San Jose, CA", item: "Kanjivaram blouse – boat neck", date: "May 10, 2025", status: "New request", budget: "$75–$95" },
    { id: "KS-2038", customer: "Deepa Nair", city: "Fremont, CA", item: "Cotton blouse – puff sleeve", date: "May 8, 2025", status: "Accepted", budget: "$45–$60" },
    { id: "KS-2031", customer: "Sujatha Krishnan", city: "Houston, TX", item: "Bridal blouse – halter neck", date: "May 1, 2025", status: "In progress", budget: "$180–$220" },
    { id: "KS-2020", customer: "Meera Iyer", city: "Edison, NJ", item: "Pattu blouse – v-neck", date: "Apr 22, 2025", status: "Shipped", budget: "$65–$80" },
  ]);

  const statusColors = { "New request": [COLORS.goldLight, COLORS.gold], "Accepted": [COLORS.saffronLight, COLORS.saffron], "In progress": ["#E8F0FE", "#1a56db"], "Shipped": [COLORS.successLight, COLORS.success] };

  return (
    <div style={{ minHeight: "100vh", background: COLORS.cream, fontFamily: "Georgia, serif" }}>
      <nav style={{ background: "#fff", borderBottom: `1px solid ${COLORS.border}`, padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: COLORS.burgundy }}>KarunaStitch ✦ <span style={{ background: COLORS.burgundyLight, color: COLORS.burgundy, fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 600, marginLeft: 6 }}>Artisan</span></div>
        <div style={{ display: "flex", gap: 6 }}>
          {[["orders", "Orders"], ["profile", "My Profile"], ["earnings", "Earnings"]].map(([v, l]) => (
            <button key={v} onClick={() => setView(v)} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: view === v ? COLORS.saffronLight : "transparent", color: view === v ? COLORS.saffron : COLORS.textMuted, fontWeight: view === v ? 700 : 400, cursor: "pointer", fontSize: 14 }}>{l}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar initials={(user.name || "AK").slice(0, 2).toUpperCase()} size={32} />
          <span style={{ fontSize: 14, color: COLORS.text, fontWeight: 600 }}>{user.name || "Artisan"}</span>
          <button onClick={onLogout} style={{ padding: "6px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 6, background: "transparent", color: COLORS.textMuted, cursor: "pointer", fontSize: 13 }}>Sign out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px" }}>
        {view === "orders" && (
          <React.Fragment>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 32 }}>
              {[["4", "New requests"], ["12", "Active orders"], ["$1,840", "This month"], ["4.9 ★", "Your rating"]].map(([v, l]) => (
                <div key={l} style={{ background: "#fff", borderRadius: 12, padding: "18px 16px", border: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.saffron }}>{v}</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: 20, color: COLORS.burgundy, marginBottom: 16 }}>Order requests</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {requests.map(r => {
                const [sbg, sc] = statusColors[r.status] || ["#eee", "#555"];
                return (
                  <div key={r.id} style={{ background: "#fff", borderRadius: 12, border: `1px solid ${COLORS.border}`, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, color: COLORS.text }}>{r.item}</span>
                        <span style={{ background: sbg, color: sc, fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 20 }}>{r.status}</span>
                      </div>
                      <div style={{ fontSize: 13, color: COLORS.textMuted }}>{r.customer} · {r.city} · {r.id} · {r.date}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, color: COLORS.saffron, fontSize: 15 }}>{r.budget}</div>
                      {r.status === "New request" && (
                        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                          <button style={{ padding: "6px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 6, background: "transparent", cursor: "pointer", fontSize: 12, color: COLORS.textMuted }}>Decline</button>
                          <button style={{ padding: "6px 12px", border: "none", borderRadius: 6, background: COLORS.saffron, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>Accept</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </React.Fragment>
        )}

        {view === "profile" && (
          <div style={{ maxWidth: 560 }}>
            <h2 style={{ fontSize: 22, color: COLORS.burgundy, marginBottom: 24 }}>Your public profile</h2>
            <div style={{ background: "#fff", borderRadius: 14, padding: 28, border: `1px solid ${COLORS.border}` }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 24 }}>
                <Avatar initials={(user.name || "AK").slice(0, 2).toUpperCase()} size={64} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: COLORS.text }}>{user.name || "Your Name"}</div>
                  <div style={{ color: COLORS.textMuted, fontSize: 14 }}>{user.city || "Your city"} · {user.specialty || "Your specialty"}</div>
                </div>
              </div>
              {[["Display name", user.name || ""], ["City", user.city || ""], ["Specialty", user.specialty || ""], ["Bio", ""], ["Turnaround time", ""], ["Price range", ""]].map(([label, val]) => (
                <div key={label} style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textMuted, display: "block", marginBottom: 4 }}>{label}</label>
                  {label === "Bio" ? (
                    <textarea rows={3} defaultValue={val} style={{ width: "100%", padding: "9px 10px", border: `1px solid ${COLORS.border}`, borderRadius: 7, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", resize: "vertical" }} />
                  ) : (
                    <input defaultValue={val} style={{ width: "100%", padding: "9px 10px", border: `1px solid ${COLORS.border}`, borderRadius: 7, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" }} />
                  )}
                </div>
              ))}
              <button style={{ width: "100%", padding: "12px", background: COLORS.saffron, border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15, marginTop: 8 }}>Save profile</button>
            </div>
          </div>
        )}

        {view === "earnings" && (
          <div>
            <h2 style={{ fontSize: 22, color: COLORS.burgundy, marginBottom: 24 }}>Earnings overview</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
              {[["$1,840", "May 2025"], ["$6,240", "Last 3 months"], ["$22,100", "All time"], ["156", "Blouses made"]].map(([v, l]) => (
                <div key={l} style={{ background: "#fff", borderRadius: 12, padding: "20px", border: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.saffron }}>{v}</div>
                  <div style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#fff", borderRadius: 14, padding: 24, border: `1px solid ${COLORS.border}` }}>
              <h3 style={{ color: COLORS.burgundy, marginBottom: 16, fontSize: 17 }}>Recent payouts</h3>
              {[["May 12", "KS-2020 · Meera Iyer", "$72"], ["May 5", "KS-2011 · Ananya Pillai", "$95"], ["Apr 28", "KS-1998 · Bharati Menon", "$148"]].map(([date, item, amt]) => (
                <div key={item} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${COLORS.border}`, fontSize: 14 }}>
                  <span style={{ color: COLORS.textMuted, minWidth: 60 }}>{date}</span>
                  <span style={{ color: COLORS.text, flex: 1 }}>{item}</span>
                  <span style={{ fontWeight: 700, color: COLORS.success }}>{amt}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderConfirmation({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: COLORS.cream, fontFamily: "Georgia, serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 480, textAlign: "center", background: "#fff", padding: "48px 36px", borderRadius: 16, border: `1px solid ${COLORS.border}`, boxShadow: "0 10px 30px -10px rgba(107, 26, 46, 0.2)" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: COLORS.successLight, color: COLORS.success, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 20 }}>✓</div>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: COLORS.burgundy, fontSize: 32, margin: "0 0 8px", fontWeight: 600 }}>Order Placed</h1>
        <p style={{ color: COLORS.textMuted, fontSize: 15, lineHeight: 1.6, margin: "0 0 28px" }}>
          Thank you! We've received your details. An artisan will reach out within 24 hours to confirm fabric, design, and pricing.
        </p>
        <button onClick={onBack} style={{ padding: "12px 32px", background: COLORS.burgundy, color: "#fff", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>Back to home</button>
      </div>
    </div>
  );
}

function App() {
  const [screen, setScreen] = useState("landing");
  const [loginMode, setLoginMode] = useState("customer");
  const [postLoginIntent, setPostLoginIntent] = useState(null);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  // Detect Stripe Checkout return — persist the order, then show confirmation
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderStatus = params.get("order");
    if (orderStatus === "success") {
      try {
        const pending = JSON.parse(sessionStorage.getItem("karunastitch_pending_order") || "null");
        if (pending) {
          window.KS_recordEvent?.("order", {
            fullName: pending.fullName,
            email: pending.email,
            phone: pending.phone,
            street: pending.address?.street,
            city: pending.address?.city,
            state: pending.address?.state,
            zip: pending.address?.zip,
            blouseType: pending.blouseType,
            hookPosition: pending.hookPosition,
            design: pending.design?.type,
            deliveryDate: pending.deliveryDate,
            specialRequests: pending.specialRequests,
            amount: pending.amount,
            status: "paid",
          });
          sessionStorage.removeItem("karunastitch_pending_order");
        }
      } catch (err) { console.error(err); }
      setScreen("order-confirm");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (orderStatus === "canceled") {
      setScreen("order");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  if (screen === "landing") return <LandingPage onLogin={(m) => {
    if (m === "order-login") { setLoginMode("customer"); setPostLoginIntent("order"); setScreen("login"); return; }
    if (m === "order") { setScreen("order"); return; }
    if (m === "feedback") { setScreen("feedback"); return; }
    if (m === "artisan-apply") { setLoginMode("creator"); setPostLoginIntent("artisan-apply"); setScreen("login"); return; }
    setLoginMode(m); setPostLoginIntent(null); setScreen("login");
  }} />;
  if (screen === "order") {
    const OrderForm = window.BlouseOrderForm;
    return <OrderForm onBack={() => setScreen("landing")} onSubmit={() => setScreen("order-confirm")} user={user} />;
  }
  if (screen === "feedback") {
    const FB = window.FeedbackForm;
    return <FB onBack={() => setScreen("landing")} customerName={user?.name || ""} customerEmail={user?.email || ""} />;
  }
  if (screen === "artisan-apply") {
    const AF = window.ArtisanForm;
    return <AF onBack={() => setScreen("landing")} user={user} />;
  }
  if (screen === "order-confirm") return <OrderConfirmation onBack={() => setScreen("landing")} />;
  if (screen === "login") return <LoginPage mode={loginMode} onBack={() => setScreen("landing")} onSuccess={(r, u) => {
    setRole(r); setUser(u);
    if (r === "customer") {
      // Customers always land on the order/measurement page after login
      setPostLoginIntent(null);
      setScreen("order");
    } else if (postLoginIntent === "artisan-apply" && r === "creator") {
      setPostLoginIntent(null);
      setScreen("artisan-apply");
    } else {
      setScreen("app");
    }
  }} />;
  if (screen === "app") {
    const logout = () => { setScreen("landing"); setRole(null); setUser(null); };
    return role === "creator"
      ? <CreatorDashboard user={user} onLogout={logout} />
      : <CustomerDashboard user={user} onLogout={logout} />;
  }
  return null;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
