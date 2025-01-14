/*
index.ts

플랫폼 감지
초기화 로직
메시지 처리
활성화 상태 관리
*/
import { initBaekjoon } from './baekjoon';
import { initProgrammers } from './programmers';

/**
 * 현재 페이지의 플랫폼 확인
 */
function getCurrentPlatform() {
  const url = window.location.hostname;

  if (url.includes('acmicpc.net')) return 'baekjoon';
  if (url.includes('programmers.co.kr')) return 'programmers';
  if (url.includes('swexpertacademy.com')) return 'swexpertacademy';
  if (url.includes('level.goorm.io')) return 'goormlevel';

  return null;
}

/**
 * 익스텐션 활성화 여부 확인
 */
async function isExtensionEnabled() {
  const { bjhEnable } = await chrome.storage.local.get('bjhEnable');
  return bjhEnable !== false; // 기본값은 true
}

/**
 * content script 초기화
 */
async function initialize() {
  try {
    // 익스텐션이 비활성화되어 있으면 실행하지 않음
    if (!(await isExtensionEnabled())) {
      return;
    }

    const platform = getCurrentPlatform();
    if (!platform) {
      return;
    }

    // 플랫폼별 초기화
    switch (platform) {
      case 'baekjoon':
        await initBaekjoon();
        break;
      case 'programmers':
        await initProgrammers();
        break;
      // 추가 플랫폼은 여기에 구현
    }

    // 메시지 리스너 등록
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'EXTENSION_ENABLED_CHANGED') {
        window.location.reload();
      }
      sendResponse({});
      return true;
    });
  } catch (error) {
    console.error('Failed to initialize BaekjoonHub:', error);
  }
}

// 페이지 로드 시 초기화
initialize();
