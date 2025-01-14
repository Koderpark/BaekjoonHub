import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Problem } from '@/types/problem';
import { Platform } from '@/types/common';

interface ProblemState {
  problems: Record<string, Problem>;
  submissions: Record<string, string>; // problemId -> submissionId 매핑
  currentPlatform: Platform;
  addProblem: (problem: Problem) => void;
  updateProblem: (problemId: string, updates: Partial<Problem>) => void;
  removeProblem: (problemId: string) => void;
  setPlatform: (platform: Platform) => void;
  addSubmission: (problemId: string, submissionId: string) => void;
  getSubmissionsByPlatform: (platform: Platform) => Record<string, string>;
  getProblemsByPlatform: (platform: Platform) => Problem[];
  clearProblems: () => void;
}

export const useProblemStore = create<ProblemState>()(
  devtools((set, get) => ({
    problems: {},
    submissions: {},
    currentPlatform: 'baekjoon',

    addProblem: (problem) =>
      set((state) => ({
        problems: {
          ...state.problems,
          [problem.problemId]: problem,
        },
      })),

    updateProblem: (problemId, updates) =>
      set((state) => ({
        problems: {
          ...state.problems,
          [problemId]: {
            ...state.problems[problemId],
            ...updates,
          },
        },
      })),

    removeProblem: (problemId) =>
      set((state) => {
        const { [problemId]: removed, ...rest } = state.problems;
        const { [problemId]: removedSubmission, ...restSubmissions } = state.submissions;
        return {
          problems: rest,
          submissions: restSubmissions,
        };
      }),

    setPlatform: (platform) =>
      set({
        currentPlatform: platform,
      }),

    addSubmission: (problemId, submissionId) =>
      set((state) => ({
        submissions: {
          ...state.submissions,
          [problemId]: submissionId,
        },
      })),

    getSubmissionsByPlatform: (platform) => {
      const state = get();
      const filtered = Object.entries(state.submissions).filter(
        ([problemId]) => state.problems[problemId]?.platform === platform
      );
      return Object.fromEntries(filtered);
    },

    getProblemsByPlatform: (platform) => {
      const state = get();
      return Object.values(state.problems).filter((problem) => problem.platform === platform);
    },

    clearProblems: () =>
      set({
        problems: {},
        submissions: {},
      }),
  }))
);
