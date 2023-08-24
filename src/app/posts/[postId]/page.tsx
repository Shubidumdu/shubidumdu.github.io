import React from 'react'
import fs, { readdir } from 'fs';
import { resolve as resolvePath } from 'path';
import fm, { type FrontMatterResult } from 'front-matter';
import Image from 'next/image';

type PageProps = {
  params: {
    postId: string,
  }
};

type MdAttributes = {
  title: string,
  desc: string,
  image: string,
  tags: string[],
  createdAt: string,
}

export const generateStaticParams = () => new Promise((resolve) => {
  readdir(resolvePath(process.cwd(), 'src/posts'), (err, files) => {
    const postNames = files.map((file) => file.split('.')[0]);
    resolve(postNames);
  });
});

const getPost = (postId: string) => new Promise<FrontMatterResult<MdAttributes>>((resolve) => {
  const file = resolvePath(process.cwd(), `src/posts/${postId}.md`);
  fs.readFile(file, 'utf-8', (err, data) => {
    const content = fm<MdAttributes>(data);
    resolve(content);
  });
});

const Page = async ({
  params
}: PageProps) => {
  const { postId } = params;
  const post = await getPost(postId);
  
  return (
    <main className='flex flex-col min-h-full'>
      <h1>
        {post.attributes.title}
      </h1>
      <h3>
        {post.attributes.desc}
      </h3>
      <h3>
        {post.attributes.createdAt}
      </h3>
      <div>
        {post.attributes.tags.map((tag) => (
          <span key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <div className='container p-4 font-mono bg-white'>
        {post.body}
      </div>
    </main>
  )
}

export default Page