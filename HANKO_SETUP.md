# 🔐 Hanko Authentication Setup Guide

This application uses [Hanko](https://www.hanko.io/) for modern, passwordless authentication. Follow these steps to set up your own Hanko Cloud project for production use.

## 📋 Current Status
- ⚠️ Currently using a demo Hanko instance
- ✅ Basic integration completed
- 🔧 Needs production Hanko Cloud setup

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Hanko Cloud Account
1. Go to [Hanko Cloud](https://cloud.hanko.io)
2. Sign up for a free account
3. Create a new project

### Step 2: Get Your API URL
1. In your Hanko Cloud dashboard, copy your **API URL**
2. It will look like: `https://your-project-id.hanko.io`

### Step 3: Update Configuration
1. Open `hanko-auth.js`
2. Replace this line:
   ```javascript
   const HANKO_API_URL = 'https://f4b3cb25-2230-4d66-9c21-40d95c6aba82.hanko.io';
   ```
   
   With your API URL:
   ```javascript
   const HANKO_API_URL = 'https://your-project-id.hanko.io';
   ```

3. Update the HTML file `index.html`, find this line:
   ```html
   <hanko-auth api="https://f4b3cb25-2230-4d66-9c21-40d95c6aba82.hanko.io"></hanko-auth>
   ```
   
   Replace with:
   ```html
   <hanko-auth api="https://your-project-id.hanko.io"></hanko-auth>
   ```

### Step 4: Configure Domain (Optional)
1. In Hanko Cloud dashboard, add your domain to allowed origins
2. For local development: `http://localhost` and `http://127.0.0.1`
3. For production: your actual domain

## 🛠️ Advanced Configuration

### Customize Authentication Methods
In your Hanko Cloud dashboard, you can enable/disable:
- ✉️ Email-based authentication
- 📱 SMS authentication  
- 🔑 Passkey/WebAuthn support
- 🔐 Password authentication (optional)

### Styling
The app includes custom CSS variables for Hanko elements:
```css
hanko-auth {
    --color-primary: #667eea;
    --color-primary-hover: #5a67d8;
    --border-radius: 8px;
    --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
}
```

## 🧪 Testing

After setup, test the authentication:
1. Click "Iniciar Sesión" button
2. Modal should open with Hanko auth component
3. Enter your email to receive a magic link
4. Complete authentication flow
5. Check browser console for logs

## 🐛 Troubleshooting

### Common Issues:

**CORS Errors:**
- Ensure your domain is added to Hanko Cloud allowed origins
- Check browser console for specific CORS messages

**Modal Not Opening:**
- Check browser console for JavaScript errors
- Ensure Hanko elements loaded successfully
- Verify API URL is correct

**Authentication Not Persisting:**
- Check cookies are enabled in browser
- Verify Hanko Cloud project configuration
- Check network tab for failed API requests

### Debug Commands:
Open browser console and try:
```javascript
// Check Hanko instance
window.hankoAuth.debug();

// Manual sign-in test
window.hankoAuth.openModal();

// Check current user
window.hankoAuth.user();
```

## 📚 Documentation

- [Hanko Documentation](https://docs.hanko.io)
- [Hanko Cloud Dashboard](https://cloud.hanko.io)
- [Hanko Elements GitHub](https://github.com/teamhanko/hanko)

## 🔒 Security Notes

- Never commit Hanko API URLs with sensitive data to public repos
- Use environment variables for production deployments
- Regularly review Hanko Cloud project settings
- Monitor authentication logs in Hanko dashboard

## ✅ Production Checklist

- [ ] Created own Hanko Cloud project
- [ ] Updated API URLs in code
- [ ] Added production domain to allowed origins
- [ ] Tested authentication flow
- [ ] Configured preferred authentication methods
- [ ] Set up monitoring/logging
- [ ] Verified CORS configuration
- [ ] Tested on mobile devices