import { Link } from "react-router-dom";
import { SUPPORT_EMAIL } from "@/constants/contact";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="space-y-2">
    <h2 className="text-xl font-semibold">{title}</h2>
    <div className="text-sm leading-relaxed opacity-80 space-y-2">
      {children}
    </div>
  </section>
);

const Terms = () => {
  return (
    <div className="min-h-screen bg-base-200 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="card bg-base-100 shadow-xl rounded-2xl border border-base-200">
          <div className="card-body space-y-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">Terms of Service</h1>
              <p className="text-xs opacity-50">
                Last updated: August 7, 2026
              </p>
            </div>

            <Section title="1. Acceptance of these terms">
              <p>
                By creating an account or using Digital Learning Vault
                ("DLV", "we", "us"), you agree to these Terms of Service. If
                you don't agree, please don't use the service.
              </p>
            </Section>

            <Section title="2. The service">
              <p>
                DLV is a digital library of educational books, organized
                into Free, Pro, and Gold tiers. Which books you can open
                depends on your account's subscription plan. Book content is
                provided for your personal learning use only.
              </p>
            </Section>

            <Section title="3. Your account">
              <p>
                You're responsible for the accuracy of the information you
                register with and for keeping your password confidential.
                You're responsible for all activity that happens under your
                account.
              </p>
            </Section>

            <Section title="4. Subscriptions & payments">
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Paid plans (Pro, Gold) are billed through Chargily. We
                  never see or store your card details.
                </li>
                <li>
                  A successful payment grants access to your chosen plan for
                  one month from the date of payment. Access does not renew
                  automatically — you'll need to make a new payment to
                  extend it.
                </li>
                <li>
                  Refunds are considered on a case-by-case basis — contact{" "}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="link link-primary"
                  >
                    {SUPPORT_EMAIL}
                  </a>{" "}
                  if you believe you were charged in error.
                </li>
              </ul>
            </Section>

            <Section title="5. Acceptable use">
              <p>
                Book content is for your personal use. You agree not to
                copy, redistribute, resell, or bulk-download book content,
                or attempt to bypass the access controls that gate content
                by subscription tier.
              </p>
            </Section>

            <Section title="6. Reviews & support tickets">
              <p>
                Content you submit — reviews, ratings, and support messages
                — must be accurate and respectful. We may remove content
                that violates this or is abusive, and may suspend accounts
                that misuse the review or support system.
              </p>
            </Section>

            <Section title="7. Termination">
              <p>
                You may stop using the service at any time. We may suspend
                or terminate an account that violates these terms, including
                attempts to bypass tier-based access controls or abuse of
                the platform.
              </p>
            </Section>

            <Section title="8. Disclaimer & limitation of liability">
              <p>
                The service is provided "as is." We do our best to keep it
                available and accurate but don't guarantee uninterrupted
                access. To the extent permitted by law, we're not liable for
                indirect or incidental damages arising from your use of the
                service.
              </p>
            </Section>

            <Section title="9. Governing law">
              <p>
                These terms are governed by the laws of Algeria, without
                regard to conflict-of-law principles.
              </p>
            </Section>

            <Section title="10. Changes to these terms">
              <p>
                If we make material changes, we'll update the "Last updated"
                date above. Continued use of the service after a change
                means you accept the updated terms.
              </p>
            </Section>

            <Section title="11. Contact">
              <p>
                Questions about these terms? Email{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="link link-primary"
                >
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
            </Section>

            <div className="pt-4 border-t border-base-200 text-sm">
              <Link to="/privacy" className="link link-primary">
                Privacy Policy
              </Link>
              <span className="mx-2 opacity-40">·</span>
              <Link to="/" className="link link-primary">
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
