import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link to="/">
            <Button variant="ghost" size="icon" aria-label="Back to home">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              Terms & Conditions
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none space-y-8">
          {/* 1. Overview */}
          <section>
            <h2 className="text-xl font-heading font-semibold text-foreground border-b border-border pb-2">
              1. Overview of Services
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Karuna Stitch ("we," "us," or "our") provides custom saree blouse stitching services.
              Our artisans, including differently-abled women in Odisha, India, handcraft each blouse
              according to your specifications. By using our website and placing an order, you agree
              to these Terms & Conditions.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              These terms govern your use of our website, the ordering process, and the delivery of
              custom-stitched garments. Please read them carefully before creating an account or
              placing an order.
            </p>
          </section>

          {/* 2. User Responsibilities */}
          <section>
            <h2 className="text-xl font-heading font-semibold text-foreground border-b border-border pb-2">
              2. User Responsibilities
            </h2>
            <p className="text-muted-foreground leading-relaxed">As a customer, you are responsible for:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>
                <strong>Accurate Measurements:</strong> Providing precise body measurements as guided
                by our measurement tools. Incorrect measurements may result in garments that do not
                fit properly, and Karuna Stitch cannot be held liable for sizing issues arising from
                inaccurate information.
              </li>
              <li>
                <strong>Correct Information:</strong> Ensuring all personal details, contact
                information, and shipping addresses are accurate and up to date.
              </li>
              <li>
                <strong>Design Specifications:</strong> Clearly communicating your design preferences,
                fabric requirements, and any special instructions at the time of ordering.
              </li>
              <li>
                <strong>Account Security:</strong> Maintaining the confidentiality of your login
                credentials and notifying us immediately of any unauthorized account access.
              </li>
            </ul>
          </section>

          {/* 3. Orders, Payments & Turnaround */}
          <section>
            <h2 className="text-xl font-heading font-semibold text-foreground border-b border-border pb-2">
              3. Orders, Payments & Turnaround Times
            </h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>
                <strong>Order Confirmation:</strong> Once your order is placed, you will receive an
                email confirmation with your order details. This confirmation does not guarantee
                acceptance — we reserve the right to decline orders at our discretion.
              </li>
              <li>
                <strong>Pricing:</strong> All prices are listed on our website and are subject to
                change without prior notice. The price at the time of order placement applies.
              </li>
              <li>
                <strong>Payment:</strong> Payment is expected as agreed upon during the ordering
                process. We accept the payment methods displayed at checkout.
              </li>
              <li>
                <strong>Turnaround Times:</strong> Estimated delivery times are provided at the time
                of order and may vary based on design complexity, current workload, and shipping
                destination. We will communicate any significant delays promptly.
              </li>
              <li>
                <strong>Shipping:</strong> Shipping costs and methods will be communicated during the
                order process. Karuna Stitch is not responsible for delays caused by shipping carriers.
              </li>
            </ul>
          </section>

          {/* 4. Alterations, Returns & Limitations */}
          <section>
            <h2 className="text-xl font-heading font-semibold text-foreground border-b border-border pb-2">
              4. Alterations, Returns & Limitations
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Due to the custom nature of our products, please note the following:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>
                <strong>Custom Garments:</strong> All blouses are made-to-order based on your
                specifications. As such, returns or exchanges for change of mind are generally not
                accepted.
              </li>
              <li>
                <strong>Defects & Errors:</strong> If your garment arrives with a manufacturing defect
                or differs significantly from your order specifications, please contact us within 7
                days of delivery. We will assess the issue and offer a suitable resolution, which may
                include alterations or a remake at no additional cost.
              </li>
              <li>
                <strong>Alterations:</strong> Minor alterations due to measurement discrepancies
                provided by the customer may incur additional charges.
              </li>
              <li>
                <strong>Fabric Provided by Customer:</strong> If you provide your own fabric and it is
                damaged during the stitching process due to fabric quality, Karuna Stitch will not be
                held liable for replacement.
              </li>
            </ul>
          </section>

          {/* 5. Intellectual Property */}
          <section>
            <h2 className="text-xl font-heading font-semibold text-foreground border-b border-border pb-2">
              5. Intellectual Property
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              All content on the Karuna Stitch website — including but not limited to text, images,
              logos, design templates, photographs, and graphics — is the intellectual property of
              Karuna Stitch or its licensors and is protected by applicable copyright and trademark
              laws.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You may not reproduce, distribute, modify, or commercially use any content from our
              website without prior written consent. Custom designs created by our team for your
              orders remain the intellectual property of Karuna Stitch, though you retain full rights
              to use the physical garment.
            </p>
          </section>

          {/* 6. Limitation of Liability */}
          <section>
            <h2 className="text-xl font-heading font-semibold text-foreground border-b border-border pb-2">
              6. Limitation of Liability
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by applicable law, Karuna Stitch shall not be liable
              for any indirect, incidental, special, consequential, or punitive damages arising from
              or related to your use of our services or products.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our total liability for any claim arising from an order shall not exceed the amount
              paid by you for that specific order. We are not responsible for delays or failures
              caused by events beyond our reasonable control, including but not limited to natural
              disasters, supply chain disruptions, or postal service delays.
            </p>
          </section>

          {/* 7. Privacy & Data Protection */}
          <section>
            <h2 className="text-xl font-heading font-semibold text-foreground border-b border-border pb-2">
              7. Privacy & Data Protection
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We are committed to protecting your personal information. When you create an account or
              place an order, we collect only the information necessary to fulfill your order and
              provide our services. This includes your name, email, phone number, shipping address,
              and body measurements.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell, rent, or share your personal information with third parties for
              marketing purposes. Your data is stored securely using industry-standard encryption
              and access controls. For more details, please refer to our Privacy Policy.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to request access to, correction of, or deletion of your personal
              data at any time by contacting us at{" "}
              <a href="mailto:hello@karunastitch.com" className="text-primary hover:underline">
                hello@karunastitch.com
              </a>.
            </p>
          </section>

          {/* 8. Governing Law */}
          <section>
            <h2 className="text-xl font-heading font-semibold text-foreground border-b border-border pb-2">
              8. Governing Law
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms & Conditions shall be governed by and construed in accordance with the
              laws of the United States of America. Any disputes arising from these terms or your
              use of our services shall be resolved in the appropriate courts within the United
              States.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              If any provision of these terms is found to be invalid or unenforceable, the remaining
              provisions shall continue in full force and effect.
            </p>
          </section>

          {/* 9. Changes */}
          <section>
            <h2 className="text-xl font-heading font-semibold text-foreground border-b border-border pb-2">
              9. Changes to These Terms
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these Terms & Conditions at any time. Changes will be
              posted on this page with an updated revision date. Your continued use of our services
              after changes are posted constitutes acceptance of the revised terms.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-muted/50 rounded-xl p-6 border border-border">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-3">
              Questions?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms & Conditions, please contact us at{" "}
              <a href="mailto:hello@karunastitch.com" className="text-primary hover:underline">
                hello@karunastitch.com
              </a>{" "}
              or call us at{" "}
              <a href="tel:+15103810843" className="text-primary hover:underline">
                +1 (510) 381-0843
              </a>.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 mb-8">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Karuna Stitch. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
