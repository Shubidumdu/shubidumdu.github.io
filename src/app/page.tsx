import { redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://blog.shubidumdu.com/'),
  title: 'Shubidumdu',
  description:
    '레트로, 신스팝, 디스코, 호러 따위를 좋아하는 프론트엔드 개발자 Shubidumdu입니다.',
  authors: [
    {
      name: 'Shubidumdu',
      url: 'https://studio.shubidumdu.com/',
    },
  ],
  colorScheme: 'light',
  keywords: ['Shubidumdu', 'Frontend', 'Developer'],
  openGraph: {
    title: 'Shubidumdu',
    description:
      '레트로, 신스팝, 디스코, 호러 따위를 좋아하는 프론트엔드 개발자 Shubidumdu입니다.',
    images: './ogImage.png',
  },
};

export default async function Home() {
  redirect('/posts');
}
