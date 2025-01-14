/*
submission.ts

제출 관련 타입 정의
각 플랫폼별 제출 정보 인터페이스
제출 결과 타입
*/
import { Platform } from './common';

export interface Problem {
  platform: Platform;
  problemId: string;
  title: string;
  description: string;
  level: string;
  tags: string[];
  url: string;
  input?: string;
  output?: string;
}

// 백준 특화 타입
export interface BojProblem extends Problem {
  platform: 'baekjoon';
  solvedacLevel: number;
  solvedacTier: string;
}

// 프로그래머스 특화 타입
export interface ProgrammersProblem extends Problem {
  platform: 'programmers';
  level: `level ${number}`;
  category: string[];
}

// SWEA 특화 타입
export interface SweaProblem extends Problem {
  platform: 'swexpertacademy';
  difficulty: string;
  contestProbId: string;
}

// 구름레벨 특화 타입
export interface GoormlevelProblem extends Problem {
  platform: 'goormlevel';
  examSequence: number;
  quizNumber: number;
  difficulty: number;
}

export interface ProblemMetadata {
  id: string;
  source_url: string;
  title: string;
  platform: Platform;
  difficulty: string;
  status: 'solved' | 'attempted' | 'todo';
  last_solved?: string;
}
