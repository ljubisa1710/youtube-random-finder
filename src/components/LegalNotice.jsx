const LegalNotice = () => (
  <section className="legal-notice" aria-labelledby="legal-heading">
    <h2 id="legal-heading">Privacy &amp; Terms</h2>
    <p>
      This app uses YouTube API Services to suggest channels and load videos. By using it, you
      agree to be bound by the
      {' '}
      <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer">
        YouTube Terms of Service
      </a>
      {' '}and you acknowledge the
      {' '}
      <a href="https://www.google.com/policies/privacy" target="_blank" rel="noopener noreferrer">
        Google Privacy Policy
      </a>
      .
    </p>
    <p>
      Privacy policy highlights:
    </p>
    <ul>
      <li>
        We only process the search terms you type and the video IDs returned by YouTube; nothing is
        stored or shared outside your browser session.
      </li>
      <li>
        No cookies or tracking pixels are placed by this app, and we do not serve third-party
        advertisements.
      </li>
      <li>
        YouTube may collect additional data when you interact with embedded videos. Review their
        policies for details.
      </li>
      <li>
        We do not request or handle Authorized Data and therefore there is nothing to revoke in your
        Google security settings for this app.
      </li>
    </ul>
    <p>
      Questions or concerns? Contact the developer at
      {' '}
      <a href="mailto:privacy@youtuberandomfinder.app">privacy@youtuberandomfinder.app</a>.
    </p>
  </section>
);

export default LegalNotice;
