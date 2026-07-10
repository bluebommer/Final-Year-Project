import type { Metadata } from 'next';
import LegalLayout from '@/app/Components/RootComponents/LegalLayout';

export const metadata: Metadata = {
  title: 'Terms of Service — ReadLite',
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="July 2026">
      <h2>1. About ReadLite</h2>
      <p>
        ReadLite is a news-aggregation reading app built as a Final Year Project. It is
        provided as-is, for personal and educational use, with no uptime or accuracy
        guarantees.
      </p>

      <h2>2. Your Account</h2>
      <p>
        You&apos;re responsible for keeping your password confidential. Accounts are locked for
        15 minutes after 5 failed sign-in attempts as a basic anti-abuse measure. You can
        also sign in with Google — we only read the basic profile information (name, email)
        needed to create your account.
      </p>

      <h2>3. Aggregated Content</h2>
      <p>
        Articles shown in ReadLite are pulled from third-party sources (The Guardian,
        Dev.to, The New York Times, GNews, Medium, and any custom RSS feeds you add).
        ReadLite does not own this content and is not responsible for its accuracy — every
        article links back to its original publisher. Respect each publisher&apos;s own terms
        when reading or sharing their content.
      </p>

      <h2>4. Acceptable Use</h2>
      <ul>
        <li>Don&apos;t attempt to disrupt, overload, or scrape the service beyond normal use.</li>
        <li>Don&apos;t use another person&apos;s account without permission.</li>
        <li>Don&apos;t use the custom RSS feed feature to point at content you don&apos;t have the right to redistribute.</li>
      </ul>

      <h2>5. Termination</h2>
      <p>
        You may stop using ReadLite at any time. We may suspend accounts that violate these
        terms.
      </p>

      <h2>6. Changes</h2>
      <p>
        These terms may be updated as the project evolves. Continued use after a change
        means you accept the update.
      </p>

      <h2>7. Contact</h2>
      <p>
        Questions about these terms can be sent to the project maintainer via the contact
        details on the app&apos;s repository.
      </p>
    </LegalLayout>
  );
}
