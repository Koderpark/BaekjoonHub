/*
programmers.ts

프로그래머스 페이지 처리
결과 모달 감시
제출 정보 수집
파일 이름 생성
*/
import {
  injectUploadButton,
  injectProgressIndicator,
  injectToastContainer,
  injectStyles,
} from './injector';
import { ProgrammersSubmission } from '@/types/submission';
import { useProblemStore } from '@/store/useProblemStore';
import { convertToFullWidth } from '@/utils/formatter';

let resultObserver: MutationObserver | null = null;

/**
 * 프로그래머스 페이지 초기화
 */
export async function initProgrammers() {
  const currentUrl = window.location.href;

  if (currentUrl.includes('/learn/courses/30/lessons/')) {
    await initProblemPage();
  }

  // 공통 요소 주입
  injectToastContainer();
  injectStyles();
}

/**
 * 문제 페이지 초기화
 */
async function initProblemPage() {
  injectUploadButton('programmers', '.workspace-button');
  injectProgressIndicator('.eval-guide-button');

  // 결과 모달 감시
  observeResultModal();
}

/**
 * 결과 모달 감시
 */
function observeResultModal() {
  const targetNode = document.body;

  if (resultObserver) {
    resultObserver.disconnect();
  }

  resultObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        const resultModal = document.querySelector('.modal-header h4');
        if (resultModal && resultModal.textContent?.includes('정답')) {
          handleAcceptedSubmission();
        }
      }
    });
  });

  resultObserver.observe(targetNode, {
    childList: true,
    subtree: true,
  });
}

/**
 * 정답 제출 처리
 */
async function handleAcceptedSubmission() {
  const submission = parseSubmission();
  if (!submission) return;

  // Zustand store에 저장
  const store = useProblemStore.getState();
  store.addProblem({
    platform: 'programmers',
    problemId: submission.problemId,
    title: submission.title,
    description: submission.description,
    level: submission.level,
    tags: [],
    url: window.location.href,
  });
  store.addSubmission(submission.problemId, submission.submissionId);

  // 파일명 생성
  const fileName = `${convertToFullWidth(submission.title)}.${getFileExtension(submission.language)}`;

  // GitHub에 업로드
  // uploadToGitHub({ ...submission, fileName });
}

/**
 * 제출 정보 파싱
 */
function parseSubmission(): ProgrammersSubmission | null {
  try {
    const problemId = window.location.pathname.split('/').pop() || '';
    const title = document.querySelector('.challenge-title')?.textContent?.trim() || '';
    const description = document.querySelector('.guide-section-description')?.innerHTML || '';
    const level = document.querySelector('.level-badge')?.textContent?.trim() || '';
    const language =
      document.querySelector('.language-selector .selected')?.textContent?.trim() || '';
    const code = document.querySelector('#code')?.textContent || '';

    // 실행 결과에서 메모리와 시간 추출
    const resultCells = document.querySelectorAll('td.result.passed');
    const [runtime, memory] = [...resultCells]
      .map((cell) => cell.textContent?.replace(/[^., 0-9a-zA-Z]/g, '').trim() || '')
      .map((text) => text.split(', '))
      .reduce(
        (x, y) => (Number(x[0].slice(0, -2)) > Number(y[0].slice(0, -2)) ? x : y),
        ['0.00ms', '0.0MB']
      )
      .map((x) => x.replace(/(?<=[0-9])(?=[A-Za-z])/, ' '));

    // 결과 메시지 추출
    const resultMessage =
      [...document.querySelectorAll('#output .console-message')]
        .map((node) => node.textContent)
        .filter((text) => text?.includes(':'))
        .reduce((cur, next) => (cur ? `${cur}<br/>${next}` : next || ''), '') || 'Empty';

    // 현재 시간을 기준으로 제출 ID 생성
    const submissionId = Date.now().toString();

    return {
      platform: 'programmers',
      problemId,
      submissionId,
      title,
      description,
      level,
      language,
      code,
      runtime,
      memory,
      result: resultMessage,
      submissionTime: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to parse submission:', error);
    return null;
  }
}

/**
 * 파일 확장자 가져오기
 */
function getFileExtension(language: string): string {
  const extensions: Record<string, string> = {
    cpp: 'cpp',
    python3: 'py',
    java: 'java',
    javascript: 'js',
    kotlin: 'kt',
    go: 'go',
    swift: 'swift',
    ruby: 'rb',
    scala: 'scala',
    csharp: 'cs',
  };

  const normalizedLang = language.toLowerCase().replace(/\s/g, '');
  return extensions[normalizedLang] || 'txt';
}

/**
 * 난이도 표시를 레벨 숫자로 변환
 */
function convertLevelToNumber(level: string): number {
  const levelMatch = level.match(/\d+/);
  return levelMatch ? parseInt(levelMatch[0]) : 0;
}

/**
 * 페이지 cleanup
 */
export function cleanup() {
  if (resultObserver) {
    resultObserver.disconnect();
    resultObserver = null;
  }
}
