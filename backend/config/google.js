module.exports = {
  clientId: process.env.GOOGLE_CLIENT_ID || '452323229339-vjn0t394l0g5idpvf69sa96eeh02s6rf.apps.googleusercontent.com',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/api/auth/google/callback'
};
