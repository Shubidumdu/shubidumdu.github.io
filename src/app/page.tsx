import PostCardList from './components/PostCardList';
import TopBar from './components/TopBar';
import { resolve } from 'path';
import { readFile, readdir } from 'fs/promises';
import fm from 'front-matter';
import { MdAttributes } from './posts/[postId]/page';
import { PostCardProps } from './components/PostCard';

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
  return posts;
};

export default async function Home() {
  const posts = await getPosts();

  return (
    <>
      <TopBar />
      <main className="container font-mono my-0 mx-auto mt-16">
        <div>
          <PostCardList posts={posts} />
        </div>
      </main>
    </>
  );
}
