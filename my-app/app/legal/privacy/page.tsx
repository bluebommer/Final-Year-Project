import type { Metadata } from 'next';
import LegalLayout from '@/app/Components/RootComponents/LegalLayout';

export const metadata: Metadata = {
  title: 'Privacy Policy — ReadLite',
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="July 2026">
      <h2>1. Information We Collect</h2>
      <ul>
        <li>Account info: name, email, and a hashed (never plaintext) password — or, if you sign in with Google, your Google account ID and basic profile info.</li>
        <li>Preferences: the topics you select and any sources/custom RSS feeds you enable, so your feed can be personalized.</li>
        <li>Saved articles and reading history are stored locally in your browser (IndexedDB), not on our servers.</li>
      </ul>

      <h2>2. How We Use It</h2>
      <p>
        Solely to authenticate you, personalize your article feed, and keep your account
        secure (e.g. rate-limiting repeated failed logins by IP). We don&apos;t sell your data
        or show third-party ads.
      </p>

      <h2>3. Cookies</h2>
      <p>
        ReadLite sets one cookie, <code>auth_token</code>, an httpOnly session cookie that
        expires after 7 days. It&apos;s used purely to keep you signed in — no tracking or
        advertising cookies are set.
      </p>

      <h2>4. Third-Party Sources</h2>
      <p>
        Articles are fetched from The Guardian, Dev.to, The New York Times, GNews, and
        Medium/RSS. Viewing an article may load images directly from that publisher&apos;s own
        servers. We don&apos;t control those publishers&apos; own privacy practices.
      </p>

      <h2>5. Data Retention &amp; Deletion</h2>
      <p>
        Your account data is kept for as long as your account exists. To request deletion
        of your account and associated data, contact the project maintainer — self-serve
        deletion isn&apos;t built into the app yet.
      </p>

      <h2>6. Contact</h2>
      <p>
        Questions about this policy can be sent to the project maintainer via the contact
        details on the app&apos;s repository.
      </p>
    </LegalLayout>
  );
}
