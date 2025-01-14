import React from 'react';
import { Card } from './ui/Card';
import { Problem } from '@/types/problem';

interface ProblemInfoProps {
  problem: Problem;
  className?: string;
}

export const ProblemInfo: React.FC<ProblemInfoProps> = ({ problem, className }) => {
  return (
    <Card className={className}>
      <Card.Header>
        <Card.Title>
          <a
            href={problem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {problem.title}
          </a>
        </Card.Title>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-muted-foreground">{problem.level}</span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">{problem.platform}</span>
        </div>
      </Card.Header>

      <Card.Content>
        {problem.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {problem.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-secondary text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="prose prose-sm max-w-none dark:prose-invert">
          <div dangerouslySetInnerHTML={{ __html: problem.description }} />

          {problem.input && (
            <>
              <h3 className="text-base font-semibold mt-4">입력</h3>
              <div dangerouslySetInnerHTML={{ __html: problem.input }} />
            </>
          )}

          {problem.output && (
            <>
              <h3 className="text-base font-semibold mt-4">출력</h3>
              <div dangerouslySetInnerHTML={{ __html: problem.output }} />
            </>
          )}
        </div>
      </Card.Content>
    </Card>
  );
};
