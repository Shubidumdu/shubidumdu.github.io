import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import BadgeList from './BadgeList';

export type ProjectCardProps = {
  title: string;
  desc: string;
  image: string;
  tags: string[];
  href: string;
  createdAt: string;
};

const ProjectCard = ({
  title,
  desc,
  image,
  tags,
  href,
  createdAt,
}: ProjectCardProps) => {
  return (
    <li className="bg-white rounded-md shadow hover:scale-105 transition-all">
      <Link className="h-full" href={href}>
        <article className="flex flex-row h-full max-sm:flex-col">
          <div
            className="relative min-w-[12rem] h-full max-sm:min-h-[8rem]"
            role="img"
          >
            <Image
              loading="lazy"
              className="rounded rounded-r-none object-cover max-sm:rounded-b-none max-sm:rounded-t"
              fill
              src={image}
              alt={title}
            />
          </div>
          <div className="w-full p-4 pb-2 pt-2">
            <h3 className="text-lg mb-1 font-bold text-gray-800">{title}</h3>
            <p className="text-sm mb-2 font-normal text-gray-700">{desc}</p>
            <div className="flex justify-between items-end">
              {tags ? <BadgeList items={tags} /> : null}
              <time className="text-xs text-gray-400" dateTime={createdAt}>
                {createdAt}
              </time>
            </div>
          </div>
        </article>
      </Link>
    </li>
  );
};

export default ProjectCard;
