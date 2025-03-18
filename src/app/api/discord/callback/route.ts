// src/app/api/discord/callback/route.ts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      throw new Error('No code provided');
    }

    // Declare variables
    let tokenData;
    let userData;
    let isMember;

    // Get token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/discord/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to get token');
    }

    tokenData = await tokenResponse.json();

    // Get user data
    const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user data');
    }

    userData = await userResponse.json();

    // Check server membership
    const memberCheck = await fetch(
      `https://discord.com/api/v10/users/@me/guilds/${process.env.DISCORD_SERVER_ID}/member`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    isMember = memberCheck.ok;

    // Return HTML with processing for both desktop and mobile
    return new Response(
      `
      <html>
        <body>
          <script>
            if (window.opener) {
              // For desktop: send message and close window
              window.opener.postMessage(
                { 
                  type: 'discord-auth', 
                  success: ${isMember},
                  username: "${userData.username}"
                },
                '${process.env.NEXT_PUBLIC_APP_URL}'
              );
              setTimeout(() => window.close(), 2000);
            } else {
                // For mobile: save data in localStorage and redirect
                localStorage.setItem('discord_auth', JSON.stringify({
                  success: ${isMember},
                  username: "${userData.username}"
                }));
                window.location.href = '${process.env.NEXT_PUBLIC_APP_URL}?openWhitelist=true';
              }
          </script>
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  } catch (error) {
    console.error('Callback error:', error);
    return new Response(
      `
      <html>
        <body>
          <script>
            if (window.opener) {
              // For desktop
              window.opener.postMessage(
                { type: 'discord-auth', success: false },
                '${process.env.NEXT_PUBLIC_APP_URL}'
              );
              setTimeout(() => window.close(), 2000);
            } else {
              // For mobile
              localStorage.setItem('discord_auth', JSON.stringify({
                success: false
              }));
              window.location.href = '${process.env.NEXT_PUBLIC_APP_URL}?openWhitelist=true';
            }
          </script>
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  }
}