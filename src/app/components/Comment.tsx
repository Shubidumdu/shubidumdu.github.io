'use client';
import { useEffect, useRef } from 'react';

const UTTERANCES_SCRIPT_OPTIONS = {
  src: 'https://utteranc.es/client.js',
  repo: 'Shubidumdu/shubidumdu.github.io',
  'issue-term': 'pathname',
  label: 'comment',
  theme: window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark-blue'
    : 'github-light',
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

const Comment = () => {
  const commentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const commentWrapper = commentRef.current;
    if (!commentWrapper) return;

    const script = attachUtterancesScript(commentWrapper);

    return () => {
      script.remove();
      commentWrapper.getElementsByClassName(UTTERANCES_CLASS_NAME)[0]?.remove();
    };
  }, []);

  return (
    <div
      className="[&>.utterances]:max-w-4xl container m-auto rounded max-sm:rounded-none p-4 font-mono mt-4"
      ref={commentRef}
    />
  );
};

export default Comment;
