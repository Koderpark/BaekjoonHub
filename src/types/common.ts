/*
common.ts

공통으로 사용되는 기본 타입들
스토리지 키, 플랫폼 정보 등 기본 인터페이스
*/
export interface Stats {
  version: string;
  branches: Record<string, string>;
  submission: Record<string, any>;
  problems: Record<string, any>;
}

export type Platform = 'baekjoon' | 'programmers' | 'swexpertacademy' | 'goormlevel';

export interface PlatformInfo {
  name: Platform;
  displayName: string;
  baseUrl: string;
}

export type Language = {
  id: string;
  name: string;
  extension: string;
};

export type StorageKey =
  | 'BaekjoonHub_token'
  | 'BaekjoonHub_username'
  | 'BaekjoonHub_hook'
  | 'stats'
  | 'mode_type'
  | 'isSync'
  | 'bjhEnable'
  | 'BaekjoonHub_OrgOption';

export type OrganizeOption = 'platform' | 'language';

export interface GithubAuthResponse {
  token: string;
  username: string;
}

export interface TreeItem {
  path: string;
  sha: string;
  type: 'blob' | 'tree';
}
