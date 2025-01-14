/*
handlers/solved.ts

solved.ac API 호출 처리
문제 정보 요청
에러 처리
*/
interface SolvedApiRequest {
  task: 'SolvedApiCall';
  problemId: string;
}

/**
 * solved.ac API 호출 처리
 */
export async function handleSolvedAPICall(
  request: SolvedApiRequest,
  sendResponse: (response?: any) => void
) {
  try {
    const response = await fetch(
      `https://solved.ac/api/v3/problem/show?problemId=${request.problemId}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from solved.ac API');
    }

    const data = await response.json();
    sendResponse(data);
  } catch (error) {
    console.error('Solved.ac API error:', error);
    sendResponse({
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
}
