export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const RESEND_API_KEY = process.env.VITE_RESEND_API_KEY;

  try {
    const { customerEmail, customerName, orderId, blouseType, deliveryDate, phone, address } = JSON.parse(event.body);

    const shortOrderId = orderId.slice(0, 8).toUpperCase();

    // Send customer confirmation email
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "KarunaStitch <noreply@karunastitch.com>",
        to: [customerEmail],
        subject: `✦ Order Confirmed – KarunaStitch #${shortOrderId}`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#FDF8F3;font-family:'Georgia',serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background-color:#6B1A2E;border-radius:12px;padding:16px 32px;">
        <h1 style="color:#ffffff;font-size:26px;margin:0;">KarunaStitch ✦</h1>
        <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:6px 0 0;letter-spacing:0.05em;">STITCH WITH COMPASSION</p>
      </div>
    </div>
    <div style="background:#ffffff;border-radius:16px;padding:40px 36px;border:1px solid rgba(200,81,27,0.15);">
      <div style="text-align:center;margin-bottom:28px;">
        <div style="display:inline-block;background:#E6F4EC;border:1px solid #1D6E3A;border-radius:50px;padding:8px 20px;">
          <span style="color:#1D6E3A;font-size:14px;font-weight:600;">✓ Order Confirmed</span>
        </div>
      </div>
      <h2 style="color:#6B1A2E;font-size:22px;margin:0 0 12px;">Thank you, ${customerName}!</h2>
      <p style="color:#6B5C52;font-size:15px;line-height:1.7;margin:0 0 28px;">
        Your custom saree blouse order has been received. We're so glad you chose to stitch with compassion — supporting skilled craftswomen in India while getting a blouse made just for you.
      </p>
      <div style="background:#FDF8F3;border-radius:12px;padding:24px;margin-bottom:28px;border:1px solid rgba(200,81,27,0.12);">
        <h3 style="color:#C8511B;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 16px;">Order Details</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:9px 0;color:#6B5C52;font-size:14px;border-bottom:1px solid rgba(200,81,27,0.1);">Order ID</td><td style="padding:9px 0;color:#1A0A0A;font-size:14px;font-weight:700;text-align:right;border-bottom:1px solid rgba(200,81,27,0.1);font-family:monospace;">#${shortOrderId}</td></tr>
          <tr><td style="padding:9px 0;color:#6B5C52;font-size:14px;border-bottom:1px solid rgba(200,81,27,0.1);">Blouse Type</td><td style="padding:9px 0;color:#1A0A0A;font-size:14px;text-align:right;border-bottom:1px solid rgba(200,81,27,0.1);">${blouseType || "Custom Design"}</td></tr>
          <tr><td style="padding:9px 0;color:#6B5C52;font-size:14px;">Expected Delivery</td><td style="padding:9px 0;color:#C8511B;font-size:14px;font-weight:600;text-align:right;">${deliveryDate || "To be confirmed"}</td></tr>
        </table>
      </div>
      <div style="margin-bottom:32px;">
        <h3 style="color:#6B1A2E;font-size:16px;margin:0 0 16px;">What happens next?</h3>
        <div style="padding:12px 0;border-bottom:1px solid rgba(200,81,27,0.08);display:flex;gap:14px;"><div style="min-width:26px;height:26px;border-radius:50%;background:#F5E6DC;color:#C8511B;font-size:12px;font-weight:700;text-align:center;line-height:26px;">1</div><p style="color:#6B5C52;font-size:14px;line-height:1.6;margin:3px 0 0;">Our team reviews your measurements & design within 24 hours.</p></div>
        <div style="padding:12px 0;border-bottom:1px solid rgba(200,81,27,0.08);display:flex;gap:14px;"><div style="min-width:26px;height:26px;border-radius:50%;background:#F5E6DC;color:#C8511B;font-size:12px;font-weight:700;text-align:center;line-height:26px;">2</div><p style="color:#6B5C52;font-size:14px;line-height:1.6;margin:3px 0 0;">You may receive a call for any clarifications needed.</p></div>
        <div style="padding:12px 0;border-bottom:1px solid rgba(200,81,27,0.08);display:flex;gap:14px;"><div style="min-width:26px;height:26px;border-radius:50%;background:#F5E6DC;color:#C8511B;font-size:12px;font-weight:700;text-align:center;line-height:26px;">3</div><p style="color:#6B5C52;font-size:14px;line-height:1.6;margin:3px 0 0;">Your blouse is handcrafted with care — this takes 2–4 weeks.</p></div>
        <div style="padding:12px 0;display:flex;gap:14px;"><div style="min-width:26px;height:26px;border-radius:50%;background:#F5E6DC;color:#C8511B;font-size:12px;font-weight:700;text-align:center;line-height:26px;">4</div><p style="color:#6B5C52;font-size:14px;line-height:1.6;margin:3px 0 0;">We notify you when your order ships to your US address.</p></div>
      </div>
      <div style="background:#6B1A2E;border-radius:12px;padding:24px;text-align:center;">
        <p style="color:rgba(255,255,255,0.9);font-size:14px;margin:0 0 6px;">Questions? We're here to help.</p>
        <a href="mailto:support@karunastitch.com" style="color:#D4A017;font-size:14px;font-weight:600;text-decoration:none;">support@karunastitch.com</a>
      </div>
    </div>
    <div style="text-align:center;margin-top:24px;">
      <p style="color:#6B5C52;font-size:12px;margin:0 0 4px;">© ${new Date().getFullYear()} KarunaStitch · Handcrafted with ♡</p>
      <p style="color:#C8511B;font-size:12px;margin:0;font-style:italic;">Stitch with Compassion — supporting women artisans in India</p>
    </div>
  </div>
</body>
</html>`,
      }),
    });

    // Send admin notification email
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "KarunaStitch <noreply@karunastitch.com>",
        to: ["sahoo.anima@gmail.com"],
        subject: `✦ New Order #${shortOrderId} – ${customerName}`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#FDF8F3;font-family:'Georgia',serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background-color:#6B1A2E;border-radius:12px;padding:14px 28px;">
        <h1 style="color:#ffffff;font-size:22px;margin:0;">KarunaStitch ✦</h1>
        <p style="color:rgba(255,255,255,0.7);font-size:11px;margin:4px 0 0;letter-spacing:0.08em;">ADMIN NOTIFICATION</p>
      </div>
    </div>
    <div style="background:#FBF3DC;border:1px solid #D4A017;border-radius:10px;padding:16px 20px;margin-bottom:24px;text-align:center;">
      <p style="color:#8B6914;font-size:16px;font-weight:700;margin:0;">📦 New order received!</p>
      <p style="color:#8B6914;font-size:13px;margin:6px 0 0;">Order <strong>#${shortOrderId}</strong></p>
    </div>
    <div style="background:#ffffff;border-radius:16px;padding:36px;border:1px solid rgba(200,81,27,0.15);">
      <h3 style="color:#C8511B;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 14px;">Customer</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
        <tr><td style="padding:8px 0;color:#6B5C52;font-size:13px;border-bottom:1px solid rgba(200,81,27,0.08);">Name</td><td style="padding:8px 0;color:#1A0A0A;font-size:13px;text-align:right;border-bottom:1px solid rgba(200,81,27,0.08);">${customerName}</td></tr>
        <tr><td style="padding:8px 0;color:#6B5C52;font-size:13px;border-bottom:1px solid rgba(200,81,27,0.08);">Email</td><td style="padding:8px 0;color:#1A0A0A;font-size:13px;text-align:right;border-bottom:1px solid rgba(200,81,27,0.08);">${customerEmail}</td></tr>
        <tr><td style="padding:8px 0;color:#6B5C52;font-size:13px;border-bottom:1px solid rgba(200,81,27,0.08);">Phone</td><td style="padding:8px 0;color:#1A0A0A;font-size:13px;text-align:right;border-bottom:1px solid rgba(200,81,27,0.08);">${phone || "Not provided"}</td></tr>
        <tr><td style="padding:8px 0;color:#6B5C52;font-size:13px;">Address</td><td style="padding:8px 0;color:#1A0A0A;font-size:13px;text-align:right;">${address || "Not provided"}</td></tr>
      </table>
      <h3 style="color:#C8511B;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 14px;">Order Details</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:28px;">
        <tr><td style="padding:8px 0;color:#6B5C52;font-size:13px;border-bottom:1px solid rgba(200,81,27,0.08);">Blouse Type</td><td style="padding:8px 0;color:#C8511B;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid rgba(200,81,27,0.08);">${blouseType || "Not specified"}</td></tr>
        <tr><td style="padding:8px 0;color:#6B5C52;font-size:13px;">Delivery Date</td><td style="padding:8px 0;color:#1A0A0A;font-size:13px;text-align:right;">${deliveryDate || "Not specified"}</td></tr>
      </table>
      <div style="text-align:center;">
        <a href="https://karunastitch.netlify.app/admin" style="display:inline-block;background:#6B1A2E;color:#ffffff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">Open Admin Dashboard →</a>
      </div>
    </div>
  </div>
</body>
</html>`,
      }),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
}
