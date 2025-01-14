/*
baekjoon.ts

백준 페이지 처리
제출 결과 감시
코드 파싱
문제 정보 수집
*/
import {
  injectUploadButton,
  injectProgressIndicator,
  injectToastContainer,
  injectStyles,
} from './injector';
import { BojSubmission } from '@/types/submission';
import { useProblemStore } from '@/store/useProblemStore';
import { convertToFullWidth } from '@/utils/formatter';

let submissionObserver: MutationObserver | null = null;

/**
 * 백준 페이지 초기화
 */
export async function initBaekjoon() {
  const currentUrl = window.location.href;

  if (currentUrl.includes('status')) {
    // 제출 결과 페이지
    await initSubmissionPage();
  } else if (currentUrl.match(/problem\/\d+/)) {
    // 문제 페이지
    await initProblemPage();
  }

  // 공통 요소 주입
  injectToastContainer();
  injectStyles();
}

/**
 * 제출 결과 페이지 초기화
 */
async function initSubmissionPage() {
  const targetSelector = '#status-table tbody tr:first-child td:nth-child(4)';
  injectProgressIndicator(targetSelector);

  // 제출 결과 테이블 감시
  observeSubmissionTable();
}

/**
 * 문제 페이지 초기화
 */
async function initProblemPage() {
  const targetSelector = '.container .row:first-child';
  injectUploadButton('baekjoon', targetSelector);
}

/**
 * 제출 결과 테이블 감시
 */
function observeSubmissionTable() {
  const table = document.getElementById('status-table');
  if (!table) return;

  if (submissionObserver) {
    submissionObserver.disconnect();
  }

  submissionObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        checkNewSubmission();
      }
    });
  });

  submissionObserver.observe(table, {
    childList: true,
    subtree: true,
  });
}

/**
 * 새로운 제출 확인
 */
async function checkNewSubmission() {
  const rows = document.querySelectorAll('#status-table tbody tr');
  const firstRow = rows[0];
  if (!firstRow) return;

  const submission = parseSubmissionRow(firstRow);
  if (!submission) return;

  // 자신의 제출이고 정답인 경우에만 처리
  if (
    submission.username === (await getCurrentUsername()) &&
    submission.result.includes('맞았습니다')
  ) {
    handleAcceptedSubmission(submission);
  }
}

/**
 * 제출 행 파싱
 */
function parseSubmissionRow(row: Element): BojSubmission | null {
  try {
    const cells = row.querySelectorAll('td');
    return {
      platform: 'baekjoon',
      submissionId: cells[0].textContent?.trim() || '',
      username: cells[1].textContent?.trim() || '',
      problemId: cells[2].querySelector('a')?.getAttribute('href')?.split('/').pop() || '',
      result: cells[3].textContent?.trim() || '',
      memory: cells[4].textContent?.trim() || '',
      runtime: cells[5].textContent?.trim() || '',
      language: cells[6].textContent?.replace(/\/.*$/, '').trim() || '',
      codeLength: parseInt(cells[7].textContent?.trim() || '0'),
      submissionTime: cells[8].querySelector('a')?.getAttribute('title') || '',
    };
  } catch (error) {
    console.error('Failed to parse submission row:', error);
    return null;
  }
}

/**
 * 현재 로그인한 사용자 이름 가져오기
 */
async function getCurrentUsername(): Promise<string | null> {
  const usernameElement = document.querySelector('.username');
  return usernameElement?.textContent?.trim() || null;
}

/**
 * 정답 제출 처리
 */
async function handleAcceptedSubmission(submission: BojSubmission) {
  // 코드 가져오기
  const code = await fetchSubmissionCode(submission.submissionId);
  if (!code) return;

  // 문제 정보 가져오기
  const problemInfo = await fetchProblemInfo(submission.problemId);
  if (!problemInfo) return;

  // Zustand store에 저장
  const store = useProblemStore.getState();
  store.addProblem({
    ...problemInfo,
    platform: 'baekjoon',
    problemId: submission.problemId,
  });
  store.addSubmission(submission.problemId, submission.submissionId);

  // 파일명 생성
  const fileName = `${convertToFullWidth(problemInfo.title)}.${getFileExtension(submission.language)}`;

  // GitHub에 업로드
  // uploadToGitHub({ ...submission, code, fileName });
}

/**
 * 제출 코드 가져오기
 */
async function fetchSubmissionCode(submissionId: string): Promise<string | null> {
  try {
    const response = await fetch(`https://www.acmicpc.net/source/download/${submissionId}`);
    if (!response.ok) return null;
    return response.text();
  } catch (error) {
    console.error('Failed to fetch submission code:', error);
    return null;
  }
}

/**
 * 문제 정보 가져오기
 */
async function fetchProblemInfo(problemId: string) {
  try {
    const [problemResponse, solvedResponse] = await Promise.all([
      fetch(`https://www.acmicpc.net/problem/${problemId}`),
      fetch(`https://solved.ac/api/v3/problem/show?problemId=${problemId}`),
    ]);

    if (!problemResponse.ok || !solvedResponse.ok) return null;

    const problemHtml = await problemResponse.text();
    const solvedData = await solvedResponse.json();

    const parser = new DOMParser();
    const doc = parser.parseFromString(problemHtml, 'text/html');

    return {
      title: doc.querySelector('#problem_title')?.textContent?.trim() || '',
      description: doc.querySelector('#problem_description')?.innerHTML || '',
      input: doc.querySelector('#problem_input')?.innerHTML || '',
      output: doc.querySelector('#problem_output')?.innerHTML || '',
      tags: solvedData.tags?.map((tag: any) => tag.displayNames[0].name) || [],
      level: solvedData.level,
    };
  } catch (error) {
    console.error('Failed to fetch problem info:', error);
    return null;
  }
}

/**
 * 파일 확장자 가져오기
 */
function getFileExtension(language: string): string {
  const extensions: Record<string, string> = {
    'C++': 'cpp',
    Python: 'py',
    Java: 'java',
    JavaScript: 'js',
    // 추가 언어는 필요에 따라 확장
  };

  return extensions[language] || 'txt';
}
