/*
validation.ts

null/undefined 체크
빈 값 체크
GitHub 관련 유효성 검사
문제 ID 유효성 검사 등
*/

/**
 * 값이 null 또는 undefined인지 확인
 */
export const isNull = (value: unknown): value is null | undefined => {
  return value === null || value === undefined;
};

/**
 * 값이 비어있는지 확인 (빈 문자열, 배열, 객체 포함)
 */
export const isEmpty = (value: unknown): boolean => {
  if (isNull(value)) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  if (typeof value === 'string') return value.trim().length === 0;
  return false;
};

/**
 * 객체의 모든 값이 비어있지 않은지 재귀적으로 확인
 */
export const isNotEmpty = (obj: unknown): boolean => {
  if (isEmpty(obj)) return false;
  if (typeof obj !== 'object') return true;
  if (obj === null) return false;

  if (Array.isArray(obj)) {
    return obj.length > 0 && obj.every((item) => isNotEmpty(item));
  }

  return Object.keys(obj).length > 0 && Object.values(obj).every((value) => isNotEmpty(value));
};

/**
 * 객체의 필수 속성이 모두 존재하는지 확인
 */
export const hasRequiredProperties = <T extends object>(
  obj: T,
  required: Array<keyof T>
): boolean => {
  return required.every((prop) => !isNull(obj[prop]) && !isEmpty(obj[prop]));
};

/**
 * SHA-1 해시값이 유효한지 확인
 */
export const isValidSHA1 = (str: string): boolean => {
  return /^[a-f0-9]{40}$/i.test(str);
};

/**
 * GitHub 저장소 이름이 유효한지 확인
 */
export const isValidRepoName = (name: string): boolean => {
  return /^[a-zA-Z0-9_.-]+$/i.test(name);
};

/**
 * GitHub 토큰이 유효한지 확인
 */
export const isValidGitHubToken = (token: string): boolean => {
  return /^ghp_[a-zA-Z0-9]{36}$/i.test(token);
};

/**
 * 백준 문제 ID가 유효한지 확인
 */
export const isValidBojProblemId = (id: string): boolean => {
  return /^\d{1,5}$/.test(id) && Number(id) >= 1000;
};

/**
 * 프로그래머스 문제 ID가 유효한지 확인
 */
export const isValidProgrammersProblemId = (id: string): boolean => {
  return /^\d+$/.test(id);
};
