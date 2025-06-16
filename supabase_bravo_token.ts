// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
console.info('server started');
Deno.serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({
      error: 'invalid_request',
      error_description: 'Only POST method is allowed'
    }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  try {
    // Parse request body
    let tokenRequest;
    // Handle both JSON and form-encoded requests
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      tokenRequest = await req.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      tokenRequest = {
        grant_type: formData.get('grant_type'),
        code: formData.get('code'),
        redirect_uri: formData.get('redirect_uri') || undefined,
        client_id: formData.get('client_id') || undefined,
        client_secret: formData.get('client_secret') || undefined,
        code_verifier: formData.get('code_verifier') || undefined
      };
    } else {
      throw new Error('Unsupported content type');
    }
    // Validate required parameters
    if (!tokenRequest.grant_type) {
      return new Response(JSON.stringify({
        error: 'invalid_request',
        error_description: 'Missing grant_type parameter'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    if (tokenRequest.grant_type !== 'authorization_code') {
      return new Response(JSON.stringify({
        error: 'unsupported_grant_type',
        error_description: 'Only authorization_code grant type is supported'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    if (!tokenRequest.code) {
      return new Response(JSON.stringify({
        error: 'invalid_request',
        error_description: 'Missing code parameter'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    // Optional: Validate client credentials
    // In a real implementation, you'd verify client_id and client_secret
    console.log('Token request received:', {
      grant_type: tokenRequest.grant_type,
      code: tokenRequest.code?.substring(0, 10) + '...',
      client_id: tokenRequest.client_id,
      redirect_uri: tokenRequest.redirect_uri
    });
    // Optional: Validate authorization code
    // In a real implementation, you'd:
    // 1. Verify the code exists in your database
    // 2. Check if it's expired
    // 3. Verify it matches the client_id and redirect_uri
    // 4. Ensure it hasn't been used before
    // For this simulation, we'll just check if the code looks valid
    if (tokenRequest.code.length < 10) {
      return new Response(JSON.stringify({
        error: 'invalid_grant',
        error_description: 'Invalid authorization code'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    // Generate token response
    // In this simulation, we're using the authorization code as the access token
    const tokenResponse = {
      access_token: tokenRequest.code,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'read write'
    };
    // Optional: Add refresh token
    if (tokenRequest.client_id) {
      // Generate a simple refresh token (in production, use cryptographically secure random strings)
      const refreshToken = btoa(`refresh_${tokenRequest.client_id}_${Date.now()}_${Math.random()}`);
      tokenResponse.refresh_token = refreshToken;
    }
    console.log('Token issued successfully for client:', tokenRequest.client_id);
    return new Response(JSON.stringify(tokenResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Token endpoint error:', error);
    return new Response(JSON.stringify({
      error: 'server_error',
      error_description: 'Internal server error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});
Deno.serve(async (req)=>{
  const { name } = await req.json();
  const data = {
    message: `Hello ${name}!`
  };
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Connection': 'keep-alive'
    }
  });
});
