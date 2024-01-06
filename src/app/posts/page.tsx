import PostCardList from '../components/PostCardList';
import TopBar from '../components/TopBar';
import { resolve } from 'path';
import { readFile, readdir } from 'fs/promises';
import fm from 'front-matter';
import { MdAttributes } from '../posts/[postId]/page';
import { PostCardProps } from '../components/PostCard';
import { Metadata } from 'next';
import Background from '../components/Background';

const getPosts = async () => {
  const postNames = (await readdir(resolve(process.cwd(), 'src/posts'))).map(
    (file) => file.split('.')[0],
  );
  const postPaths = postNames.map((postName) =>
    resolve(process.cwd(), `src/posts/${postName}.md`),
  );

  const postsPromises = postPaths.map(async (postPath, index) => {
    const data = await readFile(postPath, 'utf-8');
    const content = fm<MdAttributes>(data);
    const post: PostCardProps = {
      ...content.attributes,
      id: postNames[index],
    };
    return post;
  });

  const posts = await Promise.all(postsPromises);
  posts.sort((a, b) => {
    // Desc order by createdAt
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  return posts;
};

export const metadata: Metadata = {
  metadataBase: new URL('https://shubidumdu.github.io/devlog/'),
  title: "Shubidumdu's Posts",
  description:
    '개발 중 마주친 문제 및 그에 대한 해결과, 어떤 것의 구현에 대한 과정을 기록합니다.',
  authors: [
    {
      name: 'Shubidumdu',
      url: 'https://github.com/Shubidumdu',
    },
  ],
  colorScheme: 'light',
  keywords: ['Shubidumdu', 'Devlog', 'Blog', '개발 블로그', '개발', '블로그'],
  openGraph: {
    title: "Shubidumdu's Posts",
    description:
      '개발 중 마주친 문제 및 그에 대한 해결과, 어떤 것의 구현에 대한 과정을 기록합니다.',
    images: './ogImage.png',
  },
};

export default async function Home() {
  const posts = await getPosts();

  return (
    <>
      <TopBar />
      <Background />
      <main className="container font-mono my-0 mx-auto mt-16 mb-32">
        <div>
          <PostCardList posts={posts} />
        </div>
      </main>
    </>
  );
}
