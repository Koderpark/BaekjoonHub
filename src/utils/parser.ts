/*
parser.ts

결과 테이블 헤더 변환
HTML에서 이미지 태그 URL을 절대 경로로 변환
제출 데이터 파싱 (백준)
제출 데이터 파싱 (프로그래머스)
제출 데이터 파싱 (SWEA)
제출 데이터 파싱 (구름레벨)
*/

import { Platform } from '@/types/common';
import {
  BojSubmission,
  ProgrammersSubmission,
  SweaSubmission,
  GoormlevelSubmission,
} from '@/types/submission';

/**
 * 결과 테이블 헤더 변환
 */
export const convertResultTableHeader = (header: string): string => {
  const headerMap: Record<string, string> = {
    문제번호: 'problemId',
    문제: 'problemId',
    난이도: 'level',
    결과: 'result',
    문제내용: 'problemDescription',
    언어: 'language',
    '제출 번호': 'submissionId',
    아이디: 'username',
    제출시간: 'submissionTime',
    '제출한 시간': 'submissionTime',
    시간: 'runtime',
    메모리: 'memory',
    '코드 길이': 'codeLength',
  };

  return headerMap[header] || 'unknown';
};

/**
 * HTML에서 이미지 태그 URL을 절대 경로로 변환
 */
export const convertImageUrlToAbsolute = (element: HTMLElement | null): void => {
  if (!element) return;

  const images = element.getElementsByTagName('img');
  Array.from(images).forEach((img) => {
    img.src = img.currentSrc;
  });
};

/**
 * 제출 데이터 파싱 (백준)
 */
export const parseBojSubmission = (row: HTMLTableRowElement): Partial<BojSubmission> => {
  const cells = Array.from(row.cells);
  const resultCell = cells.find((cell) => cell.classList.contains('result'));

  return {
    platform: 'baekjoon',
    submissionId: cells[0]?.innerText.trim(),
    username: cells[1]?.innerText.trim(),
    problemId: cells[2]?.querySelector('a')?.href.split('/').pop() || '',
    result: resultCell?.innerText.trim() || '',
    resultCategory: resultCell?.firstElementChild
      ?.getAttribute('data-color')
      ?.replace('-eng', '')
      .trim(),
    memory: cells[4]?.innerText.trim(),
    runtime: cells[5]?.innerText.trim(),
    language: cells[6]?.innerText.replace(/\/.*$/, '').trim(),
    codeLength: parseInt(cells[7]?.innerText.trim() || '0'),
    submissionTime:
      cells[8]?.querySelector('a.show-date')?.getAttribute('data-original-title') || '',
  };
};

/**
 * 제출 데이터 파싱 (프로그래머스)
 */
export const parseProgrammersSubmission = (element: Element): Partial<ProgrammersSubmission> => {
  const resultMessage = element.querySelector('.console-message')?.textContent || '';
  const [runtime, memory] = element
    .querySelectorAll('td.result.passed')
    .map((x) => x.textContent?.replace(/[^., 0-9a-zA-Z]/g, '').trim() || '')
    .map((x) => x.split(', '))
    .reduce(
      (x, y) => (Number(x[0].slice(0, -2)) > Number(y[0].slice(0, -2)) ? x : y),
      ['0.00ms', '0.0MB']
    )
    .map((x) => x.replace(/(?<=[0-9])(?=[A-Za-z])/, ' '));

  return {
    platform: 'programmers',
    result: resultMessage,
    runtime,
    memory,
    language: element.querySelector('.editor > ul > li > a')?.textContent?.split('.')[1] || '',
    code: element.querySelector('textarea#code')?.textContent || '',
  };
};

/**
 * 제출 데이터 파싱 (SWEA)
 */
export const parseSweaSubmission = (element: Element): Partial<SweaSubmission> => {
  const info = element.querySelector('#problemForm div.info > ul');

  return {
    platform: 'swexpertacademy',
    language: info?.querySelector('li:nth-child(1) > span')?.textContent?.trim() || '',
    memory: info?.querySelector('li:nth-child(2) > span')?.textContent?.trim().toUpperCase() || '',
    runtime: info?.querySelector('li:nth-child(3) > span')?.textContent?.trim() || '',
    codeLength: info?.querySelector('li:nth-child(4) > span')?.textContent?.trim() || '',
  };
};

/**
 * 제출 데이터 파싱 (구름레벨)
 */
export const parseGoormlevelSubmission = (element: Element): Partial<GoormlevelSubmission> => {
  const dataList = Array.from(
    element.querySelectorAll('.tab-content .tab-pane.active table tbody tr')
  ).filter((row) => row.childNodes[1].textContent === 'PASS');

  const stats = dataList.reduce(
    (acc, row) => ({
      memory: acc.memory + Number(row.childNodes[5].textContent?.trim() || 0),
      runtime: acc.runtime + Number(row.childNodes[6].textContent?.trim() || 0),
    }),
    { memory: 0, runtime: 0 }
  );

  return {
    platform: 'goormlevel',
    memory: `${(stats.memory / dataList.length / 1024).toFixed(2)} MB`,
    runtime: `${(stats.runtime / dataList.length).toFixed(2)} ms`,
    result: 'PASS',
    language: element.querySelector('.Tour__selectLang button')?.textContent?.trim() || '',
  };
};
