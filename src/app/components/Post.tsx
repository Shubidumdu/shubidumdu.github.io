import { FrontMatterResult } from 'front-matter';
import React from 'react';
import { MdAttributes } from '../posts/[postId]/page';
import { marked } from 'marked';
import BadgeList from './BadgeList';

type PostProps = {
  post: FrontMatterResult<MdAttributes>;
};

const Post = ({ post }: PostProps) => {
  const parsedMarkDown = marked(post.body);

  return (
    <div className="container m-auto rounded max-sm:rounded-none p-4 font-mono bg-white shadow">
      <div className="flex justify-between">
        <h3 className="text-gray-400 text-xs">{post.attributes.createdAt}</h3>
        <div>
          <BadgeList items={post.attributes.tags} />
        </div>
      </div>
      <div
        className="markdown-body font-mono"
        dangerouslySetInnerHTML={{
          __html: parsedMarkDown,
        }}
      />
    </div>
  );
};

export default Post;
