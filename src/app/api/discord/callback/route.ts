// src/app/api/discord/callback/route.ts
interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface UserData {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      throw new Error('No code provided');
    }

    let tokenData: TokenResponse;
    let userData: UserData;
    let isMember: boolean;

    // Получаем токен
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

    // Получаем данные пользователя
    const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user data');
    }

    userData = await userResponse.json();

    // Проверяем членство в сервере
    const memberCheck = await fetch(
      `https://discord.com/api/v10/users/@me/guilds/${process.env.DISCORD_SERVER_ID}/member`,
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    isMember = memberCheck.ok;

    return new Response(
      `
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage(
                { 
                  type: 'discord-auth', 
                  success: ${isMember},
                  username: "${userData.username}",
                  discordId: "${userData.id}"
                },
                '${process.env.NEXT_PUBLIC_APP_URL}'
              );
              setTimeout(() => window.close(), 2000);
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
              window.opener.postMessage(
                { type: 'discord-auth', success: false },
                '${process.env.NEXT_PUBLIC_APP_URL}'
              );
              setTimeout(() => window.close(), 2000);
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