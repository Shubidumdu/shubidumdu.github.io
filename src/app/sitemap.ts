import { MetadataRoute } from 'next';
import { resolve as resolvePath } from 'path';
import { readdir, stat } from 'fs/promises';

const SITE_URL = 'https://shubidumdu.github.io';

const postPath = resolvePath(process.cwd(), 'src/posts');

const makePostUrl = (postId: string) => `${SITE_URL}/posts/${postId}`;

const getPosts = async () => {
  const postsFileNames = await readdir(postPath);
  const postNames = postsFileNames.map(async (fileName) => {
    const name = fileName.split('.')[0];
    const fileStat = await stat(resolvePath(postPath, fileName));
    const lastModified = fileStat.mtime;
    const loc = makePostUrl(name);
    return {
      name,
      loc,
      lastModified,
    };
  });
  return Promise.all(postNames);
};

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const posts = await getPosts();
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.5,
    },
    ...posts.map((post) => ({
      url: post.loc,
      lastModified: post.lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    })),
  ];
};

export default sitemap;
