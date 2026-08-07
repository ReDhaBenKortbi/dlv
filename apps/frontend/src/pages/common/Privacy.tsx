import { Link } from "react-router-dom";

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

const Privacy = () => {
  return (
    <div className="min-h-screen bg-base-200 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="card bg-base-100 shadow-xl rounded-2xl border border-base-200">
          <div className="card-body space-y-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">Privacy Policy</h1>
              <p className="text-xs opacity-50">
                Last updated: August 7, 2026
              </p>
            </div>

            <Section title="1. Who we are">
              <p>
                Digital Learning Vault ("DLV", "we", "us") operates this
                website and the account you create on it. For any privacy
                question, correction, or deletion request, contact us at{" "}
                <a
                  href="mailto:ridhabenkortbi@gmail.com"
                  className="link link-primary"
                >
                  ridhabenkortbi@gmail.com
                </a>
                .
              </p>
            </Section>

            <Section title="2. Information we collect">
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Account information:</strong> full name, email
                  address, and password (stored as a salted hash — we never
                  store or can see your plain-text password).
                </li>
                <li>
                  <strong>Subscription &amp; payment records:</strong> your
                  plan (Free/Pro/Gold), payment status, and amount charged.
                  We never receive or store your card details — those are
                  entered directly on Chargily's payment page.
                </li>
                <li>
                  <strong>Content you create:</strong> book reviews and
                  ratings, and any support ticket you submit to us.
                </li>
                <li>
                  <strong>Session data:</strong> a single security cookie
                  that keeps you signed in (see "Cookies" below).
                </li>
              </ul>
            </Section>

            <Section title="3. How we use your information">
              <p>
                We use your information only to operate the service: to
                authenticate you, grant access to the books your plan
                entitles you to, process and record subscription payments,
                respond to support requests, and maintain the security and
                reliability of the platform. We do not sell your data or use
                it for advertising.
              </p>
            </Section>

            <Section title="4. Cookies">
              <p>
                We use exactly one cookie: an <code>httpOnly</code> session
                cookie that keeps you logged in between visits. It cannot be
                read by JavaScript and is not used for tracking or
                advertising. We do not use analytics or advertising cookies.
              </p>
            </Section>

            <Section title="5. Who we share information with">
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Chargily</strong> (payment processor, Algeria) —
                  receives your name, email, and payment amount to process a
                  subscription payment.
                </li>
                <li>
                  <strong>Cloudinary</strong> — hosts book cover images; does
                  not receive your personal account data.
                </li>
                <li>
                  <strong>Neon</strong> — hosts our database infrastructure.
                </li>
                <li>
                  <strong>Sentry</strong> (if enabled) — receives technical
                  crash/error diagnostics to help us fix bugs. It does not
                  receive your password or payment details.
                </li>
              </ul>
              <p>
                We do not sell or rent your personal information to anyone.
              </p>
            </Section>

            <Section title="6. Data retention">
              <p>
                We keep your account data for as long as your account is
                active. If you ask us to delete your account, we will delete
                or anonymize your personal data within a reasonable time,
                except where we're required to keep payment records for
                legal or accounting purposes.
              </p>
            </Section>

            <Section title="7. Your rights">
              <p>
                You can ask us to access, correct, or delete your personal
                data at any time by emailing{" "}
                <a
                  href="mailto:ridhabenkortbi@gmail.com"
                  className="link link-primary"
                >
                  ridhabenkortbi@gmail.com
                </a>
                . You can also update your name and password directly from
                your Profile page.
              </p>
            </Section>

            <Section title="8. Children's privacy">
              <p>
                This service is not directed at children under 16. If you
                believe a child has created an account without appropriate
                consent, contact us and we will remove it.
              </p>
            </Section>

            <Section title="9. Changes to this policy">
              <p>
                If we make material changes to this policy, we'll update the
                "Last updated" date above. Continued use of the service after
                a change means you accept the updated policy.
              </p>
            </Section>

            <div className="pt-4 border-t border-base-200 text-sm">
              <Link to="/terms" className="link link-primary">
                Terms of Service
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

export default Privacy;
