# Analytics Setup Guide

## Google Analytics Setup

### Step 1: Get Google Analytics Tracking ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a property or use existing one
3. Get your Measurement ID (format: `G-XXXXXXXXXX`)

### Step 2: Add to index.html

Add this script before `</head>` in `frontend/index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

### Step 3: Environment Variable (Optional)

For different environments, use environment variable:

```html
<script>
  const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID);
</script>
```

Add to `.env`:
```env
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## Plausible Analytics Setup

### Step 1: Get Plausible Domain

1. Sign up at [Plausible Analytics](https://plausible.io/)
2. Add your domain
3. Get your domain name (e.g., `yourdomain.com`)

### Step 2: Add to index.html

Add this script before `</head>` in `frontend/index.html`:

```html
<!-- Plausible Analytics -->
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

Replace `yourdomain.com` with your actual domain.

### Step 3: Environment Variable (Optional)

```html
<script defer 
  data-domain="import.meta.env.VITE_PLAUSIBLE_DOMAIN || 'yourdomain.com'" 
  src="https://plausible.io/js/script.js">
</script>
```

Add to `.env`:
```env
VITE_PLAUSIBLE_DOMAIN=yourdomain.com
```

---

## Using Both Analytics

You can use both Google Analytics and Plausible simultaneously:

```html
<head>
  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  </script>

  <!-- Plausible Analytics -->
  <script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
</head>
```

---

## Tracked Events

The following events are automatically tracked:

1. **resume_email_sent** - When resume is successfully sent via email
   - Category: Resume
   - Label: Email Sent

2. **resume_download_clicked** - When user clicks download button
   - Category: Resume
   - Label: Download Button

---

## Testing Analytics

### Google Analytics

1. Open browser DevTools → Network tab
2. Filter by "collect" or "google-analytics"
3. Submit form and check for requests to `google-analytics.com`

### Plausible

1. Open browser DevTools → Network tab
2. Filter by "plausible"
3. Submit form and check for requests to `plausible.io`

### Console Logs

Both analytics functions log to console in development:
- `GA Event tracked: ...`
- `Plausible event tracked: ...`

---

## Privacy Considerations

- **Google Analytics**: Uses cookies, requires GDPR consent in EU
- **Plausible**: Privacy-friendly, no cookies, GDPR compliant by default

For privacy-focused sites, consider using only Plausible.

