import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderConfirmationRequest {
  orderId: string;
  customerEmail: string;
  customerName: string;
  blouseType: string;
  deliveryDate: string;
  orderDate: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      orderId, 
      customerEmail, 
      customerName, 
      blouseType, 
      deliveryDate,
      orderDate 
    }: OrderConfirmationRequest = await req.json();

    // Validate required fields
    if (!orderId || !customerEmail || !customerName) {
      throw new Error("Missing required fields: orderId, customerEmail, or customerName");
    }

    const formattedOrderDate = new Date(orderDate).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formattedDeliveryDate = deliveryDate 
      ? new Date(deliveryDate).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "To be confirmed";

    const emailResponse = await resend.emails.send({
      from: "Blouse & Beyond <noreply@blouseandbeyond.lovable.app>",
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

    console.log("Order confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-order-confirmation function:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
