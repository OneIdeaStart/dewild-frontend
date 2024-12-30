// src/app/api/discord/callback/route.ts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      throw new Error('No code provided');
    }

    // Объявляем переменные
    let tokenData;
    let userData;
    let isMember;

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
        redirect_uri: 'https://dewild.xyz/api/discord/callback',
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

    // Возвращаем HTML с данными пользователя
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
                  username: "${userData.username}"
                },
                'http://localhost:3000'
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
                'http://localhost:3000'
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