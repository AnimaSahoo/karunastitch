import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const ALLOWED_ORIGINS = [
  "https://karunastitch.lovable.app",
  "https://id-preview--e7110f26-cf0c-4df5-a583-684879d574f9.lovable.app"
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(o => origin.includes("lovable.app"))
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Credentials": "true",
  };
};

const escapeHtml = (text: string | null | undefined): string => {
  if (!text) return '';
  const map: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '/': '&#x2F;',
  };
  return String(text).replace(/[&<>"'/]/g, (m) => map[m]);
};

interface OrderConfirmationRequest {
  orderId: string;
}

const checkRateLimit = async (
  supabase: ReturnType<typeof createClient>,
  orderId: string,
  functionName: string
): Promise<{ allowed: boolean; error?: string }> => {
  const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
  const { data, error } = await supabase
    .from("email_sends")
    .select("id")
    .eq("order_id", orderId)
    .eq("function_name", functionName)
    .gte("sent_at", oneMinuteAgo)
    .limit(1);
  if (error) return { allowed: true };
  if (data && data.length > 0) return { allowed: false, error: "Email already sent recently. Please wait before retrying." };
  return { allowed: true };
};

const logEmailSend = async (
  supabase: ReturnType<typeof createClient>,
  orderId: string,
  functionName: string
) => {
  await supabase.from("email_sends").insert({ order_id: orderId, function_name: functionName });
};

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId }: OrderConfirmationRequest = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing orderId" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const rateLimitResult = await checkRateLimit(supabase, orderId, "send-order-confirmation");
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ success: false, error: rateLimitResult.error }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, email, full_name, blouse_type, delivery_date, order_date, created_at, selected_design, special_requests, street, city, state, zip, country")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ success: false, error: "Order not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const createdAt = new Date(order.created_at);
    const now = new Date();
    const minutesSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    if (minutesSinceCreation > 5) {
      return new Response(
        JSON.stringify({ success: false, error: "Confirmation email can only be sent for recent orders" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const customerEmail = order.email;
    if (!customerEmail) {
      return new Response(
        JSON.stringify({ success: false, error: "No email on order" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const customerName = escapeHtml(order.full_name);
    const blouseType = escapeHtml(order.blouse_type);
    const deliveryDate = escapeHtml(order.delivery_date) || "To be confirmed";
    const selectedDesign = escapeHtml(order.selected_design);
    const specialRequests = escapeHtml(order.special_requests);
    const shippingAddress = [order.street, order.city, order.state, order.zip, order.country]
      .filter(Boolean).map(escapeHtml).join(", ");

    const formattedOrderDate = new Date(order.order_date).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });

    const shortOrderId = orderId.slice(0, 8).toUpperCase();

    const emailResponse = await resend.emails.send({
      from: "KarunaStitch <noreply@karunastitch.com>",
      to: [customerEmail],
      subject: `✦ Order Confirmed – KarunaStitch #${shortOrderId}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation – KarunaStitch</title>
</head>
<body style="margin:0;padding:0;background-color:#FDF8F3;font-family:'Georgia',serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;background-color:#6B1A2E;border-radius:12px;padding:16px 32px;">
        <h1 style="color:#ffffff;font-size:26px;margin:0;letter-spacing:-0.02em;">KarunaStitch ✦</h1>
        <p style="color:rgba(255,255,255,0.8);font-size:13px;margin:6px 0 0;letter-spacing:0.05em;">STITCH WITH COMPASSION</p>
      </div>
    </div>

    <!-- Main Card -->
    <div style="background:#ffffff;border-radius:16px;padding:40px 36px;border:1px solid rgba(200,81,27,0.15);box-shadow:0 2px 12px rgba(107,26,46,0.06);">

      <!-- Success badge -->
      <div style="text-align:center;margin-bottom:28px;">
        <div style="display:inline-block;background:#E6F4EC;border:1px solid #1D6E3A;border-radius:50px;padding:8px 20px;">
          <span style="color:#1D6E3A;font-size:14px;font-weight:600;">✓ Order Confirmed</span>
        </div>
      </div>

      <!-- Greeting -->
      <h2 style="color:#6B1A2E;font-size:22px;margin:0 0 12px;">Thank you, ${customerName}!</h2>
      <p style="color:#6B5C52;font-size:15px;line-height:1.7;margin:0 0 28px;">
        Your custom saree blouse order has been received and is on its way to your artisan. 
        We're so glad you chose to stitch with compassion — supporting skilled craftswomen in India 
        while getting a blouse made just for you.
      </p>

      <!-- Order Summary Box -->
      <div style="background:#FDF8F3;border-radius:12px;padding:24px;margin-bottom:28px;border:1px solid rgba(200,81,27,0.12);">
        <h3 style="color:#C8511B;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 16px;">Order Details</h3>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:9px 0;color:#6B5C52;font-size:14px;border-bottom:1px solid rgba(200,81,27,0.1);">Order ID</td>
            <td style="padding:9px 0;color:#1A0A0A;font-size:14px;font-weight:700;text-align:right;border-bottom:1px solid rgba(200,81,27,0.1);font-family:monospace;">#${shortOrderId}</td>
          </tr>
          <tr>
            <td style="padding:9px 0;color:#6B5C52;font-size:14px;border-bottom:1px solid rgba(200,81,27,0.1);">Order Date</td>
            <td style="padding:9px 0;color:#1A0A0A;font-size:14px;text-align:right;border-bottom:1px solid rgba(200,81,27,0.1);">${formattedOrderDate}</td>
          </tr>
          ${blouseType ? `
          <tr>
            <td style="padding:9px 0;color:#6B5C52;font-size:14px;border-bottom:1px solid rgba(200,81,27,0.1);">Blouse Type</td>
            <td style="padding:9px 0;color:#1A0A0A;font-size:14px;text-align:right;border-bottom:1px solid rgba(200,81,27,0.1);">${blouseType}</td>
          </tr>` : ""}
          ${selectedDesign ? `
          <tr>
            <td style="padding:9px 0;color:#6B5C52;font-size:14px;border-bottom:1px solid rgba(200,81,27,0.1);">Design</td>
            <td style="padding:9px 0;color:#1A0A0A;font-size:14px;text-align:right;border-bottom:1px solid rgba(200,81,27,0.1);">${selectedDesign}</td>
          </tr>` : ""}
          <tr>
            <td style="padding:9px 0;color:#6B5C52;font-size:14px;border-bottom:1px solid rgba(200,81,27,0.1);">Expected Delivery</td>
            <td style="padding:9px 0;color:#C8511B;font-size:14px;font-weight:600;text-align:right;border-bottom:1px solid rgba(200,81,27,0.1);">${deliveryDate}</td>
          </tr>
          ${shippingAddress ? `
          <tr>
            <td style="padding:9px 0;color:#6B5C52;font-size:14px;">Ships to</td>
            <td style="padding:9px 0;color:#1A0A0A;font-size:14px;text-align:right;">${shippingAddress}</td>
          </tr>` : ""}
        </table>
      </div>

      ${specialRequests ? `
      <!-- Special Requests -->
      <div style="background:#FBF3DC;border-radius:10px;padding:16px 20px;margin-bottom:28px;border-left:3px solid #D4A017;">
        <p style="color:#6B5C52;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 6px;">Your Special Instructions</p>
        <p style="color:#1A0A0A;font-size:14px;line-height:1.6;margin:0;">${specialRequests}</p>
      </div>` : ""}

      <!-- What's Next -->
      <div style="margin-bottom:32px;">
        <h3 style="color:#6B1A2E;font-size:16px;margin:0 0 16px;">What happens next?</h3>
        <div style="display:flex;flex-direction:column;gap:0;">
          ${[
            ["1", "Your artisan reviews your measurements & design within 24 hours."],
            ["2", "You may receive a call or message for any clarifications needed."],
            ["3", "Your blouse is handcrafted with care — this takes 2–4 weeks."],
            ["4", "We notify you when your order ships directly to your US address."],
          ].map(([num, text]) => `
          <div style="display:flex;gap:14px;align-items:flex-start;padding:12px 0;border-bottom:1px solid rgba(200,81,27,0.08);">
            <div style="width:26px;height:26px;border-radius:50%;background:#F5E6DC;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;font-weight:700;color:#C8511B;text-align:center;line-height:26px;">${num}</div>
            <p style="color:#6B5C52;font-size:14px;line-height:1.6;margin:3px 0 0;">${text}</p>
          </div>`).join("")}
        </div>
      </div>

      <!-- Contact CTA -->
      <div style="background:#6B1A2E;border-radius:12px;padding:24px;text-align:center;">
        <p style="color:rgba(255,255,255,0.9);font-size:14px;margin:0 0 6px;">Questions about your order?</p>
        <a href="mailto:support@karunastitch.com" style="color:#D4A017;font-size:14px;font-weight:600;text-decoration:none;">support@karunastitch.com</a>
      </div>

    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:24px;">
      <p style="color:#6B5C52;font-size:12px;margin:0 0 4px;">© ${new Date().getFullYear()} KarunaStitch · Handcrafted with ♡</p>
      <p style="color:#C8511B;font-size:12px;margin:0;font-style:italic;">Stitch with Compassion — supporting women artisans in India</p>
    </div>

  </div>
</body>
</html>
      `,
    });

    await logEmailSend(supabase, orderId, "send-order-confirmation");

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...getCorsHeaders(null) } }
    );
  }
};

serve(handler);
