/*
handlers/message.ts

일반 메시지 처리
웹 페이지 닫기 처리
스토리지 마이그레이션
*/
interface GreetingsMessage {
  type: 'GREETINGS';
  payload: {
    message: string;
  };
}

interface WebPageMessage {
  closeWebPage: boolean;
  isSuccess: boolean;
  token?: string;
  username?: string;
}

type Message = GreetingsMessage | WebPageMessage;

/**
 * 일반 메시지 처리
 */
export function handleMessage(
  request: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) {
  if ('type' in request && request.type === 'GREETINGS') {
    // 인사 메시지 처리
    sendResponse({
      message: `Hi ${
        sender.tab ? 'Con' : 'Pop'
      }, my name is Bac. I am from Background. It's great to hear from you.`,
    });
  } else if ('closeWebPage' in request) {
    // 웹 페이지 닫기 메시지 처리
    handleWebPageClose(request, sender, sendResponse);
  }
}

/**
 * 웹 페이지 닫기 처리
 */
async function handleWebPageClose(
  request: WebPageMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) {
  if (request.closeWebPage && request.isSuccess) {
    // 인증 성공 시 처리
    await Promise.all([
      chrome.storage.local.set({ BaekjoonHub_token: request.token }),
      chrome.storage.local.set({ BaekjoonHub_username: request.username }),
      chrome.storage.local.set({ pipe_baekjoonhub: false }),
    ]);

    // 새 탭에서 웰컴 페이지 열기
    const url = chrome.runtime.getURL('welcome.html');
    await chrome.tabs.create({ url, selected: true });

    // 현재 탭 닫기
    if (sender.tab?.id) {
      await chrome.tabs.remove(sender.tab.id);
    }
  } else if (request.closeWebPage && !request.isSuccess) {
    // 인증 실패 시 처리
    alert('Failed to authenticate your GitHub account!');
    if (sender.tab?.id) {
      await chrome.tabs.remove(sender.tab.id);
    }
  }
}

/**
 * 스토리지 마이그레이션
 */
export async function migrateLegacyStorage() {
  const keys = [
    'BaekjoonHub_token',
    'BaekjoonHub_username',
    'pipe_baekjoonhub',
    'stats',
    'BaekjoonHub_hook',
    'mode_type',
  ];

  // sync에서 local로 데이터 마이그레이션
  const syncData = await chrome.storage.sync.get(keys);
  if (Object.keys(syncData).length > 0) {
    await chrome.storage.local.set(syncData);
    await chrome.storage.sync.clear();
  }

  // stats 초기화
  const { stats } = await chrome.storage.local.get('stats');
  if (!stats || !stats.version) {
    await chrome.storage.local.set({
      stats: {
        version: chrome.runtime.getManifest().version,
        branches: {},
        submission: {},
        problems: {},
      },
    });
  }
}
