/*
index.ts

백그라운드 스크립트의 진입점
이벤트 리스너 설정
설치/업데이트 처리
스토리지 마이그레이션
*/
import { handleGitHubAuthCallback } from './handlers/auth';
import { handleSolvedAPICall } from './handlers/solved';
import { handleMessage } from './handlers/message';

// GitHub OAuth 콜백 URL 감지
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.startsWith('https://github.com/')) {
    handleGitHubAuthCallback(tab);
  }
});

// 메시지 리스너
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request && request.sender === 'baekjoon' && request.task === 'SolvedApiCall') {
    handleSolvedAPICall(request, sendResponse);
    return true; // 비동기 응답을 위해 true 반환
  }

  handleMessage(request, sender, sendResponse);
  return true;
});

// 설치/업데이트 이벤트 처리
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install') {
    // 초기 설치 시 웰컴 페이지 오픈
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html'),
    });
  }

  // 스토리지 마이그레이션
  await migrateLegacyStorage();
});
