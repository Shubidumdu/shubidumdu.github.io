import { Metadata } from 'next';
import { ProjectCardProps } from '../components/ProjectCard';
import ProjectCardList from '../components/ProjectCardList';
import TopBar from '../components/TopBar';

const PROJECTS: ProjectCardProps[] = [
  {
    title: 'LIGHTS OUT, SHOT DOWN',
    desc: '커스텀 셰이더를 적용한 3D 병 슈팅 게임, itch.io 1BIT 제출작',
    image: '/projects/lights-out-shot-down.png',
    tags: ['Game'],
    createdAt: '2023',
    href: 'https://shubidumdu.itch.io/lights-out-shot-down',
  },
  {
    title: '환세희담',
    desc: '1995년도 환세 시리즈 첫 작품인 환세희담을 웹으로 이식',
    image: '/projects/hwanseheedam.png',
    tags: ['Game'],
    createdAt: '2023',
    href: 'https://shubidumdu.github.io/hwanseheedam/',
  },
  {
    title: 'Dice 3D',
    desc: '물리엔진을 적용한 3D 주사위',
    image: '/projects/dice-3d.png',
    tags: ['Toy'],
    createdAt: '2023',
    href: 'https://shubidumdu.github.io/dice-3d/',
  },
  {
    title: 'Finn: the Little Collector',
    desc: '"월리를 찾아라" 컨셉의 캐주얼 게임, 2022년도 JS13KGames 32위 수상작',
    image: '/projects/finn-the-little-collector.png',
    tags: ['Game'],
    createdAt: '2022',
    href: 'https://js13kgames.com/games/finn-the-little-collector/index.html',
  },
  {
    title: 'Astroach',
    desc: '4x4 타일 기반의 액션게임, 2021년도 JS13KGames 제출작',
    image: '/projects/astroach.png',
    tags: ['Game'],
    createdAt: '2021',
    href: 'https://js13kgames.com/games/astroach/index.html',
  },
  {
    title: '절대집중시간',
    desc: '반복 집중/휴식 타이머',
    image: '/projects/hyper-focus-time.png',
    tags: ['Tool'],
    createdAt: '2020',
    href: 'https://shubidumdu.github.io/hyper-focus-time/',
  },
];

export const metadata: Metadata = {
  metadataBase: new URL('https://shubidumdu.github.io/'),
  title: "Shubidumdu's Projects",
  description:
    '기업 아래 진행한 것들을 제외하고, 지금껏 개인적으로 진행한 프로젝트들의 모음입니다.',
  authors: [
    {
      name: 'Shubidumdu',
      url: 'https://github.com/Shubidumdu',
    },
  ],
  colorScheme: 'light',
  keywords: ['Shubidumdu', 'Devlog', 'Blog', '개발 블로그', '개발', '블로그'],
  openGraph: {
    title: "Shubidumdu's Projects",
    description:
      '기업 아래 진행한 것들을 제외하고, 지금껏 개인적으로 진행한 프로젝트들의 모음입니다.',
    images: './ogImage.png',
  },
};

export default function Projects() {
  return (
    <>
      <TopBar />
      <Background />
      <main className="container font-mono my-0 mx-auto mt-16 mb-32">
        <div>
          <ProjectCardList projects={PROJECTS} />
        </div>
      </main>
    </>
  );
}
