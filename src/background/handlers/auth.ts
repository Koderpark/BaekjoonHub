/*
handlers/auth.ts

GitHub OAuth 인증 처리
액세스 토큰 요청/저장
사용자 정보 요청/저장
인증 에러 처리
*/
interface AccessTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

interface GitHubUserResponse {
  login: string;
  id: number;
  type: string;
}

const CLIENT_ID = '975f8d5cf6686dd1faed';
const CLIENT_SECRET = '934b2bfc3bb3ad239bc67bdfa81a378b1616dd1e';
const AUTH_URL = 'https://github.com/login/oauth/access_token';

/**
 * GitHub OAuth 콜백 처리
 */
export async function handleGitHubAuthCallback(tab: chrome.tabs.Tab) {
  if (!tab.url) return;

  try {
    const url = new URL(tab.url);
    const isPipeOpen = await chrome.storage.local.get('pipe_baekjoonhub');

    if (!isPipeOpen.pipe_baekjoonhub) return;

    // 에러 처리
    if (url.searchParams.has('error')) {
      await handleAuthError(tab);
      return;
    }

    // 인증 코드 처리
    const code = url.searchParams.get('code');
    if (!code) return;

    // 액세스 토큰 요청
    const token = await requestAccessToken(code);
    if (!token) {
      throw new Error('Failed to get access token');
    }

    // 사용자 정보 요청
    const user = await requestUserInfo(token);
    if (!user) {
      throw new Error('Failed to get user info');
    }

    // 토큰과 사용자 정보 저장
    await Promise.all([
      chrome.storage.local.set({ BaekjoonHub_token: token }),
      chrome.storage.local.set({ BaekjoonHub_username: user.login }),
    ]);

    // 파이프 닫기
    await chrome.storage.local.set({ pipe_baekjoonhub: false });

    // 성공 메시지 전송
    chrome.runtime.sendMessage({
      closeWebPage: true,
      isSuccess: true,
      token,
      username: user.login,
    });

    // 웰컬 페이지로 리디렉션
    const welcomeUrl = chrome.runtime.getURL('welcome.html');
    await chrome.tabs.create({ url: welcomeUrl });
  } catch (error) {
    console.error('Auth error:', error);
    await handleAuthError(tab);
  }
}

/**
 * 액세스 토큰 요청
 */
async function requestAccessToken(code: string): Promise<string | null> {
  const response = await fetch(AUTH_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get access token');
  }

  const data = (await response.json()) as AccessTokenResponse;
  return data.access_token;
}

/**
 * 사용자 정보 요청
 */
async function requestUserInfo(token: string): Promise<GitHubUserResponse | null> {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get user info');
  }

  return response.json() as Promise<GitHubUserResponse>;
}

/**
 * 인증 에러 처리
 */
async function handleAuthError(tab: chrome.tabs.Tab) {
  await chrome.storage.local.set({ pipe_baekjoonhub: false });
  chrome.runtime.sendMessage({
    closeWebPage: true,
    isSuccess: false,
  });
  await chrome.tabs.remove(tab.id!);
}
