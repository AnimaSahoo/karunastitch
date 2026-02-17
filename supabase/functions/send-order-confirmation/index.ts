import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

interface OrderConfirmationRequest {
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
    return { allowed: false, error: "Email already sent recently. Please wait before retrying." };
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
    const { orderId }: OrderConfirmationRequest = await req.json();

    // Validate required field
    if (!orderId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing orderId" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role to verify order exists
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check rate limit before proceeding
    const rateLimitResult = await checkRateLimit(supabase, orderId, "send-order-confirmation");
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ success: false, error: rateLimitResult.error }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch order from database to verify it exists and get the actual email
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, email, full_name, blouse_type, delivery_date, order_date, created_at")
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
        JSON.stringify({ success: false, error: "Confirmation email can only be sent for recent orders" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Use email from database (not from request) to prevent spoofing
    const customerEmail = order.email;
    const customerName = escapeHtml(order.full_name);
    const blouseType = escapeHtml(order.blouse_type);
    const deliveryDate = escapeHtml(order.delivery_date);
    const orderDate = order.order_date;

    if (!customerEmail) {
      return new Response(
        JSON.stringify({ success: false, error: "No email on order" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const formattedOrderDate = new Date(orderDate).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formattedDeliveryDate = deliveryDate || "To be confirmed";

    const emailResponse = await resend.emails.send({
      from: "Karuna Stitch <noreply@karunastitch.com>",
      to: [customerEmail],
      subject: `Order Confirmation - ${orderId.slice(0, 8).toUpperCase()}`,
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
                <h1 style="color: #8B4513; font-size: 28px; margin: 0;">Blouse & Beyond</h1>
                <p style="color: #666; font-size: 14px; margin-top: 8px;">Handcrafted with Love</p>
              </div>
              
              <!-- Greeting -->
              <div style="margin-bottom: 30px;">
                <h2 style="color: #333; font-size: 22px; margin: 0 0 10px 0;">Thank you, ${customerName}!</h2>
                <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0;">
                  Your order has been received and is being processed. We're excited to create your custom blouse!
                </p>
              </div>
              
              <!-- Order Details -->
              <div style="background-color: #faf6f2; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
                <h3 style="color: #8B4513; font-size: 16px; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">Order Details</h3>
                
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
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Blouse Type</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">${blouseType || "Custom Design"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666; font-size: 14px;">Expected Delivery</td>
                    <td style="padding: 8px 0; color: #333; font-size: 14px; text-align: right;">${formattedDeliveryDate}</td>
                  </tr>
                </table>
              </div>
              
              <!-- What's Next -->
              <div style="margin-bottom: 30px;">
                <h3 style="color: #333; font-size: 18px; margin: 0 0 16px 0;">What's Next?</h3>
                <ol style="color: #666; font-size: 14px; line-height: 1.8; padding-left: 20px; margin: 0;">
                  <li>Our team will review your measurements and design preferences</li>
                  <li>You may receive a call for any clarifications</li>
                  <li>Your blouse will be handcrafted with care</li>
                  <li>We'll notify you when your order is ready for delivery</li>
                </ol>
              </div>
              
              <!-- Contact -->
              <div style="background-color: #8B4513; border-radius: 12px; padding: 24px; text-align: center;">
                <p style="color: white; font-size: 14px; margin: 0 0 8px 0;">Have questions about your order?</p>
                <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 0;">
                  Reply to this email or contact us anytime
                </p>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  © ${new Date().getFullYear()} Blouse & Beyond. All rights reserved.
                </p>
              </div>
              
            </div>
          </div>
        </body>
        </html>
      `,
    });

    // Log successful email send for rate limiting
    await logEmailSend(supabase, orderId, "send-order-confirmation");

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