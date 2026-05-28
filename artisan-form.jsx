// Artisan registration / profile form

const AR_COLORS = {
  saffron: "#C8511B",
  saffronLight: "#F5E6DC",
  saffronDark: "#8B3512",
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
  success: "#1D6E3A",
  successLight: "#E6F4EC",
};

const AR_INPUT_STYLE = {
  width: "100%", padding: "10px 12px",
  border: `1px solid ${AR_COLORS.border}`, borderRadius: 8,
  fontSize: 14, fontFamily: "inherit", background: "#fff",
  outline: "none", boxSizing: "border-box", color: AR_COLORS.text,
};

const AR_LABEL_STYLE = {
  display: "block", fontSize: 13, fontWeight: 600,
  color: AR_COLORS.text, marginBottom: 6,
};

function ArSection({ title, number, last, children }) {
  return (
    <div style={{
      paddingBottom: last ? 0 : 24,
      marginBottom: last ? 0 : 24,
      borderBottom: last ? "none" : `1px solid ${AR_COLORS.borderSoft}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 26, height: 26, borderRadius: "50%",
          background: AR_COLORS.burgundy, color: "#fff",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, flexShrink: 0,
        }}>{number}</div>
        <div style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 18, fontWeight: 600, color: AR_COLORS.burgundy,
        }}>{title}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {children}
      </div>
    </div>
  );
}

function ArRow({ cols = 1, children }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: 12,
    }}>{children}</div>
  );
}

function ArField({ label, required, optional, sublabel, children }) {
  return (
    <div>
      <label style={AR_LABEL_STYLE}>
        {label}
        {required && <span style={{ color: AR_COLORS.saffron, marginLeft: 2 }}>*</span>}
        {optional && <span style={{ color: AR_COLORS.textMuted, fontWeight: 400, marginLeft: 4 }}>(optional)</span>}
      </label>
      {sublabel && (
        <div style={{ fontSize: 12, color: AR_COLORS.textMuted, marginTop: -3, marginBottom: 7 }}>{sublabel}</div>
      )}
      {children}
    </div>
  );
}

function ArCurrencyInput({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{
        position: "absolute", left: 12, top: "50%",
        transform: "translateY(-50%)",
        color: AR_COLORS.textMuted, fontSize: 14, fontWeight: 600,
        pointerEvents: "none",
      }}>₹</span>
      <input
        type="number" min="0" step="1"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...AR_INPUT_STYLE, paddingLeft: 26 }}
      />
    </div>
  );
}

function ArtisanForm({ onBack, user }) {
  const [form, setForm] = React.useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    street: "",
    city: user?.city || "",
    state: "",
    zip: "",
    yearsExperience: "",
    blousesDelivered: "",
    specialty: user?.specialty || "",
    references: "",
    rateSimple: "",
    rateDesign: "",
    bio: "",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState("");

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.street || !form.city || !form.yearsExperience || !form.rateSimple || !form.rateDesign) {
      setError("Please fill in all required fields (marked with *)");
      return;
    }
    setError("");
    setSubmitting(true);

    // Persist to backend (non-blocking)
    window.KS_recordEvent?.("user", {
      event: "artisan_application",
      name: form.name,
      email: form.email,
      role: "creator",
      city: form.city,
      specialty: `${form.specialty} | Exp: ${form.yearsExperience}y | Delivered: ~${form.blousesDelivered} | Simple: ₹${form.rateSimple} | Designer: ₹${form.rateDesign} | Refs: ${form.references} | Addr: ${form.street}, ${form.city}, ${form.state} ${form.zip}`,
    });

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 900);
  };

  return (
    <div style={{ minHeight: "100vh", background: AR_COLORS.bg, fontFamily: "Georgia, serif" }}>
      {/* Top bar */}
      <nav style={{
        background: "#fff", borderBottom: `1px solid ${AR_COLORS.border}`,
        padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", color: AR_COLORS.burgundy,
          cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "inherit",
        }}>← Back to home</button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, background: AR_COLORS.saffron, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>✦</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: AR_COLORS.burgundy, letterSpacing: "-0.02em" }}>KarunaStitch</span>
        </div>
        <div style={{ width: 120 }} />
      </nav>

      {/* Page header */}
      <div style={{ textAlign: "center", padding: "56px 24px 28px", maxWidth: 720, margin: "0 auto" }}>
        <div style={{
          display: "inline-block", padding: "6px 14px",
          background: AR_COLORS.saffronLight, color: AR_COLORS.saffronDark,
          borderRadius: 20, fontSize: 12, fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16,
        }}>Join Our Artisan Community</div>
        <h1 style={{
          fontSize: 44, lineHeight: 1.08, margin: "0 0 14px",
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: 600, color: AR_COLORS.burgundy,
          letterSpacing: "-0.01em",
        }}>Become a KarunaStitch Artisan</h1>
        <p style={{
          fontSize: 15, color: AR_COLORS.textMuted, margin: 0,
          lineHeight: 1.6, maxWidth: 540, marginLeft: "auto", marginRight: "auto",
        }}>
          Share a little about your craft, experience, and pricing so we can connect you with customers who'll love your work.
        </p>
      </div>

      {/* Form / success card */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 80px" }}>
        {submitted ? (
          <div style={{
            background: "#fff", borderRadius: 16,
            border: `1px solid ${AR_COLORS.border}`,
            boxShadow: "0 10px 30px -10px rgba(107, 26, 46, 0.18)",
            padding: "48px 32px", textAlign: "center",
          }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: AR_COLORS.successLight, color: AR_COLORS.success,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              fontSize: 36, marginBottom: 18,
            }}>✓</div>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 28, color: AR_COLORS.burgundy, margin: "0 0 10px", fontWeight: 600,
            }}>Application Received</h2>
            <p style={{ color: AR_COLORS.textMuted, fontSize: 15, lineHeight: 1.6, margin: "0 0 24px", maxWidth: 420, marginLeft: "auto", marginRight: "auto" }}>
              Thank you{form.name ? `, ${form.name.split(" ")[0]}` : ""}! We've received your details. Our team will review your application and get in touch within 3–5 business days.
            </p>
            <button onClick={onBack} style={{
              padding: "12px 32px", background: AR_COLORS.burgundy,
              color: "#fff", border: "none", borderRadius: 10,
              fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
            }}>Back to home</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{
            background: "#fff", borderRadius: 16,
            border: `1px solid ${AR_COLORS.border}`,
            boxShadow: "0 8px 24px -10px rgba(107, 26, 46, 0.18)",
            overflow: "hidden",
          }}>
            <div style={{
              padding: "22px 32px",
              background: `linear-gradient(135deg, ${AR_COLORS.burgundy} 0%, ${AR_COLORS.saffron} 100%)`,
              color: "#fff",
            }}>
              <div style={{
                fontSize: 22, fontWeight: 700,
                fontFamily: "'Playfair Display', Georgia, serif",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 7h-3V5a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                  <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
                Artisan Application
              </div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", marginTop: 4 }}>
                Tell us about you and your work.
              </div>
            </div>

            <div style={{ padding: "28px 32px" }}>
              {/* Section 1 — About You */}
              <ArSection title="About You" number="1">
                <ArRow>
                  <ArField label="Full name" required>
                    <input value={form.name} onChange={e => update("name", e.target.value)} placeholder="e.g. Meena Krishnamurthy" style={AR_INPUT_STYLE} />
                  </ArField>
                </ArRow>
                <ArRow cols={2}>
                  <ArField label="Email" optional>
                    <input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="you@example.com" style={AR_INPUT_STYLE} />
                  </ArField>
                  <ArField label="Phone / WhatsApp" optional>
                    <input value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="+91 98765 43210" style={AR_INPUT_STYLE} />
                  </ArField>
                </ArRow>
              </ArSection>

              {/* Section 2 — Address */}
              <ArSection title="Address" number="2">
                <ArRow>
                  <ArField label="Street / House number" required>
                    <input value={form.street} onChange={e => update("street", e.target.value)} placeholder="House no., street, area" style={AR_INPUT_STYLE} />
                  </ArField>
                </ArRow>
                <ArRow cols={3}>
                  <ArField label="City" required>
                    <input value={form.city} onChange={e => update("city", e.target.value)} placeholder="Bhubaneswar" style={AR_INPUT_STYLE} />
                  </ArField>
                  <ArField label="State" optional>
                    <input value={form.state} onChange={e => update("state", e.target.value)} placeholder="Odisha" style={AR_INPUT_STYLE} />
                  </ArField>
                  <ArField label="PIN code" optional>
                    <input value={form.zip} onChange={e => update("zip", e.target.value)} placeholder="751001" style={AR_INPUT_STYLE} />
                  </ArField>
                </ArRow>
              </ArSection>

              {/* Section 3 — Experience */}
              <ArSection title="Your Experience" number="3">
                <ArRow cols={2}>
                  <ArField label="Years of experience" required>
                    <input
                      type="number" min="0" step="1"
                      value={form.yearsExperience}
                      onChange={e => update("yearsExperience", e.target.value)}
                      placeholder="e.g. 8"
                      style={AR_INPUT_STYLE}
                    />
                  </ArField>
                  <ArField label="Blouses delivered (approx)" optional>
                    <input
                      type="number" min="0" step="1"
                      value={form.blousesDelivered}
                      onChange={e => update("blousesDelivered", e.target.value)}
                      placeholder="e.g. 250"
                      style={AR_INPUT_STYLE}
                    />
                  </ArField>
                </ArRow>
                <ArRow>
                  <ArField label="Specialty / style you're known for" optional>
                    <input
                      value={form.specialty}
                      onChange={e => update("specialty", e.target.value)}
                      placeholder="e.g. Kanjivaram, bridal heavy work, cotton casual…"
                      style={AR_INPUT_STYLE}
                    />
                  </ArField>
                </ArRow>
                <ArRow>
                  <ArField label="Customer references" optional sublabel="Names, contact details, or any past customers who can vouch for your work.">
                    <textarea
                      value={form.references}
                      onChange={e => update("references", e.target.value)}
                      placeholder={"Customer name — city — phone/email\nCustomer name — city — phone/email"}
                      rows={3}
                      style={{ ...AR_INPUT_STYLE, resize: "vertical" }}
                    />
                  </ArField>
                </ArRow>
              </ArSection>

              {/* Section 4 — Pricing */}
              <ArSection title="Your Pricing" number="4">
                <ArRow cols={2}>
                  <ArField label="Simple design blouse" required sublabel="Plain stitching, basic neck & sleeve">
                    <ArCurrencyInput
                      value={form.rateSimple}
                      onChange={v => update("rateSimple", v)}
                      placeholder="e.g. 500"
                    />
                  </ArField>
                  <ArField label="Designer blouse" required sublabel="Embroidery, embellishments, custom work">
                    <ArCurrencyInput
                      value={form.rateDesign}
                      onChange={v => update("rateDesign", v)}
                      placeholder="e.g. 1500"
                    />
                  </ArField>
                </ArRow>
                <div style={{
                  fontSize: 12.5, color: AR_COLORS.textMuted,
                  background: AR_COLORS.goldLight, padding: "10px 14px",
                  borderRadius: 8, lineHeight: 1.5,
                }}>
                  These are your base rates per blouse. You can always quote custom pricing for complex orders after reviewing the customer's brief.
                </div>
              </ArSection>

              {/* Section 5 — Bio */}
              <ArSection title="Short Bio" number="5" last>
                <ArRow>
                  <ArField label="Tell customers about yourself" optional sublabel="A short paragraph that will appear on your public profile.">
                    <textarea
                      value={form.bio}
                      onChange={e => update("bio", e.target.value)}
                      placeholder="I'm a third-generation blouse maker from…"
                      rows={3}
                      style={{ ...AR_INPUT_STYLE, resize: "vertical" }}
                    />
                  </ArField>
                </ArRow>
              </ArSection>

              {error && (
                <div style={{
                  marginTop: 8, padding: "10px 14px",
                  background: "#FEE2E2", border: "1px solid #FCA5A5",
                  borderRadius: 8, color: "#991B1B", fontSize: 13,
                }}>{error}</div>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: "100%",
                  marginTop: 24,
                  padding: "14px",
                  background: submitting ? AR_COLORS.textMuted : AR_COLORS.burgundy,
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
                    Submit Application
                    <span style={{ fontSize: 14 }}>✦</span>
                  </React.Fragment>
                )}
              </button>
              <div style={{ textAlign: "center", marginTop: 14, fontSize: 12.5, color: AR_COLORS.textMuted }}>
                By submitting, you agree to be contacted by our team for verification.
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

window.ArtisanForm = ArtisanForm;
