import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const ADMIN_EMAIL = "sahoo.anima@gmail.com";

// Restrict CORS to specific origins
const ALLOWED_ORIGINS = [
  "https://karunastitch.lovable.app",
  "https://id-preview--e7110f26-cf0c-4df5-a583-684879d574f9.lovable.app"
];

const getCorsHeaders = (origin: string | null) => {
  const allowedOrigin = origin && ALLOWED_ORIGINS.some(o => origin.startsWith(o.replace("https://", "https://")) || origin.includes("lovable.app"))
    ? origin
    : ALLOWED_ORIGINS[0];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Credentials": "true",
  };
};

// HTML escape function to prevent XSS in email templates
const escapeHtml = (text: string | null | undefined): string => {
  if (!text) return '';
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return String(text).replace(/[&<>"'/]/g, (m) => map[m]);
};

interface AdminNotificationRequest {
  orderId: string;
}

// Rate limit: max 1 email per order per minute
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

  if (error) {
    // Allow on error to not block legitimate requests
    return { allowed: true };
  }

  if (data && data.length > 0) {
    return { allowed: false, error: "Notification already sent recently. Please wait before retrying." };
  }

  return { allowed: true };
};

const logEmailSend = async (
  supabase: ReturnType<typeof createClient>,
  orderId: string,
  functionName: string
) => {
  await supabase
    .from("email_sends")
    .insert({ order_id: orderId, function_name: functionName });
};

const handler = async (req: Request): Promise<Response> => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId }: AdminNotificationRequest = await req.json();

    // Validate required field
    if (!orderId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing orderId" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role to fetch order details
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check rate limit before proceeding
    const rateLimitResult = await checkRateLimit(supabase, orderId, "send-admin-notification");
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ success: false, error: rateLimitResult.error }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch order from database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ success: false, error: "Order not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if order was created within the last 5 minutes (prevents abuse)
    const createdAt = new Date(order.created_at);
    const now = new Date();
    const minutesSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    
    if (minutesSinceCreation > 5) {
      return new Response(
        JSON.stringify({ success: false, error: "Notification can only be sent for recent orders" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const formattedOrderDate = new Date(order.order_date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Escape all user-provided data for HTML safety
    const safeFullName = escapeHtml(order.full_name);
    const safeEmail = escapeHtml(order.email);
    const safePhone = escapeHtml(order.phone);
    const safeBlouseType = escapeHtml(order.blouse_type);
    const safeDeliveryDate = escapeHtml(order.delivery_date);
    const safeHookPosition = escapeHtml(order.hook_position);
    const safeExtraClothsLaces = escapeHtml(order.extra_cloths_laces);
    const safeSpecialRequests = escapeHtml(order.special_requests);
    const safeChest = escapeHtml(order.chest);
    const safeWaist = escapeHtml(order.waist);
    const safeShoulder = escapeHtml(order.shoulder);
    const safeFullShoulder = escapeHtml(order.full_shoulder);
    const safeBlouseBackLength = escapeHtml(order.blouse_back_length);
    const safeBackNeckDepth = escapeHtml(order.back_neck_depth);
    const safeFrontNeckDepth = escapeHtml(order.front_neck_depth);
    const safeSleeveLength = escapeHtml(order.sleeve_length);
    const safeSleeveRound = escapeHtml(order.sleeve_round);
    const safeArmHole = escapeHtml(order.arm_hole);
    const safeStreet = escapeHtml(order.street);
    const safeCity = escapeHtml(order.city);
    const safeState = escapeHtml(order.state);
    const safeZip = escapeHtml(order.zip);
    const safeCountry = escapeHtml(order.country);

    const emailResponse = await resend.emails.send({
      from: "Karuna Stitch <noreply@karunastitch.com>",
      to: [ADMIN_EMAIL],
      subject: `🆕 New Order Received - ${orderId.slice(0, 8).toUpperCase()}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f4f0;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #8B4513; font-size: 28px; margin: 0;">New Order Alert!</h1>
                <p style="color: #666; font-size: 14px; margin-top: 8px;">Blouse & Beyond Admin</p>
              </div>
              
              <!-- Alert Banner -->
              <div style="background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center;">
                <p style="color: #155724; font-size: 16px; font-weight: 600; margin: 0;">
                  📦 A new order has been placed!
                </p>
              </div>
              
              <!-- Customer Details -->
              <div style="background-color: #faf6f2; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h3 style="color: #8B4513; font-size: 16px; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">Customer Information</h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Order ID</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right; font-weight: 600;">${orderId.slice(0, 8).toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Order Date</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">${formattedOrderDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Customer Name</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">${safeFullName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Email</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">${safeEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Phone</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">${safePhone}</td>
                  </tr>
                </table>
              </div>
              
              <!-- Order Details -->
              <div style="background-color: #fff3e0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h3 style="color: #e65100; font-size: 16px; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">Order Details</h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Blouse Type</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">${safeBlouseType || "Not specified"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Expected Delivery</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">${safeDeliveryDate || "To be confirmed"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Hook Position</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">${safeHookPosition || "Not specified"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Extra Cloths/Laces</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">${safeExtraClothsLaces || "No"}</td>
                  </tr>
                  ${safeSpecialRequests ? `
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Special Requests</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">${safeSpecialRequests}</td>
                  </tr>
                  ` : ""}
                </table>
              </div>
              
              <!-- Measurements -->
              <div style="background-color: #e3f2fd; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h3 style="color: #1565c0; font-size: 16px; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">Measurements</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                  ${safeShoulder ? `<div style="font-size: 13px;"><span style="color: #666;">1. Shoulder:</span> <strong>${safeShoulder}</strong></div>` : ""}
                  ${safeFullShoulder ? `<div style="font-size: 13px;"><span style="color: #666;">2. Shoulder Full Length:</span> <strong>${safeFullShoulder}</strong></div>` : ""}
                  ${safeFrontNeckDepth ? `<div style="font-size: 13px;"><span style="color: #666;">3. Front Neck Depth:</span> <strong>${safeFrontNeckDepth}</strong></div>` : ""}
                  ${safeChest ? `<div style="font-size: 13px;"><span style="color: #666;">4. Chest (around):</span> <strong>${safeChest}</strong></div>` : ""}
                  ${safeWaist ? `<div style="font-size: 13px;"><span style="color: #666;">5. Waist (around):</span> <strong>${safeWaist}</strong></div>` : ""}
                  ${safeBackNeckDepth ? `<div style="font-size: 13px;"><span style="color: #666;">6. Back Neck Depth:</span> <strong>${safeBackNeckDepth}</strong></div>` : ""}
                  ${safeBlouseBackLength ? `<div style="font-size: 13px;"><span style="color: #666;">7. Blouse Length:</span> <strong>${safeBlouseBackLength}</strong></div>` : ""}
                  ${safeSleeveLength ? `<div style="font-size: 13px;"><span style="color: #666;">8. Sleeve Length:</span> <strong>${safeSleeveLength}</strong></div>` : ""}
                  ${safeSleeveRound ? `<div style="font-size: 13px;"><span style="color: #666;">9. Sleeve (around):</span> <strong>${safeSleeveRound}</strong></div>` : ""}
                  ${safeArmHole ? `<div style="font-size: 13px;"><span style="color: #666;">10. Armhole (around):</span> <strong>${safeArmHole}</strong></div>` : ""}
                </div>
                
                ${order.want_measurement_help ? `
                <p style="color: #1565c0; font-size: 13px; margin-top: 16px; font-style: italic;">
                  ⚠️ Customer requested measurement help
                </p>
                ` : ""}
              </div>
              
              <!-- Address -->
              ${safeStreet || safeCity || safeState ? `
              <div style="background-color: #f3e5f5; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <h3 style="color: #7b1fa2; font-size: 16px; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">Delivery Address</h3>
                <p style="color: #333; font-size: 14px; margin: 0; line-height: 1.6;">
                  ${safeStreet || ""}${safeStreet ? "<br>" : ""}
                  ${safeCity || ""}${safeCity && safeState ? ", " : ""}${safeState || ""} ${safeZip || ""}
                  ${safeCountry ? `<br>${safeCountry}` : ""}
                </p>
              </div>
              ` : ""}
              
              <!-- CTA -->
              <div style="text-align: center;">
                <a href="https://karunastitch.lovable.app/admin" style="display: inline-block; background-color: #8B4513; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                  View in Admin Dashboard
                </a>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} Blouse & Beyond. Admin Notification
                </p>
              </div>
              
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // Log successful email send for rate limiting
    await logEmailSend(supabase, orderId, "send-admin-notification");

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...getCorsHeaders(null) },
      }
    );
  }
};

serve(handler);