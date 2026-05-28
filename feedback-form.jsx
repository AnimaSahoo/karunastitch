// Feedback page — share-your-feedback form

const FB_COLORS = {
  saffron: "#C8511B",
  saffronLight: "#F5E6DC",
  gold: "#D4A017",
  goldLight: "#FBF3DC",
  burgundy: "#6B1A2E",
  burgundyDark: "#4A0F1F",
  burgundyLight: "#F5E6EC",
  cream: "#FDF8F3",
  bg: "#FFFCF8",
  text: "#1A0A0A",
  textMuted: "#6B5C52",
  border: "rgba(107, 26, 46, 0.18)",
  borderSoft: "rgba(107, 26, 46, 0.10)",
  starOn: "#F5A524",
  starOff: "#D6CFC8",
};

const RATING_LABELS = ["Click to rate", "Poor", "Fair", "Good", "Very Good", "Excellent"];

function Star({ filled, hovered, size = 36 }) {
  const color = filled || hovered ? FB_COLORS.starOn : FB_COLORS.starOff;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled || hovered ? color : "none"} stroke={color} strokeWidth="1.5" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function RatingField({ label, value, onChange }) {
  const [hovered, setHovered] = React.useState(0);
  const display = hovered || value;
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: FB_COLORS.text, marginBottom: 10 }}>{label}</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            style={{
              padding: 4, background: "transparent", border: "none",
              cursor: "pointer", borderRadius: 6,
              transform: hovered === star ? "scale(1.12)" : "scale(1)",
              transition: "transform 0.12s",
            }}
          >
            <Star filled={value >= star} hovered={hovered >= star && !value} />
          </button>
        ))}
      </div>
      <div style={{
        fontSize: 12, color: display > 0 ? FB_COLORS.saffron : FB_COLORS.textMuted,
        fontWeight: display > 0 ? 600 : 400,
        letterSpacing: display > 0 ? "0.02em" : 0,
      }}>{RATING_LABELS[display]}</div>
    </div>
  );
}

function FeedbackForm({ onBack, customerName = "", customerEmail = "", orderId = "" }) {
  const [overall, setOverall] = React.useState(0);
  const [fitting, setFitting] = React.useState(0);
  const [quality, setQuality] = React.useState(0);
  const [comments, setComments] = React.useState("");
  const [name, setName] = React.useState(customerName);
  const [email, setEmail] = React.useState(customerEmail);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (overall === 0 || fitting === 0 || quality === 0) {
      setError("Please provide all three ratings");
      return;
    }
    setError("");
    setSubmitting(true);

    // Record feedback to backend (non-blocking)
    window.KS_recordEvent?.("feedback", {
      name,
      email,
      rating: `Overall ${overall}/5, Fitting ${fitting}/5, Quality ${quality}/5`,
      category: orderId || "general",
      message: comments,
    });

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 900);
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px",
    border: `1px solid ${FB_COLORS.border}`, borderRadius: 8,
    fontSize: 14, fontFamily: "inherit", background: "#fff",
    outline: "none", boxSizing: "border-box", color: FB_COLORS.text,
  };

  return (
    <div style={{ minHeight: "100vh", background: FB_COLORS.bg, fontFamily: "Georgia, serif" }}>
      {/* Top bar */}
      <nav style={{
        background: "#fff", borderBottom: `1px solid ${FB_COLORS.border}`,
        padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", color: FB_COLORS.burgundy,
          cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "inherit",
        }}>← Back to home</button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, background: FB_COLORS.saffron, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>✦</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: FB_COLORS.burgundy, letterSpacing: "-0.02em" }}>KarunaStitch</span>
        </div>
        <div style={{ width: 120 }} />
      </nav>

      {/* Page header */}
      <div style={{ textAlign: "center", padding: "64px 24px 36px", maxWidth: 720, margin: "0 auto" }}>
        <h1 style={{
          fontSize: 44, lineHeight: 1.08, margin: "0 0 14px",
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: 600, color: FB_COLORS.burgundy,
          letterSpacing: "-0.01em",
        }}>We'd Love Your Feedback</h1>
        <p style={{
          fontSize: 15, color: FB_COLORS.textMuted, margin: 0,
          lineHeight: 1.6, maxWidth: 520, marginLeft: "auto", marginRight: "auto",
        }}>
          Your feedback truly matters to us. It helps us refine our craft and create blouses you'll love even more.
        </p>
      </div>

      {/* Form / success card */}
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px 80px" }}>
        {submitted ? (
          <div style={{
            background: "#fff", borderRadius: 16,
            border: `1px solid ${FB_COLORS.border}`,
            boxShadow: "0 10px 30px -10px rgba(107, 26, 46, 0.18)",
            padding: "48px 32px", textAlign: "center",
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: FB_COLORS.goldLight,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              marginBottom: 18,
            }}>
              <Star filled size={36} />
            </div>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 28, color: FB_COLORS.burgundy, margin: "0 0 10px", fontWeight: 600,
            }}>Thank You!</h2>
            <p style={{ color: FB_COLORS.textMuted, fontSize: 15, lineHeight: 1.6, margin: "0 0 24px", maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
              Your feedback helps us improve our services and provide you with the best experience.
            </p>
            <button onClick={onBack} style={{
              padding: "12px 32px", background: FB_COLORS.burgundy,
              color: "#fff", border: "none", borderRadius: 10,
              fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
            }}>Back to home</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{
            background: "#fff", borderRadius: 16,
            border: `1px solid ${FB_COLORS.border}`,
            boxShadow: "0 8px 24px -10px rgba(107, 26, 46, 0.18)",
            overflow: "hidden",
          }}>
            <div style={{
              padding: "22px 32px",
              background: `linear-gradient(135deg, ${FB_COLORS.burgundy} 0%, ${FB_COLORS.saffron} 100%)`,
              color: "#fff",
            }}>
              <div style={{
                fontSize: 22, fontWeight: 700,
                fontFamily: "'Playfair Display', Georgia, serif",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Share Your Feedback
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", marginTop: 4 }}>
                We value your opinion! Help us serve you better.
              </div>
            </div>

            <div style={{ padding: "28px 32px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                <RatingField
                  label="1. How do you rate the overall experience?"
                  value={overall}
                  onChange={setOverall}
                />
                <RatingField
                  label="2. How do you rate the fitting?"
                  value={fitting}
                  onChange={setFitting}
                />
                <RatingField
                  label="3. How do you rate the quality of work?"
                  value={quality}
                  onChange={setQuality}
                />
              </div>

              {error && (
                <div style={{
                  marginTop: 20, padding: "10px 14px",
                  background: "#FEE2E2", border: "1px solid #FCA5A5",
                  borderRadius: 8, color: "#991B1B", fontSize: 13,
                }}>{error}</div>
              )}

              <div style={{
                paddingTop: 24, marginTop: 28,
                borderTop: `1px solid ${FB_COLORS.borderSoft}`,
              }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: FB_COLORS.text, marginBottom: 6 }}>
                    Additional Comments <span style={{ color: FB_COLORS.textMuted, fontWeight: 400 }}>(optional)</span>
                  </label>
                  <textarea
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                    placeholder="Share any additional thoughts about your blouse, the artisan, or the process…"
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>

                {!customerName && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: FB_COLORS.text, marginBottom: 6 }}>
                        Your Name <span style={{ color: FB_COLORS.textMuted, fontWeight: 400 }}>(optional)</span>
                      </label>
                      <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: FB_COLORS.text, marginBottom: 6 }}>
                        Email <span style={{ color: FB_COLORS.textMuted, fontWeight: 400 }}>(optional)</span>
                      </label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  marginTop: 28,
                  padding: "14px",
                  background: submitting ? FB_COLORS.textMuted : FB_COLORS.burgundy,
                  border: "none", borderRadius: 10, color: "#fff",
                  fontWeight: 700, fontSize: 15,
                  cursor: submitting ? "wait" : "pointer",
                  fontFamily: "'Playfair Display', Georgia, serif",
                  letterSpacing: "0.02em",
                  display: "inline-flex",
                  alignItems: "center", justifyContent: "center", gap: 10,
                  transition: "all 0.15s",
                }}
              >
                {submitting ? "Submitting…" : (
                  <React.Fragment>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 2 11 13" />
                      <path d="M22 2 15 22l-4-9-9-4 20-7z" />
                    </svg>
                    Submit Feedback
                  </React.Fragment>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

window.FeedbackForm = FeedbackForm;
