import React from 'react'
import fs, { readdir } from 'fs';
import { resolve as resolvePath } from 'path';
import fm, { type FrontMatterResult } from 'front-matter';
import Post from '@/app/components/Post';
import TopBar from '@/app/components/TopBar';

type PageProps = {
  params: {
    postId: string,
  }
};

export type MdAttributes = {
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
    <>
      <TopBar />
      <main className='flex flex-col min-h-full mt-16'>
        <Post post={post} />
      </main>
    </>
  )
}

export default Page