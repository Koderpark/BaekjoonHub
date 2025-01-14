/*
injector.ts

React 컴포넌트 DOM 주입
스타일 주입
Portal 컨테이너 관리
*/
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Platform } from '@/types/common';

/**
 * 페이지에 업로드 버튼을 주입합니다.
 */
export function injectUploadButton(platform: Platform, targetSelector: string) {
  const target = document.querySelector(targetSelector);
  if (!target) return;

  const container = document.createElement('div');
  container.id = 'baekjoonhub-upload-button';
  target.appendChild(container);

  const root = createRoot(container);
  // 실제 버튼 컴포넌트는 별도의 컴포넌트 파일에서 import
  // root.render(<UploadButton platform={platform} />);
}

/**
 * 페이지에 진행 상태 표시기를 주입합니다.
 */
export function injectProgressIndicator(targetSelector: string) {
  const target = document.querySelector(targetSelector);
  if (!target) return;

  const container = document.createElement('div');
  container.id = 'baekjoonhub-progress-indicator';
  target.appendChild(container);

  const root = createRoot(container);
  // root.render(<ProgressIndicator />);
}

/**
 * 페이지에 토스트 알림 컨테이너를 주입합니다.
 */
export function injectToastContainer() {
  const container = document.createElement('div');
  container.id = 'baekjoonhub-toast-container';
  document.body.appendChild(container);

  const root = createRoot(container);
  // root.render(<ToastContainer />);
}

/**
 * React Portal용 컨테이너를 주입합니다.
 */
export function injectPortalContainer() {
  const container = document.createElement('div');
  container.id = 'baekjoonhub-portal';
  document.body.appendChild(container);
}

/**
 * CSS 스타일을 주입합니다.
 */
export function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    #baekjoonhub-upload-button {
      display: inline-block;
      margin-left: 8px;
    }

    #baekjoonhub-progress-indicator {
      display: inline-block;
      margin-left: 8px;
    }

    #baekjoonhub-toast-container {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 9999;
    }

    .baekjoonhub-fade-enter {
      opacity: 0;
      transform: translateY(-10px);
    }

    .baekjoonhub-fade-enter-active {
      opacity: 1;
      transform: translateY(0);
      transition: opacity 200ms, transform 200ms;
    }

    .baekjoonhub-fade-exit {
      opacity: 1;
      transform: translateY(0);
    }

    .baekjoonhub-fade-exit-active {
      opacity: 0;
      transform: translateY(-10px);
      transition: opacity 200ms, transform 200ms;
    }
  `;
  document.head.appendChild(style);
}
