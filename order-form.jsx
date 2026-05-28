// BlouseOrderForm - place-your-order page with measurement form

// ────────────────────────────────────────────────────────────────────────
// STRIPE CHECKOUT CONFIG — Stripe-hosted checkout page, no backend needed
// ────────────────────────────────────────────────────────────────────────
// SETUP STEPS:
// 1. Get your Publishable Key from https://dashboard.stripe.com/apikeys
// 2. Enable "Client-only integration" in dashboard:
//    https://dashboard.stripe.com/account/checkout/settings → toggle on
// 3. Create 3 Products with Prices in https://dashboard.stripe.com/products:
//      • "Custom Blouse Stitching"  → $25 USD  → copy Price ID (price_xxx)
//      • "US Shipping"              → $8 USD   → copy Price ID
//      • "Extra Cloths / Laces"     → $5 USD   → copy Price ID
// 4. Paste the Price IDs below.
// 5. Set the success/cancel URLs to where your site lives.
//
// Currently using Stripe TEST key — use card 4242 4242 4242 4242 to test.
const STRIPE_PUBLISHABLE_KEY = "pk_test_TYooMQauvdEDq54NiTphI7jx";
const STRIPE_PRICE_IDS = {
  stitching: "price_REPLACE_WITH_YOUR_STITCHING_PRICE_ID",
  shipping: "price_REPLACE_WITH_YOUR_SHIPPING_PRICE_ID",
  extraMaterials: "price_REPLACE_WITH_YOUR_EXTRAS_PRICE_ID",
};
const CHECKOUT_SUCCESS_URL = window.location.origin + window.location.pathname + "?order=success";
const CHECKOUT_CANCEL_URL = window.location.origin + window.location.pathname + "?order=canceled";

// Pricing (display only — actual charges come from Stripe Price IDs above)
const PRICING = {
  stitching: 25,
  shipping: 8,
  extraMaterials: 5,
};

const ORDER_COLORS = {
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
  danger: "#B91C1C",
};

const SAMPLE_DESIGNS = [
  { id: "collar", name: "Collar Neck", desc: "Shirt-style", swatch: "linear-gradient(135deg, #E85A8A 0%, #C8511B 100%)" },
  { id: "boat", name: "Boat Neck", desc: "Wide horizontal", swatch: "linear-gradient(135deg, #6B1A2E 0%, #C8511B 100%)" },
  { id: "window", name: "Window Design", desc: "Elegant cutout", swatch: "linear-gradient(135deg, #D4A017 0%, #8B3512 100%)" },
  { id: "pata", name: "Pata Saree Design", desc: "Traditional Odia", swatch: "linear-gradient(135deg, #A8264D 0%, #4A0F1F 100%)" },
];

const FRONT_MEAS = [
  { id: "shoulder", n: 1, label: "Shoulder" },
  { id: "shoulderFullLength", n: 2, label: "Shoulder Full Length" },
  { id: "frontNeckDepth", n: 3, label: "Front Neck Depth" },
  { id: "chest", n: 4, label: "Chest (around)" },
  { id: "waist", n: 5, label: "Waist (around)" },
];
const BACK_MEAS = [
  { id: "backNeckDepth", n: 6, label: "Back Neck Depth" },
  { id: "blouseLength", n: 7, label: "Blouse Length" },
  { id: "sleeveLength", n: 8, label: "Sleeve Length" },
  { id: "sleeveRound", n: 9, label: "Sleeve (around)" },
  { id: "armHole", n: 10, label: "Armhole (around)" },
];

// Reusable card with elegant gold-tinted border
function SectionCard({ children, headerBg, icon, title, accent = ORDER_COLORS.burgundy }) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 14,
      border: `1px solid ${ORDER_COLORS.border}`,
      boxShadow: "0 4px 14px -8px rgba(107, 26, 46, 0.18)",
      overflow: "hidden",
      marginBottom: 24,
    }}>
      <div style={{
        background: headerBg || "transparent",
        padding: headerBg ? "18px 28px" : "22px 28px 4px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        borderBottom: headerBg ? "none" : `1px solid ${ORDER_COLORS.borderSoft}`,
      }}>
        {icon && <span style={{ color: headerBg ? "#fff" : accent, fontSize: 18 }}>{icon}</span>}
        <h3 style={{
          margin: 0,
          fontSize: 17,
          fontWeight: 700,
          color: headerBg ? "#fff" : accent,
          fontFamily: "'Playfair Display', Georgia, serif",
          letterSpacing: "0.01em",
        }}>{title}</h3>
      </div>
      <div style={{ padding: "24px 28px" }}>{children}</div>
    </div>
  );
}

function Field({ label, required, error, children, hint }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: ORDER_COLORS.text, marginBottom: 6 }}>
        {label}{required && <span style={{ color: ORDER_COLORS.saffron, marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && !error && <div style={{ fontSize: 12, color: ORDER_COLORS.textMuted, marginTop: 4 }}>{hint}</div>}
      {error && <div style={{ fontSize: 12, color: ORDER_COLORS.danger, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: `1px solid ${ORDER_COLORS.border}`,
  borderRadius: 8,
  fontSize: 14,
  fontFamily: "inherit",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
  color: ORDER_COLORS.text,
};

function TextInput({ value, onChange, placeholder, type = "text", error }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ ...inputStyle, borderColor: error ? ORDER_COLORS.danger : ORDER_COLORS.border }}
    />
  );
}

function NumberInput({ value, onChange, placeholder = "inches" }) {
  return (
    <div style={{ position: "relative" }}>
      <input
        type="number"
        step="0.25"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...inputStyle, paddingRight: 48 }}
      />
      <span style={{
        position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
        fontSize: 11, color: ORDER_COLORS.textMuted, fontWeight: 600,
        letterSpacing: "0.05em", textTransform: "uppercase", pointerEvents: "none",
      }}>in</span>
    </div>
  );
}

function Radio({ checked, onChange, label, name, value }) {
  return (
    <label style={{
      display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
      padding: "8px 12px",
      borderRadius: 8,
      background: checked ? ORDER_COLORS.burgundyLight : "transparent",
      border: `1px solid ${checked ? ORDER_COLORS.burgundy : ORDER_COLORS.border}`,
      transition: "all 0.15s",
      fontSize: 14,
      fontWeight: checked ? 600 : 500,
      color: checked ? ORDER_COLORS.burgundy : ORDER_COLORS.text,
    }}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        style={{ accentColor: ORDER_COLORS.burgundy, margin: 0 }}
      />
      {label}
    </label>
  );
}

// Measurement guide — provided diagram image
function MeasurementGuide() {
  return (
    <img
      src="assets/measurement-guide.png"
      alt="Blouse measurement guide showing front and back views with numbered measurement points 1 through 10"
      style={{ maxWidth: 360, width: "100%", height: "auto", display: "block" }}
    />
  );
}

const MEAS_FIELDS = ["shoulder", "shoulderFullLength", "frontNeckDepth", "chest", "waist", "backNeckDepth", "blouseLength", "sleeveLength", "sleeveRound", "armHole"];
const MEAS_STORAGE_KEY = "karunastitch_saved_measurements";

function loadSavedMeasurements() {
  try {
    const raw = localStorage.getItem(MEAS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

// ────────────────────────────────────────────────────────────────────────
// Stripe Checkout Summary — shown in Payment section
// ────────────────────────────────────────────────────────────────────────
function StripeCheckoutSummary({ amount, paymentStatus }) {
  const isUnconfigured = STRIPE_PRICE_IDS.stitching.startsWith("price_REPLACE");
  const isTestKey = STRIPE_PUBLISHABLE_KEY.startsWith("pk_test_");

  return (
    <div>
      {/* Order summary */}
      <div style={{
        background: ORDER_COLORS.cream,
        border: `1px solid ${ORDER_COLORS.borderSoft}`,
        borderRadius: 10,
        padding: "18px 22px",
        marginBottom: 18,
      }}>
        <div style={{
          fontSize: 12, fontWeight: 700, color: ORDER_COLORS.textMuted,
          letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12,
        }}>Order Summary</div>
        {amount.lineItems.map(([label, val]) => (
          <div key={label} style={{
            display: "flex", justifyContent: "space-between",
            fontSize: 14, padding: "6px 0", color: ORDER_COLORS.textMuted,
          }}>
            <span>{label}</span>
            <span style={{ color: ORDER_COLORS.text, fontWeight: 500 }}>${val.toFixed(2)}</span>
          </div>
        ))}
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 17, fontWeight: 700, paddingTop: 12, marginTop: 10,
          borderTop: `1px solid ${ORDER_COLORS.borderSoft}`, color: ORDER_COLORS.burgundy,
        }}>
          <span>Total</span>
          <span>${amount.total.toFixed(2)} USD</span>
        </div>
      </div>

      {/* Checkout explainer */}
      <div style={{
        display: "flex", gap: 14,
        padding: "16px 18px",
        background: "#fff",
        border: `1px solid ${ORDER_COLORS.border}`,
        borderRadius: 10,
        marginBottom: 12,
      }}>
        <div style={{
          flexShrink: 0, width: 40, height: 40, borderRadius: 10,
          background: "#635BFF", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 700,
        }}>S</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14.5, color: ORDER_COLORS.text, marginBottom: 4 }}>
            Secure Checkout with Stripe
          </div>
          <div style={{ fontSize: 13, color: ORDER_COLORS.textMuted, lineHeight: 1.55 }}>
            When you place your order, you'll be taken to Stripe's secure payment page to
            enter your card details. After payment, you'll come right back here for confirmation.
          </div>
        </div>
      </div>

      {/* Config / test warnings */}
      {isUnconfigured && (
        <div style={{
          padding: "10px 14px",
          background: ORDER_COLORS.goldLight,
          border: `1px solid ${ORDER_COLORS.gold}`,
          borderRadius: 8,
          fontSize: 12.5,
          color: ORDER_COLORS.saffronDark,
          marginBottom: 12,
        }}>
          <strong>⚙️ Setup needed:</strong> Add your Stripe Price IDs in <code style={{ background: "#fff", padding: "1px 5px", borderRadius: 3, fontSize: 11.5 }}>order-form.jsx</code> (top of file) to enable real checkout. Until then, clicking "Pay" will show a setup error.
        </div>
      )}
      {!isUnconfigured && isTestKey && (
        <div style={{
          padding: "10px 14px",
          background: ORDER_COLORS.goldLight,
          border: `1px solid ${ORDER_COLORS.gold}`,
          borderRadius: 8,
          fontSize: 12.5,
          color: ORDER_COLORS.saffronDark,
          marginBottom: 12,
        }}>
          <strong>🧪 Test mode:</strong> Use card <code>4242 4242 4242 4242</code>, any future date, any CVC.
        </div>
      )}

      {paymentStatus?.error && (
        <div style={{
          padding: "10px 14px",
          background: "#FEF2F2",
          border: `1px solid ${ORDER_COLORS.danger}`,
          borderRadius: 8,
          fontSize: 13,
          color: ORDER_COLORS.danger,
          marginBottom: 12,
        }}>
          {paymentStatus.error}
        </div>
      )}

      {/* Security footer */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 14,
        fontSize: 11.5, color: ORDER_COLORS.textMuted,
        flexWrap: "wrap", marginTop: 6,
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          256-bit SSL Encrypted
        </span>
        <span style={{ color: ORDER_COLORS.borderSoft }}>·</span>
        <span>Powered by <strong style={{ color: "#635BFF" }}>Stripe</strong></span>
        <span style={{ color: ORDER_COLORS.borderSoft }}>·</span>
        <span>We never see or store your card</span>
      </div>
    </div>
  );
}

function BlouseOrderForm({ onBack, onSubmit, user }) {
  const [form, setForm] = React.useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    street: "", city: "", state: "", zip: "", country: "USA",
    shoulder: "", shoulderFullLength: "", frontNeckDepth: "", chest: "", waist: "",
    backNeckDepth: "", blouseLength: "", sleeveLength: "", sleeveRound: "", armHole: "",
    blouseType: "standard",
    hookPosition: "back-hook",
    deliveryDate: "",
    extraClothsLaces: "no",
    wantMeasurementHelp: false,
    isCustomItem: true,
    agreedToTerms: false,
    specialRequests: "",
  });
  const [saved, setSaved] = React.useState(() => loadSavedMeasurements());
  const [savedToast, setSavedToast] = React.useState("");

  const saveMeasurements = () => {
    const data = {};
    MEAS_FIELDS.forEach(k => { data[k] = form[k]; });
    data.blouseType = form.blouseType;
    data.hookPosition = form.hookPosition;
    data.savedAt = new Date().toISOString();
    try {
      localStorage.setItem(MEAS_STORAGE_KEY, JSON.stringify(data));
      setSaved(data);
      setSavedToast("Measurements saved");
      setTimeout(() => setSavedToast(""), 2200);
    } catch {
      setSavedToast("Could not save — storage unavailable");
      setTimeout(() => setSavedToast(""), 2200);
    }
  };

  const loadMeasurements = () => {
    if (!saved) return;
    setForm(f => {
      const next = { ...f };
      MEAS_FIELDS.forEach(k => { if (saved[k] !== undefined) next[k] = saved[k]; });
      if (saved.blouseType) next.blouseType = saved.blouseType;
      if (saved.hookPosition) next.hookPosition = saved.hookPosition;
      return next;
    });
    setSavedToast("Measurements loaded");
    setTimeout(() => setSavedToast(""), 2000);
  };

  const clearSaved = () => {
    try { localStorage.removeItem(MEAS_STORAGE_KEY); } catch {}
    setSaved(null);
    setSavedToast("Saved measurements cleared");
    setTimeout(() => setSavedToast(""), 2000);
  };
  const [selectedDesign, setSelectedDesign] = React.useState(null);
  const [designTab, setDesignTab] = React.useState("sample");
  const [referenceFile, setReferenceFile] = React.useState(null);
  const [designNotes, setDesignNotes] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);
  const [paymentStatus, setPaymentStatus] = React.useState({ error: "" });

  // Live order total
  const amount = React.useMemo(() => {
    const items = [
      ["Custom stitching", PRICING.stitching],
      ["Shipping (US delivery)", PRICING.shipping],
    ];
    if (form.extraClothsLaces === "yes") items.push(["Extra cloths / laces", PRICING.extraMaterials]);
    return { lineItems: items, total: items.reduce((s, [, v]) => s + v, 0) };
  }, [form.extraClothsLaces]);

  const upd = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.phone.trim()) errs.phone = "Phone is required";
    if (!form.street.trim()) errs.street = "Street is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.state.trim()) errs.state = "State is required";
    if (!form.zip.trim()) errs.zip = "ZIP is required";
    if (!selectedDesign && !referenceFile && designTab === "sample") errs.design = "Please select a design";
    if (!form.isCustomItem) errs.isCustomItem = "Please acknowledge this is a custom item";
    if (!form.agreedToTerms) errs.agreedToTerms = "Please read and accept the User Agreement to continue";
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Check Stripe is loaded and configured
    if (!window.Stripe) {
      setPaymentStatus({ error: "Payment system is still loading. Please wait a moment and try again." });
      return;
    }
    if (STRIPE_PRICE_IDS.stitching.startsWith("price_REPLACE")) {
      setPaymentStatus({ error: "Checkout is not yet configured. The site owner needs to add Stripe Price IDs in order-form.jsx." });
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    setPaymentStatus({ error: "" });

    // Save order details so we can show confirmation on return from Stripe
    try {
      sessionStorage.setItem("karunastitch_pending_order", JSON.stringify({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        address: { street: form.street, city: form.city, state: form.state, zip: form.zip, country: form.country },
        design: { type: selectedDesign, notes: designNotes, tab: designTab },
        blouseType: form.blouseType,
        hookPosition: form.hookPosition,
        deliveryDate: form.deliveryDate,
        specialRequests: form.specialRequests,
        amount: amount.total,
        placedAt: new Date().toISOString(),
      }));
    } catch {}

    // Build line items for Stripe Checkout
    const lineItems = [
      { price: STRIPE_PRICE_IDS.stitching, quantity: 1 },
      { price: STRIPE_PRICE_IDS.shipping, quantity: 1 },
    ];
    if (form.extraClothsLaces === "yes") {
      lineItems.push({ price: STRIPE_PRICE_IDS.extraMaterials, quantity: 1 });
    }

    try {
      const stripe = window.Stripe(STRIPE_PUBLISHABLE_KEY);
      const { error } = await stripe.redirectToCheckout({
        lineItems,
        mode: "payment",
        successUrl: CHECKOUT_SUCCESS_URL,
        cancelUrl: CHECKOUT_CANCEL_URL,
        customerEmail: form.email || undefined,
        shippingAddressCollection: { allowedCountries: ["US"] },
        billingAddressCollection: "auto",
      });
      // If redirectToCheckout returns, an error occurred (otherwise the page navigates away)
      if (error) {
        setPaymentStatus({ error: error.message });
        setSubmitting(false);
      }
    } catch (err) {
      setPaymentStatus({ error: err.message || "Could not connect to Stripe. Please try again." });
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: ORDER_COLORS.bg, fontFamily: "Georgia, serif" }}>
      {/* Top bar */}
      <nav style={{
        background: "#fff", borderBottom: `1px solid ${ORDER_COLORS.border}`,
        padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", color: ORDER_COLORS.burgundy,
          cursor: "pointer", fontSize: 14, fontWeight: 600, fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: 6,
        }}>← Back to home</button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, background: ORDER_COLORS.saffron, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14,
          }}>✦</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: ORDER_COLORS.burgundy, letterSpacing: "-0.02em" }}>KarunaStitch</span>
        </div>
        <div style={{ width: 120 }} />
      </nav>

      {/* Hero header */}
      <div style={{ textAlign: "center", padding: "56px 24px 32px", maxWidth: 760, margin: "0 auto" }}>
        <h1 style={{
          fontSize: 44, lineHeight: 1.08, margin: "0 0 12px",
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: 700,
          color: ORDER_COLORS.text,
          letterSpacing: "-0.01em",
        }}>Start Your Order</h1>
        <p style={{
          fontSize: 22, lineHeight: 1.4, margin: "0 0 18px",
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: 500,
          color: ORDER_COLORS.burgundy,
        }}>Create Your Masterpiece</p>
        <p style={{ fontSize: 15, color: ORDER_COLORS.textMuted, margin: 0, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
          Fill in your details and choose your design — every blouse is hand-stitched to your exact measurements.
        </p>
      </div>

      {/* Form body */}
      <form onSubmit={handleSubmit} style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Customer info */}
        <SectionCard
          title="Customer Information"
          icon="👤"
          headerBg={`linear-gradient(135deg, ${ORDER_COLORS.burgundy} 0%, ${ORDER_COLORS.burgundyDark} 100%)`}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <Field label="Full Name" required error={errors.fullName}>
              <TextInput value={form.fullName} onChange={v => upd("fullName", v)} placeholder="Enter your full name" error={errors.fullName} />
            </Field>
            <Field label="Phone Number" required error={errors.phone}>
              <TextInput value={form.phone} onChange={v => upd("phone", v)} placeholder="+1 (555) 000-0000" error={errors.phone} />
            </Field>
          </div>
          <Field label="Email Address">
            <TextInput type="email" value={form.email} onChange={v => upd("email", v)} placeholder="your@email.com" />
          </Field>
        </SectionCard>

        {/* Shipping address */}
        <SectionCard
          title="Shipping Address"
          icon="📍"
          headerBg={`linear-gradient(135deg, ${ORDER_COLORS.gold} 0%, ${ORDER_COLORS.saffron} 100%)`}
        >
          <Field label="Street Address" required error={errors.street}>
            <textarea
              value={form.street}
              onChange={e => upd("street", e.target.value)}
              placeholder="House/Apt number, Street name"
              rows={2}
              style={{ ...inputStyle, resize: "vertical", borderColor: errors.street ? ORDER_COLORS.danger : ORDER_COLORS.border }}
            />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 12, marginTop: 16 }}>
            <Field label="City" required error={errors.city}>
              <TextInput value={form.city} onChange={v => upd("city", v)} placeholder="City" error={errors.city} />
            </Field>
            <Field label="State" required error={errors.state}>
              <TextInput value={form.state} onChange={v => upd("state", v)} placeholder="State" error={errors.state} />
            </Field>
            <Field label="ZIP" required error={errors.zip}>
              <TextInput value={form.zip} onChange={v => upd("zip", v)} placeholder="00000" error={errors.zip} />
            </Field>
            <Field label="Country">
              <TextInput value={form.country} onChange={v => upd("country", v)} />
            </Field>
          </div>
        </SectionCard>

        {/* Blouse design */}
        <SectionCard title="Blouse Design" icon="🎨" accent={ORDER_COLORS.burgundy}>
          {/* Tab pills */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6,
            padding: 4, background: ORDER_COLORS.cream, borderRadius: 10, marginBottom: 20,
          }}>
            {[["sample", "Sample Designs"], ["sketch", "Sketch Design"], ["reference", "Upload Reference"]].map(([t, l]) => (
              <button key={t} type="button" onClick={() => setDesignTab(t)} style={{
                padding: "9px 12px",
                border: "none",
                borderRadius: 7,
                background: designTab === t ? "#fff" : "transparent",
                color: designTab === t ? ORDER_COLORS.burgundy : ORDER_COLORS.textMuted,
                fontWeight: designTab === t ? 700 : 500,
                fontSize: 13.5,
                fontFamily: "inherit",
                cursor: "pointer",
                boxShadow: designTab === t ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                transition: "all 0.15s",
              }}>{l}</button>
            ))}
          </div>

          {designTab === "sample" && (
            <div>
              <p style={{ fontSize: 13, color: ORDER_COLORS.textMuted, marginTop: 0, marginBottom: 16 }}>Choose from our popular blouse styles</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                {SAMPLE_DESIGNS.map(d => {
                  const sel = selectedDesign === d.id;
                  return (
                    <button key={d.id} type="button" onClick={() => setSelectedDesign(d.id)} style={{
                      padding: 10,
                      border: `2px solid ${sel ? ORDER_COLORS.burgundy : ORDER_COLORS.border}`,
                      background: sel ? ORDER_COLORS.burgundyLight : "#fff",
                      borderRadius: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textAlign: "center",
                      transition: "all 0.15s",
                      position: "relative",
                    }}>
                      <div style={{
                        aspectRatio: "3/4",
                        marginBottom: 10,
                        borderRadius: 8,
                        background: ORDER_COLORS.cream,
                        border: `1px dashed ${ORDER_COLORS.border}`,
                        position: "relative",
                        overflow: "hidden",
                      }} />
                      <div style={{ fontWeight: 700, fontSize: 13, color: ORDER_COLORS.text, marginBottom: 2 }}>{d.name}</div>
                      <div style={{ fontSize: 11, color: ORDER_COLORS.textMuted }}>{d.desc}</div>
                      {sel && (
                        <div style={{
                          position: "absolute", top: 8, right: 8,
                          width: 22, height: 22, borderRadius: "50%",
                          background: ORDER_COLORS.burgundy, color: "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 12, fontWeight: 700,
                        }}>✓</div>
                      )}
                    </button>
                  );
                })}
              </div>
              {errors.design && <div style={{ fontSize: 12, color: ORDER_COLORS.danger, marginTop: 12 }}>{errors.design}</div>}
            </div>
          )}

          {designTab === "sketch" && (
            <div>
              <p style={{ fontSize: 13, color: ORDER_COLORS.textMuted, marginTop: 0, marginBottom: 16 }}>
                Draw your custom blouse design on the canvas below
              </p>
              <div style={{
                aspectRatio: "16/9",
                background: `repeating-linear-gradient(45deg, ${ORDER_COLORS.cream} 0 8px, #fff 8px 16px)`,
                border: `2px dashed ${ORDER_COLORS.border}`,
                borderRadius: 10,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                color: ORDER_COLORS.textMuted,
                gap: 8,
              }}>
                <span style={{ fontSize: 32 }}>✏️</span>
                <div style={{ fontWeight: 600, color: ORDER_COLORS.text }}>Sketch canvas</div>
                <div style={{ fontSize: 12 }}>Draw your design ideas — neckline, sleeves, embroidery</div>
              </div>
              <div style={{ marginTop: 14 }}>
                <Field label="Additional Notes (Optional)">
                  <textarea
                    value={designNotes}
                    onChange={e => setDesignNotes(e.target.value)}
                    placeholder="Add any details about neckline, sleeves, back design, embroidery patterns..."
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </Field>
              </div>
            </div>
          )}

          {designTab === "reference" && (
            <div>
              <p style={{ fontSize: 13, color: ORDER_COLORS.textMuted, marginTop: 0, marginBottom: 16 }}>
                Upload an inspiration image (Pinterest, Instagram, or your own sketch)
              </p>
              <label style={{
                display: "block",
                border: `2px dashed ${ORDER_COLORS.border}`,
                borderRadius: 10, padding: "40px 20px",
                textAlign: "center", cursor: "pointer",
                background: ORDER_COLORS.cream,
              }}>
                <input type="file" accept="image/*" onChange={e => setReferenceFile(e.target.files?.[0])} style={{ display: "none" }} />
                <div style={{ fontSize: 32, marginBottom: 8 }}>🖼️</div>
                <div style={{ fontWeight: 600, color: ORDER_COLORS.text }}>{referenceFile ? referenceFile.name : "Upload reference image"}</div>
                <div style={{ fontSize: 12, color: ORDER_COLORS.textMuted, marginTop: 4 }}>Show us what style you're looking for</div>
              </label>
            </div>
          )}
        </SectionCard>

        {/* Measurements */}
        <SectionCard title="Measurements (in inches)" icon="📏" accent={ORDER_COLORS.burgundy}>
          {/* Saved measurements banner */}
          {saved && (
            <div style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 18px",
              background: ORDER_COLORS.cream,
              border: `1px solid ${ORDER_COLORS.gold}`,
              borderRadius: 10,
              marginBottom: 24,
              flexWrap: "wrap",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: ORDER_COLORS.goldLight,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, flexShrink: 0,
              }}>📐</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: ORDER_COLORS.text }}>Saved measurements available</div>
                <div style={{ fontSize: 12, color: ORDER_COLORS.textMuted, marginTop: 2 }}>
                  Last saved {new Date(saved.savedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={loadMeasurements} style={{
                  padding: "8px 16px", background: ORDER_COLORS.burgundy,
                  color: "#fff", border: "none", borderRadius: 8,
                  fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                }}>Load &amp; edit</button>
                <button type="button" onClick={clearSaved} style={{
                  padding: "8px 14px", background: "transparent",
                  color: ORDER_COLORS.textMuted, border: `1px solid ${ORDER_COLORS.border}`,
                  borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                }}>Clear</button>
              </div>
            </div>
          )}

          {/* Blouse options */}
          <div style={{ paddingBottom: 24, borderBottom: `1px solid ${ORDER_COLORS.borderSoft}`, marginBottom: 24 }}>
            <h4 style={{
              fontSize: 14, fontWeight: 700, color: ORDER_COLORS.text,
              margin: "0 0 16px", letterSpacing: "0.04em", textTransform: "uppercase",
            }}>Blouse Options</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
              <div>
                <Field label="Blouse Type">
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Radio name="bt" value="princess-cut" checked={form.blouseType === "princess-cut"}
                      onChange={() => upd("blouseType", "princess-cut")} label="Princess Cut" />
                    <Radio name="bt" value="standard" checked={form.blouseType === "standard"}
                      onChange={() => upd("blouseType", "standard")} label="Standard" />
                  </div>
                </Field>
              </div>
              <div>
                <Field label="Hook Position">
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <Radio name="hp" value="front-hook" checked={form.hookPosition === "front-hook"}
                      onChange={() => upd("hookPosition", "front-hook")} label="Front Hook" />
                    <Radio name="hp" value="back-hook" checked={form.hookPosition === "back-hook"}
                      onChange={() => upd("hookPosition", "back-hook")} label="Back Hook" />
                  </div>
                </Field>
              </div>
              <div>
                <Field label="Delivery Date" hint="Optional — pick if you have a deadline">
                  <input
                    type="date"
                    value={form.deliveryDate}
                    onChange={e => upd("deliveryDate", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    style={inputStyle}
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* Guide */}
          <div style={{ paddingBottom: 24, borderBottom: `1px solid ${ORDER_COLORS.borderSoft}`, marginBottom: 24 }}>
            <h4 style={{
              fontSize: 14, fontWeight: 700, color: ORDER_COLORS.text,
              margin: "0 0 16px", letterSpacing: "0.04em", textTransform: "uppercase",
            }}>Measurement Guide</h4>
            <div style={{
              display: "flex", justifyContent: "center",
              padding: 20, background: ORDER_COLORS.cream, borderRadius: 12,
              border: `1px solid ${ORDER_COLORS.borderSoft}`,
            }}>
              <MeasurementGuide />
            </div>
            <p style={{ fontSize: 13, color: ORDER_COLORS.textMuted, textAlign: "center", margin: "12px 0 0" }}>
              Use a soft measuring tape and measure in inches. Keep the tape snug but not tight.
            </p>
          </div>

          {/* Front measurements */}
          <h4 style={{
            fontSize: 14, fontWeight: 700, color: ORDER_COLORS.text,
            margin: "0 0 12px", letterSpacing: "0.04em", textTransform: "uppercase",
          }}>Front Measurements</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
            {FRONT_MEAS.map(m => (
              <Field key={m.id} label={`${m.n}. ${m.label}`}>
                <NumberInput value={form[m.id]} onChange={v => upd(m.id, v)} />
              </Field>
            ))}
          </div>

          {/* Back measurements */}
          <h4 style={{
            fontSize: 14, fontWeight: 700, color: ORDER_COLORS.text,
            margin: "0 0 12px", letterSpacing: "0.04em", textTransform: "uppercase",
          }}>Back Measurements</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            {BACK_MEAS.map(m => (
              <Field key={m.id} label={`${m.n}. ${m.label}`}>
                <NumberInput value={form[m.id]} onChange={v => upd(m.id, v)} />
              </Field>
            ))}
          </div>

          {/* Save measurements row */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 14, marginTop: 24, padding: "14px 18px",
            background: ORDER_COLORS.burgundyLight,
            border: `1px solid ${ORDER_COLORS.borderSoft}`,
            borderRadius: 10, flexWrap: "wrap",
          }}>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: ORDER_COLORS.text }}>
                {saved ? "Update saved measurements" : "Save these measurements"}
              </div>
              <div style={{ fontSize: 12, color: ORDER_COLORS.textMuted, marginTop: 2 }}>
                We'll remember them on this device for your next order — no account needed.
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {savedToast && (
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: ORDER_COLORS.success,
                  display: "inline-flex", alignItems: "center", gap: 4,
                }}>✓ {savedToast}</span>
              )}
              <button type="button" onClick={saveMeasurements} style={{
                padding: "10px 20px",
                background: ORDER_COLORS.burgundy,
                color: "#fff", border: "none", borderRadius: 8,
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>
                <span>💾</span>
                {saved ? "Update measurements" : "Save measurements"}
              </button>
            </div>
          </div>

          {/* Help checkbox */}
          <label style={{
            display: "flex", alignItems: "center", gap: 10, marginTop: 14,
            padding: "12px 16px",
            background: ORDER_COLORS.goldLight,
            borderRadius: 10,
            border: `1px solid ${ORDER_COLORS.gold}`,
            cursor: "pointer",
          }}>
            <input
              type="checkbox"
              checked={form.wantMeasurementHelp}
              onChange={e => upd("wantMeasurementHelp", e.target.checked)}
              style={{ accentColor: ORDER_COLORS.saffron, width: 16, height: 16 }}
            />
            <span style={{ fontSize: 14, color: ORDER_COLORS.text }}>
              <strong>I want guided measurement help</strong> — we'll assist you via video call
            </span>
          </label>
        </SectionCard>

        {/* Additional materials */}
        <SectionCard title="Additional Materials" icon="🧵" accent={ORDER_COLORS.burgundy}>
          <Field label="Extra Cloths / Laces Needed?">
            <div style={{ display: "flex", gap: 12 }}>
              <Radio name="extra" value="yes" checked={form.extraClothsLaces === "yes"}
                onChange={() => upd("extraClothsLaces", "yes")} label="Yes" />
              <Radio name="extra" value="no" checked={form.extraClothsLaces === "no"}
                onChange={() => upd("extraClothsLaces", "no")} label="No" />
            </div>
          </Field>
        </SectionCard>

        {/* Special requests */}
        <SectionCard title="Special Requests" icon="✦" accent={ORDER_COLORS.burgundy}>
          <textarea
            value={form.specialRequests}
            onChange={e => upd("specialRequests", e.target.value)}
            placeholder="Any special instructions, fabric handling notes, or additional requests..."
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </SectionCard>

        {/* User Agreement */}
        <SectionCard
          title="User Agreement & Policies"
          icon="📜"
          headerBg={`linear-gradient(135deg, ${ORDER_COLORS.burgundy} 0%, ${ORDER_COLORS.saffronDark} 100%)`}
        >
          <p style={{ fontSize: 13, color: ORDER_COLORS.textMuted, marginTop: 0, marginBottom: 18 }}>
            Please read carefully before placing your order. By submitting, you agree to the following terms.
          </p>

          {/* Stitching in India */}
          <div style={{
            display: "flex", gap: 14, padding: "16px 18px", marginBottom: 14,
            background: ORDER_COLORS.cream, borderRadius: 10,
            border: `1px solid ${ORDER_COLORS.borderSoft}`,
          }}>
            <div style={{
              flexShrink: 0, width: 36, height: 36, borderRadius: "50%",
              background: ORDER_COLORS.burgundyLight, color: ORDER_COLORS.burgundy,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700,
            }}>1</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: ORDER_COLORS.text, marginBottom: 4 }}>
                Stitching Takes Place in India
              </div>
              <div style={{ fontSize: 13.5, color: ORDER_COLORS.textMuted, lineHeight: 1.6 }}>
                Your blouse piece (fabric) is shipped to our artisans in India, custom stitched to your measurements,
                and the finished blouse is shipped back to your address. The full round-trip is part of our service.
              </div>
            </div>
          </div>

          {/* Shipping responsibility */}
          <div style={{
            display: "flex", gap: 14, padding: "16px 18px", marginBottom: 14,
            background: ORDER_COLORS.cream, borderRadius: 10,
            border: `1px solid ${ORDER_COLORS.borderSoft}`,
          }}>
            <div style={{
              flexShrink: 0, width: 36, height: 36, borderRadius: "50%",
              background: ORDER_COLORS.burgundyLight, color: ORDER_COLORS.burgundy,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700,
            }}>2</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: ORDER_COLORS.text, marginBottom: 4 }}>
                Shipping & Transit Risk
              </div>
              <div style={{ fontSize: 13.5, color: ORDER_COLORS.textMuted, lineHeight: 1.6 }}>
                While the chance of a package being lost or damaged in transit is very slim, KarunaStitch is
                <strong style={{ color: ORDER_COLORS.text }}> not responsible for shipping mishaps or other transport issues</strong> —
                including loss, theft, customs delays, or damage that occurs during shipping to or from India.
              </div>
            </div>
          </div>

          {/* Damage during making */}
          <div style={{
            display: "flex", gap: 14, padding: "16px 18px", marginBottom: 14,
            background: ORDER_COLORS.successLight, borderRadius: 10,
            border: `1px solid ${ORDER_COLORS.success}33`,
          }}>
            <div style={{
              flexShrink: 0, width: 36, height: 36, borderRadius: "50%",
              background: "#fff", color: ORDER_COLORS.success,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700,
            }}>3</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: ORDER_COLORS.text, marginBottom: 4 }}>
                Damage During Stitching — Full Refund
              </div>
              <div style={{ fontSize: 13.5, color: ORDER_COLORS.textMuted, lineHeight: 1.6 }}>
                If your material is damaged during the making process and the finished blouse cannot be returned to you,
                we will issue a <strong style={{ color: ORDER_COLORS.text }}>full refund</strong> for the stitching service and
                a fair-value reimbursement for the damaged fabric.
              </div>
            </div>
          </div>

          {/* Measurement changes */}
          <div style={{
            display: "flex", gap: 14, padding: "16px 18px", marginBottom: 14,
            background: ORDER_COLORS.goldLight, borderRadius: 10,
            border: `1px solid ${ORDER_COLORS.gold}55`,
          }}>
            <div style={{
              flexShrink: 0, width: 36, height: 36, borderRadius: "50%",
              background: "#fff", color: ORDER_COLORS.saffronDark,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700,
            }}>4</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: ORDER_COLORS.text, marginBottom: 4 }}>
                Measurement Changes Before Cutting
              </div>
              <div style={{ fontSize: 13.5, color: ORDER_COLORS.textMuted, lineHeight: 1.6 }}>
                You may update your measurements <strong style={{ color: ORDER_COLORS.text }}>any time before the fabric is cut</strong>.
                Once cutting has begun, measurements are locked. We'll notify you by email or phone before cutting starts so you have
                a final chance to confirm or adjust.
              </div>
            </div>
          </div>

          {/* Return policy */}
          <div style={{
            display: "flex", gap: 14, padding: "16px 18px",
            background: ORDER_COLORS.cream, borderRadius: 10,
            border: `1px solid ${ORDER_COLORS.borderSoft}`,
          }}>
            <div style={{
              flexShrink: 0, width: 36, height: 36, borderRadius: "50%",
              background: ORDER_COLORS.burgundyLight, color: ORDER_COLORS.burgundy,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700,
            }}>5</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: ORDER_COLORS.text, marginBottom: 4 }}>
                Return & Rework Policy
              </div>
              <div style={{ fontSize: 13.5, color: ORDER_COLORS.textMuted, lineHeight: 1.6 }}>
                Because every blouse is custom-stitched to your measurements, standard returns are not accepted.
                However:
                <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                  <li style={{ marginBottom: 4 }}>
                    <strong style={{ color: ORDER_COLORS.text }}>Stitching defects</strong> (uneven seams, loose threads, construction faults) —
                    report within <strong style={{ color: ORDER_COLORS.text }}>7 days of delivery</strong> with photos and we will rework or refund the stitching cost.
                  </li>
                  <li style={{ marginBottom: 4 }}>
                    <strong style={{ color: ORDER_COLORS.text }}>Fit issues caused by our error</strong> (did not match your submitted measurements) —
                    we will alter at no charge; return shipping is on us.
                  </li>
                  <li>
                    <strong style={{ color: ORDER_COLORS.text }}>Fit issues caused by incorrect measurements submitted by you</strong> —
                    we can alter for a small fee plus shipping.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Agreement checkbox */}
          <label style={{
            display: "flex", alignItems: "flex-start", gap: 12, marginTop: 18,
            padding: "14px 16px",
            background: form.agreedToTerms ? ORDER_COLORS.successLight : "#fff",
            border: `2px solid ${errors.agreedToTerms ? ORDER_COLORS.danger : (form.agreedToTerms ? ORDER_COLORS.success : ORDER_COLORS.border)}`,
            borderRadius: 10,
            cursor: "pointer",
            transition: "all 0.15s",
          }}>
            <input
              type="checkbox"
              checked={form.agreedToTerms}
              onChange={e => upd("agreedToTerms", e.target.checked)}
              style={{ accentColor: ORDER_COLORS.burgundy, width: 18, height: 18, marginTop: 2, flexShrink: 0 }}
            />
            <span style={{ fontSize: 14, color: ORDER_COLORS.text, lineHeight: 1.5 }}>
              <strong>I have read and agree</strong> to the User Agreement above — including the stitching process in India,
              shipping &amp; transit risk, damage refund terms, measurement-change cutoff, and return &amp; rework policy.
              {errors.agreedToTerms && (
                <span style={{ display: "block", color: ORDER_COLORS.danger, fontSize: 12, marginTop: 4, fontWeight: 600 }}>
                  {errors.agreedToTerms}
                </span>
              )}
            </span>
          </label>
        </SectionCard>

        {/* Payment */}
        <SectionCard
          title="Payment"
          icon="💳"
          headerBg={`linear-gradient(135deg, ${ORDER_COLORS.burgundy} 0%, ${ORDER_COLORS.burgundyDark} 100%)`}
        >
          <StripeCheckoutSummary amount={amount} paymentStatus={paymentStatus} />
        </SectionCard>

        {/* Submit */}
        <div style={{
          background: "#fff",
          borderRadius: 14,
          border: `2px solid ${ORDER_COLORS.burgundy}`,
          padding: "24px 28px",
          boxShadow: "0 8px 24px -10px rgba(107, 26, 46, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
        }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flex: 1, minWidth: 280 }}>
            <input
              type="checkbox"
              checked={form.isCustomItem}
              onChange={e => upd("isCustomItem", e.target.checked)}
              style={{ accentColor: ORDER_COLORS.burgundy, width: 18, height: 18 }}
            />
            <span style={{ fontSize: 14, color: ORDER_COLORS.text }}>
              I understand this is a custom-made item
              {errors.isCustomItem && <span style={{ display: "block", color: ORDER_COLORS.danger, fontSize: 12 }}>{errors.isCustomItem}</span>}
            </span>
          </label>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "14px 40px",
              background: submitting ? ORDER_COLORS.textMuted : ORDER_COLORS.burgundy,
              border: "none",
              borderRadius: 10,
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              cursor: submitting ? "wait" : "pointer",
              fontFamily: "'Playfair Display', Georgia, serif",
              letterSpacing: "0.02em",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              transition: "all 0.15s",
            }}
          >
            {submitting ? "Redirecting to Stripe…" : `Continue to Payment · $${amount.total.toFixed(2)} ✦`}
          </button>
        </div>
      </form>
    </div>
  );
}

window.BlouseOrderForm = BlouseOrderForm;
