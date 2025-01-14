/*
formatter.ts

날짜 포맷팅
문자열 변환
HTML 이스케이프/언이스케이프
UTF-8 길이 계산 등
*/
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 한글 날짜 형식으로 포맷팅
 * @example 2023년 9월 23일 16:26:26
 */
export const formatKoreanDate = (date: Date): string => {
  return format(date, 'yyyy년 MM월 dd일 HH:mm:ss', { locale: ko });
};

/**
 * 일반 특수문자를 전각문자로 변환
 */
export const convertToFullWidth = (text: string): string => {
  const mapping: Record<string, string> = {
    '!': '！',
    '%': '％',
    '&': '＆',
    '(': '（',
    ')': '）',
    '*': '＊',
    '+': '＋',
    ',': '，',
    '-': '－',
    '.': '．',
    '/': '／',
    ':': '：',
    ';': '；',
    '<': '＜',
    '=': '＝',
    '>': '＞',
    '?': '？',
    '@': '＠',
    '[': '［',
    '\\': '＼',
    ']': '］',
    '^': '＾',
    _: '＿',
    '`': '｀',
    '{': '｛',
    '|': '｜',
    '}': '｝',
    '~': '～',
    ' ': ' ', // 공백은 FOUR-PER-EM SPACE로 변환
  };

  return text.replace(/[!%&()*+,\-./:;<=>?@\[\\\]^_`{|}~ ]/g, (char) => mapping[char] || char);
};

/**
 * UTF-8 문자열의 바이트 길이 계산 (\r\n은 \n으로 변환)
 */
export const getUtf8Length = (str: string): number => {
  const normalizedStr = str.replace(/\r\n/g, '\n');
  return new TextEncoder().encode(normalizedStr).length;
};

/**
 * HTML 문자열 이스케이프
 */
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
};

/**
 * HTML 문자열 언이스케이프
 */
export const unescapeHtml = (text: string): string => {
  const unescaped: Record<string, string> = {
    '&amp;': '&',
    '&#38;': '&',
    '&lt;': '<',
    '&#60;': '<',
    '&gt;': '>',
    '&#62;': '>',
    '&apos;': "'",
    '&#39;': "'",
    '&quot;': '"',
    '&#34;': '"',
    '&nbsp;': ' ',
    '&#160;': ' ',
  };
  return text.replace(
    /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34|nbsp|#160);/g,
    (entity) => unescaped[entity]
  );
};

/**
 * 문자열에서 숫자 추출
 */
export const extractNumberFromString = (str: string): number | null => {
  const matches = str.match(/\d+/g);
  if (!matches) return null;
  return Number(matches[0]);
};
