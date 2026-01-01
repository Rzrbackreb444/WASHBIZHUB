import jwt from 'jsonwebtoken';

async function registerRISC() {
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountKey) {
    console.error('Error: GOOGLE_SERVICE_ACCOUNT_JSON is missing from Secrets.');
    return;
  }

  let credentials;
  try {
    credentials = JSON.parse(serviceAccountKey);
  } catch (e) {
    console.error('Error: Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON as JSON:', e.message);
    return;
  }

  if (!credentials.private_key || !credentials.client_email) {
    console.error('Error: Invalid service account - missing private_key or client_email');
    return;
  }

  // CRITICAL FIX: Handle multiple newline escape scenarios
  let formattedKey = credentials.private_key;
  if (formattedKey.includes('\\n')) {
    formattedKey = formattedKey.replace(/\\n/g, '\n');
  }

  console.log('Service Account:', credentials.client_email);
  console.log('Project ID:', credentials.project_id);

  // Create JWT for RISC API (recommended method per Google docs)
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.client_email,
    sub: credentials.client_email,
    aud: 'https://risc.googleapis.com/google.identity.risc.v1beta.RiscManagementService',
    iat: now,
    exp: now + 3600
  };

  console.log('Creating JWT token for RISC API...');
  
  let token;
  try {
    token = jwt.sign(payload, formattedKey, {
      algorithm: 'RS256',
      header: {
        kid: credentials.private_key_id
      }
    });
    console.log('JWT token created successfully');
  } catch (e) {
    console.error('Failed to create JWT token:', e.message);
    return;
  }

  console.log('Registering RISC endpoint...');
  try {
    const response = await fetch('https://risc.googleapis.com/v1beta/stream:update', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        delivery: {
          delivery_method: 'https://schemas.openid.net/secevent/risc/delivery-method/push',
          url: 'https://washbizhub.com/api/risc-handler'
        },
        events_requested: [
          'https://schemas.openid.net/secevent/oauth/event-type/tokens-revoked',
          'https://schemas.openid.net/secevent/risc/event-type/account-disabled',
          'https://schemas.openid.net/secevent/risc/event-type/account-enabled'
        ]
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Registration Result:', JSON.stringify(data, null, 2));
    } else {
      console.error('❌ Registration failed with status:', response.status);
      console.error('Error details:', JSON.stringify(data, null, 2));
      
      if (response.status === 403) {
        console.log('\n⚠️  The service account needs the RISC Configuration Admin role.');
        console.log('Go to Google Cloud Console → IAM → Add the role: roles/riscconfigs.admin');
        console.log('Also ensure RISC API is enabled in your project.');
      }
    }
  } catch (error) {
    console.error('Failed to register:', error.message);
  }
}

registerRISC();
