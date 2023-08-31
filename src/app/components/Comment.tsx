'use client';
import { useEffect, useRef, useState } from 'react';
import Spinner from './Spinner';

const UTTERANCES_SCRIPT_OPTIONS = {
  src: 'https://utteranc.es/client.js',
  repo: 'Shubidumdu/devlog',
  'issue-term': 'pathname',
  label: 'comment',
  theme: 'github-light',
  crossorigin: 'anonymous',
} as const;

const UTTERANCES_CLASS_NAME = 'utterances';

const attachUtterancesScript = (target: HTMLElement) => {
  const script = document.createElement('script');
  script.async = true;
  Object.entries(UTTERANCES_SCRIPT_OPTIONS).forEach(([key, value]) => {
    script.setAttribute(key, value);
  });
  target.append(script);
  return script;
};

type CommentProps = {
  className: string;
};

const Comment = ({ className }: CommentProps) => {
  const [isLoading, setLoading] = useState(true);
  const commentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const commentWrapper = commentRef.current;
    if (!commentWrapper) return;

    const observer = new MutationObserver((mutationList) => {
      mutationList.forEach((mutation) => {
        Array.from(mutation.addedNodes).some((node) => {
          const element = node as HTMLElement;
          element.classList.contains(UTTERANCES_CLASS_NAME) &&
            setLoading(false);
        });
      });
    });

    observer.observe(commentWrapper, {
      childList: true,
    });

    const script = attachUtterancesScript(commentWrapper);

    return () => {
      script.remove();
      commentWrapper.getElementsByClassName(UTTERANCES_CLASS_NAME)[0]?.remove();
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className={`[&>.utterances]:max-w-full container m-auto rounded max-sm:rounded-none p-4 font-mono bg-white shadow ${className}`}
      ref={commentRef}
    >
      {isLoading && (
        <div className="w-full mt-4 h-8 flex">
          <Spinner isLoading={isLoading} />
        </div>
      )}
    </div>
  );
};

export default Comment;
