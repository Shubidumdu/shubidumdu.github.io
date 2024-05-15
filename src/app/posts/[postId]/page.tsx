import React from 'react';
import fs, { readdir } from 'fs';
import { resolve as resolvePath } from 'path';
import fm, { type FrontMatterResult } from 'front-matter';
import Post from '@/app/components/Post';
import TopBar from '@/app/components/TopBar';
import { Metadata } from 'next';
import Comment from '@/app/components/Comment';

type PageProps = {
  params: {
    postId: string;
  };
};

export type MdAttributes = {
  title: string;
  desc: string;
  image: string;
  tags: string[];
  createdAt: string;
};

type PostPageStaticParams = {
  postId: string;
}[];

export const generateStaticParams = () =>
  new Promise<PostPageStaticParams>((resolve) => {
    readdir(resolvePath(process.cwd(), 'src/posts'), (err, files) => {
      const postNames = files.map((file) => file.split('.')[0]);
      const postIds = postNames.map((postId) => ({ postId }));
      resolve(postIds);
    });
  });

const BASE_URL = process.env.BASE || '';

export const generateMetadata = async ({
  params,
}: PageProps): Promise<Metadata> => {
  const { postId } = params;
  const post = await getPost(postId);

  return {
    metadataBase: new URL('https://shubidumdu.github.io/'),
    title: post.attributes.title,
    description: post.attributes.desc,
    authors: [
      {
        name: 'Shubidumdu',
        url: 'https://github.com/Shubidumdu',
      },
    ],
    colorScheme: 'light',
    keywords: [
      'Shubidumdu',
      'Devlog',
      'Blog',
      '개발 블로그',
      '개발',
      '블로그',
      ...post.attributes.tags,
    ],
    openGraph: {
      title: post.attributes.title,
      description: post.attributes.desc,
      type: 'article',
      countryName: 'KR',
      images: post.attributes.image,
    },
  };
};

const getPost = (postId: string) =>
  new Promise<FrontMatterResult<MdAttributes>>((resolve) => {
    const file = resolvePath(process.cwd(), `src/posts/${postId}.md`);
    fs.readFile(file, 'utf-8', (err, data) => {
      const content = fm<MdAttributes>(data);
      resolve(content);
    });
  });

const Page = async ({ params }: PageProps) => {
  const { postId } = params;
  const post = await getPost(postId);

  return (
    <>
      <TopBar />
      <main className="flex flex-col min-h-full mt-16 mb-32 sm:p-4">
        <Post post={post} base={`${BASE_URL}/${postId}/`} />
        <Comment />
      </main>
    </>
  );
};

export default Page;
