export type PageTemplate = {
  id: string
  name: string
  description: string
  category: string
  html: string
  css: string
  preview: string
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: 'default',
    name: 'Default Newsletter',
    description: 'Simple newsletter signup form - automatically applied to all new links',
    category: 'Default',
    preview: '📧',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Join our newsletter for exclusive updates">
  <title>Before you go...</title>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="icon">📧</div>
      <h1>Before you go...</h1>
      <p class="subtitle">Join our newsletter for exclusive updates and content!</p>

      <form id="newsletter-form" class="form">
        <label for="email" class="label">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="you@example.com"
          required
          aria-label="Email address"
        >
        <button type="submit" class="btn-primary">Subscribe & Continue</button>
      </form>

      <button id="skip-btn" class="skip-link">Continue without signing up →</button>

      <p class="privacy">We respect your privacy. Unsubscribe at any time.</p>
    </div>
  </div>

  <script>
    // Use injected data or fetch as fallback
    let linkId = window.__LINK_DATA__?.linkId || null;
    let originalUrl = window.__LINK_DATA__?.originalUrl || null;

    async function fetchLinkData() {
      if (linkId && originalUrl) return; // Already have data

      const shortCode = window.location.pathname.split('/')[1];
      try {
        const res = await fetch('/api/redirect/' + shortCode);
        const data = await res.json();
        if (res.ok) {
          linkId = data.linkId;
          originalUrl = data.originalUrl;
        }
      } catch (err) {
        console.error('Failed to fetch link data');
      }
    }

    fetchLinkData();

    document.getElementById('newsletter-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Form submitted. LinkId:', linkId, 'OriginalUrl:', originalUrl);

      if (!linkId || !originalUrl) {
        alert('Error: Link data not available. Please refresh the page.');
        return;
      }

      const email = document.getElementById('email').value;
      const btn = e.target.querySelector('button');
      btn.textContent = 'Subscribing...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, linkId }),
        });

        const data = await res.json();
        console.log('Newsletter response:', data);

        if (res.ok && originalUrl) {
          console.log('Redirecting to:', originalUrl);
          window.location.href = originalUrl;
        } else {
          alert('Failed to subscribe. Please try again.');
          btn.textContent = 'Subscribe & Continue';
          btn.disabled = false;
        }
      } catch (err) {
        console.error('Subscription error:', err);
        alert('An error occurred. Please try again.');
        btn.textContent = 'Subscribe & Continue';
        btn.disabled = false;
      }
    });

    document.getElementById('skip-btn').addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Skip clicked. Redirecting to:', originalUrl);

      if (!originalUrl) {
        alert('Error: Redirect URL not available. Please refresh the page.');
        return;
      }

      window.location.href = originalUrl;
    });
  </script>
</body>
</html>`,
    css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  line-height: 1.6;
}

.container {
  width: 100%;
  max-width: 450px;
}

.card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.icon {
  font-size: 64px;
  margin-bottom: 20px;
}

h1 {
  font-size: 28px;
  color: #1a202c;
  margin-bottom: 12px;
  font-weight: 700;
}

.subtitle {
  font-size: 16px;
  color: #4a5568;
  margin-bottom: 30px;
}

.form {
  margin-bottom: 20px;
}

.label {
  display: block;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

input[type="email"] {
  width: 100%;
  padding: 14px 16px;
  font-size: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  outline: none;
}

input[type="email"]:focus {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.btn-primary {
  width: 100%;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.6);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.skip-link {
  display: block;
  width: 100%;
  background: none;
  border: none;
  font-size: 15px;
  color: #8b5cf6;
  text-decoration: none;
  font-weight: 500;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.skip-link:hover {
  color: #7c3aed;
}

.privacy {
  font-size: 13px;
  color: #718096;
  border-top: 1px solid #e2e8f0;
  padding-top: 20px;
}

@media (max-width: 600px) {
  .card {
    padding: 30px 25px;
  }

  h1 {
    font-size: 24px;
  }

  .subtitle {
    font-size: 14px;
  }

  .icon {
    font-size: 48px;
  }
}`
  },
  {
    id: 'minimal',
    name: 'Minimal & Clean',
    description: 'Simple, trust-focused design perfect for professional brands',
    category: 'Conversion: 15-25%',
    preview: '📬',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Join our exclusive newsletter for insider tips and updates">
  <title>Join Our Newsletter</title>
</head>
<body>
  <div class="container">
    <div class="content">
      <div class="icon">📬</div>
      <h1>One More Thing...</h1>
      <p class="subtitle">Join 10,000+ subscribers getting exclusive insights delivered weekly</p>

      <form id="newsletter-form" class="form">
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email address"
          required
          aria-label="Email address"
        >
        <button type="submit" class="btn-primary">Get Free Access</button>
      </form>

      <p class="privacy">🔒 We respect your privacy. Unsubscribe anytime.</p>

      <a href="#" id="skip-btn" class="skip-link">Continue without subscribing →</a>
    </div>
  </div>

  <script>
    // Use injected data or fetch as fallback
    let linkId = window.__LINK_DATA__?.linkId || null;
    let originalUrl = window.__LINK_DATA__?.originalUrl || null;

    async function fetchLinkData() {
      if (linkId && originalUrl) return; // Already have data

      const shortCode = window.location.pathname.split('/')[1];
      try {
        const res = await fetch('/api/redirect/' + shortCode);
        const data = await res.json();
        if (res.ok) {
          linkId = data.linkId;
          originalUrl = data.originalUrl;
        }
      } catch (err) {
        console.error('Failed to fetch link data');
      }
    }

    fetchLinkData();

    document.getElementById('newsletter-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Form submitted. LinkId:', linkId, 'OriginalUrl:', originalUrl);

      if (!linkId || !originalUrl) {
        alert('Error: Link data not available. Please refresh the page.');
        return;
      }

      const email = document.getElementById('email').value;
      const btn = e.target.querySelector('button');
      btn.textContent = 'Subscribing...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, linkId }),
        });

        const data = await res.json();
        console.log('Newsletter response:', data);

        if (res.ok && originalUrl) {
          console.log('Redirecting to:', originalUrl);
          window.location.href = originalUrl;
        } else {
          alert('Failed to subscribe. Please try again.');
          btn.textContent = 'Get Free Access';
          btn.disabled = false;
        }
      } catch (err) {
        console.error('Subscription error:', err);
        alert('An error occurred. Please try again.');
        btn.textContent = 'Get Free Access';
        btn.disabled = false;
      }
    });

    document.getElementById('skip-btn').addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Skip clicked. Redirecting to:', originalUrl);

      if (!originalUrl) {
        alert('Error: Redirect URL not available. Please refresh the page.');
        return;
      }

      window.location.href = originalUrl;
    });
  </script>
</body>
</html>`,
    css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  line-height: 1.6;
}

.container {
  width: 100%;
  max-width: 500px;
}

.content {
  background: white;
  border-radius: 20px;
  padding: 50px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.icon {
  font-size: 64px;
  margin-bottom: 20px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

h1 {
  font-size: 36px;
  color: #1a202c;
  margin-bottom: 15px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.subtitle {
  font-size: 18px;
  color: #4a5568;
  margin-bottom: 35px;
  line-height: 1.5;
}

.form {
  margin-bottom: 25px;
}

input[type="email"] {
  width: 100%;
  padding: 16px 20px;
  font-size: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 15px;
  transition: all 0.3s ease;
  outline: none;
}

input[type="email"]:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-primary {
  width: 100%;
  padding: 16px 32px;
  font-size: 18px;
  font-weight: 600;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.privacy {
  font-size: 14px;
  color: #718096;
  margin-bottom: 20px;
}

.skip-link {
  display: inline-block;
  font-size: 15px;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  padding: 10px;
  transition: all 0.3s ease;
}

.skip-link:hover {
  color: #764ba2;
  transform: translateX(5px);
}

@media (max-width: 600px) {
  .content {
    padding: 40px 30px;
  }

  h1 {
    font-size: 28px;
  }

  .subtitle {
    font-size: 16px;
  }

  .icon {
    font-size: 48px;
  }
}`
  },
  {
    id: 'benefits',
    name: 'Benefits-Focused',
    description: 'Value-driven design with highlighted features and trust signals',
    category: 'Conversion: 20-35%',
    preview: '✨',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Join thousands of subscribers and get exclusive content delivered to your inbox">
  <title>Subscribe for Exclusive Content</title>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="badge">FREE NEWSLETTER</div>

      <h1>Get Insider Access</h1>
      <p class="lead">Join 25,000+ smart subscribers who receive our best content, tips, and exclusive offers every week.</p>

      <div class="benefits">
        <div class="benefit">
          <span class="benefit-icon">✨</span>
          <div class="benefit-text">
            <h3>Weekly Insights</h3>
            <p>Expert tips and strategies delivered every Monday</p>
          </div>
        </div>

        <div class="benefit">
          <span class="benefit-icon">🎁</span>
          <div class="benefit-text">
            <h3>Exclusive Resources</h3>
            <p>Free downloads, templates, and tools for subscribers</p>
          </div>
        </div>

        <div class="benefit">
          <span class="benefit-icon">🚀</span>
          <div class="benefit-text">
            <h3>Early Access</h3>
            <p>Be the first to know about new products and features</p>
          </div>
        </div>
      </div>

      <form id="newsletter-form" class="form">
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your best email"
          required
          aria-label="Email address"
        >
        <button type="submit" class="btn-submit">
          <span>Subscribe Now</span>
          <span class="arrow">→</span>
        </button>
      </form>

      <div class="trust-signals">
        <div class="trust-item">
          <strong>25,000+</strong>
          <span>Subscribers</span>
        </div>
        <div class="divider"></div>
        <div class="trust-item">
          <strong>4.9/5</strong>
          <span>Rating</span>
        </div>
        <div class="divider"></div>
        <div class="trust-item">
          <strong>100%</strong>
          <span>Free</span>
        </div>
      </div>

      <p class="footer-text">No spam, ever. Unsubscribe with one click anytime.</p>

      <a href="#" id="skip-btn" class="skip-link">Skip and continue →</a>
    </div>
  </div>

  <script>
    // Use injected data or fetch as fallback
    let linkId = window.__LINK_DATA__?.linkId || null;
    let originalUrl = window.__LINK_DATA__?.originalUrl || null;

    async function fetchLinkData() {
      if (linkId && originalUrl) return; // Already have data

      const shortCode = window.location.pathname.split('/')[1];
      try {
        const res = await fetch('/api/redirect/' + shortCode);
        const data = await res.json();
        if (res.ok) {
          linkId = data.linkId;
          originalUrl = data.originalUrl;
        }
      } catch (err) {
        console.error('Failed to fetch link data');
      }
    }

    fetchLinkData();

    document.getElementById('newsletter-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Form submitted. LinkId:', linkId, 'OriginalUrl:', originalUrl);

      if (!linkId || !originalUrl) {
        alert('Error: Link data not available. Please refresh the page.');
        return;
      }

      const email = document.getElementById('email').value;
      const btn = e.target.querySelector('button');
      const btnText = btn.querySelector('span');
      btnText.textContent = 'Subscribing...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, linkId }),
        });

        const data = await res.json();
        console.log('Newsletter response:', data);

        if (res.ok && originalUrl) {
          console.log('Redirecting to:', originalUrl);
          window.location.href = originalUrl;
        } else {
          alert('Failed to subscribe. Please try again.');
          btnText.textContent = 'Subscribe Now';
          btn.disabled = false;
        }
      } catch (err) {
        console.error('Subscription error:', err);
        alert('An error occurred. Please try again.');
        btnText.textContent = 'Subscribe Now';
        btn.disabled = false;
      }
    });

    document.getElementById('skip-btn').addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Skip clicked. Redirecting to:', originalUrl);

      if (!originalUrl) {
        alert('Error: Redirect URL not available. Please refresh the page.');
        return;
      }

      window.location.href = originalUrl;
    });
  </script>
</body>
</html>`,
    css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(to bottom, #f7fafc 0%, #edf2f7 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  line-height: 1.6;
}

.container {
  width: 100%;
  max-width: 600px;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 50px 45px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  position: relative;
}

.badge {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 25px;
}

h1 {
  font-size: 40px;
  color: #1a202c;
  margin-bottom: 15px;
  font-weight: 800;
  line-height: 1.2;
}

.lead {
  font-size: 18px;
  color: #4a5568;
  margin-bottom: 35px;
  line-height: 1.6;
}

.benefits {
  margin-bottom: 35px;
}

.benefit {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 20px;
  background: #f7fafc;
  border-radius: 12px;
  margin-bottom: 15px;
  transition: all 0.3s ease;
}

.benefit:hover {
  background: #edf2f7;
  transform: translateX(5px);
}

.benefit-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.benefit-text h3 {
  font-size: 18px;
  color: #2d3748;
  margin-bottom: 5px;
  font-weight: 600;
}

.benefit-text p {
  font-size: 14px;
  color: #718096;
  line-height: 1.5;
}

.form {
  margin-bottom: 30px;
}

input[type="email"] {
  width: 100%;
  padding: 18px 20px;
  font-size: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 12px;
  transition: all 0.3s ease;
  outline: none;
}

input[type="email"]:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.btn-submit {
  width: 100%;
  padding: 18px 32px;
  font-size: 18px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

.btn-submit:active {
  transform: translateY(0);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.arrow {
  font-size: 20px;
  transition: transform 0.3s ease;
}

.btn-submit:hover .arrow {
  transform: translateX(5px);
}

.trust-signals {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 25px 0;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 20px;
}

.trust-item {
  text-align: center;
}

.trust-item strong {
  display: block;
  font-size: 24px;
  color: #667eea;
  font-weight: 700;
  margin-bottom: 5px;
}

.trust-item span {
  font-size: 13px;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.divider {
  width: 1px;
  height: 40px;
  background: #e2e8f0;
}

.footer-text {
  text-align: center;
  font-size: 14px;
  color: #718096;
  margin-bottom: 20px;
}

.skip-link {
  display: block;
  text-align: center;
  font-size: 15px;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  padding: 10px;
  transition: all 0.3s ease;
}

.skip-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

@media (max-width: 600px) {
  .card {
    padding: 40px 30px;
  }

  h1 {
    font-size: 32px;
  }

  .lead {
    font-size: 16px;
  }

  .benefit {
    padding: 15px;
  }

  .benefit-icon {
    font-size: 28px;
  }

  .trust-signals {
    flex-direction: column;
    gap: 20px;
  }

  .divider {
    display: none;
  }

  .trust-item {
    width: 100%;
  }
}`
  },
  {
    id: 'urgency',
    name: 'Urgency & FOMO',
    description: 'High-converting design with countdown timer and scarcity elements',
    category: 'Conversion: 25-45%',
    preview: '🔥',
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Limited time offer - Subscribe now and get instant access to exclusive content">
  <title>Limited Time Offer - Subscribe Now</title>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="alert-banner">
        <span class="pulse-dot"></span>
        <span class="banner-text">LIMITED TIME OFFER</span>
      </div>

      <div class="timer-section">
        <h2 class="timer-label">Your Exclusive Access Expires In:</h2>
        <div class="timer">
          <div class="time-block">
            <span class="time-value" id="minutes">05</span>
            <span class="time-label">MIN</span>
          </div>
          <span class="time-separator">:</span>
          <div class="time-block">
            <span class="time-value" id="seconds">00</span>
            <span class="time-label">SEC</span>
          </div>
        </div>
      </div>

      <h1>Don't Miss Out!</h1>
      <p class="subtitle">Subscribe now to unlock instant access to premium content, exclusive deals, and insider updates that 95% of visitors will never see.</p>

      <div class="value-props">
        <div class="prop">
          <span class="check">✓</span>
          <span>Instant access to premium content library</span>
        </div>
        <div class="prop">
          <span class="check">✓</span>
          <span>Exclusive member-only discounts up to 50% OFF</span>
        </div>
        <div class="prop">
          <span class="check">✓</span>
          <span>Weekly insider tips from industry experts</span>
        </div>
        <div class="prop">
          <span class="check">✓</span>
          <span>Early bird access to new products & features</span>
        </div>
      </div>

      <form id="newsletter-form" class="form">
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email to claim your spot"
          required
          aria-label="Email address"
        >
        <button type="submit" class="btn-claim">
          <span class="btn-text">🔥 Claim My Free Access Now</span>
        </button>
      </form>

      <div class="social-proof">
        <div class="avatars">
          <div class="avatar">👤</div>
          <div class="avatar">👤</div>
          <div class="avatar">👤</div>
          <div class="avatar">👤</div>
          <div class="avatar">👤</div>
        </div>
        <p class="social-text"><strong>1,247 people</strong> subscribed in the last 24 hours</p>
      </div>

      <p class="guarantee">🔒 100% Privacy Guaranteed. Unsubscribe anytime with one click.</p>

      <a href="#" id="skip-btn" class="skip-link">No thanks, I'll pass on this exclusive offer →</a>
    </div>
  </div>

  <script>
    // Use injected data or fetch as fallback
    let linkId = window.__LINK_DATA__?.linkId || null;
    let originalUrl = window.__LINK_DATA__?.originalUrl || null;
    let timeLeft = 300;

    async function fetchLinkData() {
      if (linkId && originalUrl) return; // Already have data

      const shortCode = window.location.pathname.split('/')[1];
      try {
        const res = await fetch('/api/redirect/' + shortCode);
        const data = await res.json();
        if (res.ok) {
          linkId = data.linkId;
          originalUrl = data.originalUrl;
        }
      } catch (err) {
        console.error('Failed to fetch link data');
      }
    }

    fetchLinkData();

    function updateTimer() {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;

      document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
      document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');

      if (timeLeft > 0) {
        timeLeft--;
      } else {
        clearInterval(timerInterval);
      }
    }

    const timerInterval = setInterval(updateTimer, 1000);
    updateTimer();

    document.getElementById('newsletter-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      console.log('Form submitted. LinkId:', linkId, 'OriginalUrl:', originalUrl);

      if (!linkId || !originalUrl) {
        alert('Error: Link data not available. Please refresh the page.');
        return;
      }

      const email = document.getElementById('email').value;
      const btn = e.target.querySelector('button');
      const btnText = btn.querySelector('.btn-text');
      btnText.textContent = '⏳ Securing your spot...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, linkId }),
        });

        const data = await res.json();
        console.log('Newsletter response:', data);

        if (res.ok && originalUrl) {
          console.log('Redirecting to:', originalUrl);
          window.location.href = originalUrl;
        } else {
          alert('Failed to subscribe. Please try again.');
          btnText.textContent = '🔥 Claim My Free Access Now';
          btn.disabled = false;
        }
      } catch (err) {
        console.error('Subscription error:', err);
        alert('An error occurred. Please try again.');
        btnText.textContent = '🔥 Claim My Free Access Now';
        btn.disabled = false;
      }
    });

    document.getElementById('skip-btn').addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Skip clicked. Redirecting to:', originalUrl);

      if (!originalUrl) {
        alert('Error: Redirect URL not available. Please refresh the page.');
        return;
      }

      window.location.href = originalUrl;
    });
  </script>
</body>
</html>`,
    css: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #7e22ce 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  line-height: 1.6;
}

.container {
  width: 100%;
  max-width: 650px;
}

.card {
  background: white;
  border-radius: 20px;
  padding: 0;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.alert-banner {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 15px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.pulse-dot {
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.banner-text {
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 1.5px;
}

.timer-section {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  padding: 30px;
  text-align: center;
  border-bottom: 3px solid #f59e0b;
}

.timer-label {
  font-size: 16px;
  color: #92400e;
  margin-bottom: 15px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.timer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.time-block {
  background: white;
  padding: 15px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  min-width: 80px;
}

.time-value {
  display: block;
  font-size: 36px;
  font-weight: 800;
  color: #dc2626;
  line-height: 1;
}

.time-label {
  display: block;
  font-size: 11px;
  color: #6b7280;
  font-weight: 600;
  margin-top: 5px;
  letter-spacing: 1px;
}

.time-separator {
  font-size: 36px;
  font-weight: 800;
  color: #92400e;
}

.card > h1,
.card > .subtitle,
.value-props,
.form,
.social-proof,
.guarantee,
.skip-link {
  padding: 0 40px;
}

h1 {
  font-size: 42px;
  color: #1a202c;
  margin: 35px 0 20px;
  font-weight: 800;
  line-height: 1.2;
  text-align: center;
}

.subtitle {
  font-size: 18px;
  color: #4a5568;
  margin-bottom: 30px;
  line-height: 1.6;
  text-align: center;
}

.value-props {
  margin-bottom: 35px;
}

.prop {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px 20px;
  margin-bottom: 12px;
  background: #f0fdf4;
  border-left: 4px solid #10b981;
  border-radius: 8px;
}

.check {
  font-size: 20px;
  color: #10b981;
  font-weight: 700;
  flex-shrink: 0;
}

.prop span:last-child {
  font-size: 16px;
  color: #1f2937;
  font-weight: 500;
}

.form {
  margin-bottom: 30px;
}

input[type="email"] {
  width: 100%;
  padding: 18px 20px;
  font-size: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  margin-bottom: 15px;
  transition: all 0.3s ease;
  outline: none;
}

input[type="email"]:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

.btn-claim {
  width: 100%;
  padding: 20px 32px;
  font-size: 20px;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
  animation: pulse-button 2s infinite;
}

@keyframes pulse-button {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

.btn-claim:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 12px 30px rgba(239, 68, 68, 0.6);
  animation: none;
}

.btn-claim:active {
  transform: translateY(0) scale(1);
}

.btn-claim:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  animation: none;
}

.social-proof {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 25px 40px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 20px;
}

.avatars {
  display: flex;
  margin-left: -10px;
}

.avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 3px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: -10px;
  font-size: 18px;
}

.social-text {
  font-size: 14px;
  color: #4b5563;
}

.social-text strong {
  color: #1f2937;
  font-weight: 700;
}

.guarantee {
  text-align: center;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 20px;
}

.skip-link {
  display: block;
  text-align: center;
  font-size: 14px;
  color: #9ca3af;
  text-decoration: none;
  padding: 15px 40px 40px;
  transition: all 0.3s ease;
}

.skip-link:hover {
  color: #6b7280;
  text-decoration: underline;
}

@media (max-width: 600px) {
  .card > h1,
  .card > .subtitle,
  .value-props,
  .form,
  .guarantee {
    padding: 0 25px;
  }

  .social-proof {
    padding: 20px 25px;
    flex-direction: column;
    gap: 10px;
  }

  .skip-link {
    padding: 15px 25px 35px;
  }

  h1 {
    font-size: 32px;
    margin-top: 25px;
  }

  .subtitle {
    font-size: 16px;
  }

  .timer-section {
    padding: 20px;
  }

  .time-block {
    min-width: 70px;
    padding: 12px 15px;
  }

  .time-value {
    font-size: 28px;
  }

  .btn-claim {
    font-size: 18px;
    padding: 18px 28px;
  }

  .prop {
    padding: 12px 15px;
  }

  .prop span:last-child {
    font-size: 14px;
  }
}`
  }
]