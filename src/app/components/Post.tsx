import { FrontMatterResult } from 'front-matter';
import React from 'react';
import { MdAttributes } from '../posts/[postId]/page';
import { Marked } from 'marked';
import BadgeList from './BadgeList';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import plaintext from 'highlight.js/lib/languages/plaintext';
import typescript from 'highlight.js/lib/languages/typescript';
import glsl from 'highlight.js/lib/languages/glsl';
import 'highlight.js/styles/github.css';
import { baseUrl } from 'marked-base-url';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('plaintext', plaintext);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('glsl', glsl);

type PostProps = {
  post: FrontMatterResult<MdAttributes>;
  base: string;
};

const marked = new Marked(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight: (code, lang) => {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  }),
);

const parse = (markdown: string, base: string) => {
  marked.use(baseUrl(base));
  const parsedMarkDown = marked.parse(markdown);
  return parsedMarkDown;
};

const Post = ({ post, base }: PostProps) => {
  const parsedMarkDown = parse(
    `# ${post.attributes.title}\n${post.body}`,
    base,
  );
  if (!parsedMarkDown) return null;

  return (
    <div className="container m-auto rounded max-sm:rounded-none p-4 font-mono bg-white shadow">
      <div className="flex justify-between">
        <h3 className="text-gray-400 text-xs">{post.attributes.createdAt}</h3>
        <div>
          <BadgeList items={post.attributes.tags} />
        </div>
      </div>
      <div
        className="markdown-body font-mono pt-4"
        dangerouslySetInnerHTML={{
          __html: parsedMarkDown,
        }}
      />
    </div>
  );
};

export default Post;
