/*
Options.tsx

상세 설정 페이지
파일 구조 설정
통계 정보 표시
캐시 초기화
설정 초기화
*/
import React from 'react';
import { Card, Button } from '@/components';
import { useLocalStorage, useToast } from '@/hooks';

export default function Options() {
  const { value: organizeBy, setValue: setOrganizeBy } = useLocalStorage(
    'BaekjoonHub_OrgOption',
    'platform'
  );
  const { value: stats } = useLocalStorage('stats', { submission: {}, problems: {} });
  const toast = useToast();

  const handleClearCache = async () => {
    try {
      await chrome.storage.local.remove(['stats']);
      toast.success('Cache cleared successfully');
    } catch (error) {
      toast.error('Failed to clear cache');
    }
  };

  const handleResetSettings = async () => {
    try {
      await chrome.storage.local.remove([
        'BaekjoonHub_token',
        'BaekjoonHub_username',
        'BaekjoonHub_hook',
        'mode_type',
        'repo',
        'BaekjoonHub_OrgOption',
        'bjhEnable',
      ]);
      toast.success('Settings reset successfully');
    } catch (error) {
      toast.error('Failed to reset settings');
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {/* Organization Settings */}
        <Card className="mb-8">
          <Card.Header>
            <Card.Title>File Organization</Card.Title>
            <Card.Description>Choose how your solutions are organized in GitHub</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="radio"
                  id="platform"
                  name="organize"
                  value="platform"
                  checked={organizeBy === 'platform'}
                  onChange={(e) => setOrganizeBy(e.target.value)}
                  className="rounded-full"
                />
                <div>
                  <label htmlFor="platform" className="font-medium">
                    Organize by Platform
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Group solutions by coding platform (BOJ, Programmers, etc.)
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="radio"
                  id="language"
                  name="organize"
                  value="language"
                  checked={organizeBy === 'language'}
                  onChange={(e) => setOrganizeBy(e.target.value)}
                  className="rounded-full"
                />
                <div>
                  <label htmlFor="language" className="font-medium">
                    Organize by Language
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Group solutions by programming language
                  </p>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Statistics */}
        <Card className="mb-8">
          <Card.Header>
            <Card.Title>Statistics</Card.Title>
            <Card.Description>Your BaekjoonHub usage statistics</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
                <p className="text-2xl font-bold">{Object.keys(stats.submission).length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unique Problems</p>
                <p className="text-2xl font-bold">{Object.keys(stats.problems).length}</p>
              </div>
            </div>
          </Card.Content>
          <Card.Footer>
            <Button variant="secondary" onClick={handleClearCache} className="w-full">
              Clear Cache
            </Button>
          </Card.Footer>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <Card.Header>
            <Card.Title className="text-destructive">Danger Zone</Card.Title>
            <Card.Description>Careful - these actions cannot be undone</Card.Description>
          </Card.Header>
          <Card.Content>
            <Button
              variant="outline"
              className="w-full border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={handleResetSettings}
            >
              Reset All Settings
            </Button>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
