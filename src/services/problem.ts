/*
problem.ts

문제 데이터 관리
캐시 처리
플랫폼별 크롤링
메타데이터 관리
*/
import { Problem } from '@/types/problem';
import { StorageService } from './storage';
import { Stats } from '@/types/common';

export class ProblemService {
  /**
   * 문제 캐시 가져오기
   */
  static async getProblemCache(): Promise<Record<string, Problem>> {
    const stats = await StorageService.get<Stats>('stats');
    return stats?.problems || {};
  }

  /**
   * 문제 캐시 저장하기
   */
  static async updateProblemCache(problems: Record<string, Problem>): Promise<void> {
    const stats = (await StorageService.get<Stats>('stats')) || { problems: {} };
    stats.problems = problems;
    await StorageService.set('stats', stats);
  }

  /**
   * 문제 캐시에 추가하기
   */
  static async addProblemToCache(problem: Problem): Promise<void> {
    const problems = await this.getProblemCache();
    problems[problem.problemId] = problem;
    await this.updateProblemCache(problems);
  }

  /**
   * 문제 캐시에서 삭제하기
   */
  static async removeProblemFromCache(problemId: string): Promise<void> {
    const problems = await this.getProblemCache();
    delete problems[problemId];
    await this.updateProblemCache(problems);
  }

  /**
   * 문제 정보 가져오기 (백준)
   */
  static async getBaekjoonProblem(problemId: string): Promise<Problem | null> {
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
        platform: 'baekjoon',
        problemId,
        title: doc.querySelector('#problem_title')?.textContent?.trim() || '',
        description: doc.querySelector('#problem_description')?.innerHTML || '',
        level: solvedData.level.toString(),
        tags: solvedData.tags?.map((tag: any) => tag.displayNames[0].name) || [],
        url: `https://www.acmicpc.net/problem/${problemId}`,
      };
    } catch (error) {
      console.error('Failed to fetch baekjoon problem:', error);
      return null;
    }
  }

  /**
   * 문제 정보 가져오기 (프로그래머스)
   */
  static async getProgrammersProblem(problemId: string): Promise<Problem | null> {
    try {
      const response = await fetch(
        `https://programmers.co.kr/learn/courses/30/lessons/${problemId}`
      );

      if (!response.ok) return null;

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      return {
        platform: 'programmers',
        problemId,
        title: doc.querySelector('.challenge-title')?.textContent?.trim() || '',
        description: doc.querySelector('.guide-section-description')?.innerHTML || '',
        level: doc.querySelector('.level-badge')?.textContent?.trim() || '',
        tags: [],
        url: `https://programmers.co.kr/learn/courses/30/lessons/${problemId}`,
      };
    } catch (error) {
      console.error('Failed to fetch programmers problem:', error);
      return null;
    }
  }

  /**
   * 문제 캐시 초기화
   */
  static async clearProblemCache(): Promise<void> {
    const stats = (await StorageService.get<Stats>('stats')) || {};
    stats.problems = {};
    await StorageService.set('stats', stats);
  }
}
