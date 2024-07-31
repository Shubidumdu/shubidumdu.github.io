import React from 'react';
import { MdAttributes } from '../posts/[postId]/page';
import Image from 'next/image';
import Link from 'next/link';
import BadgeList from './BadgeList';

export type PostCardProps = {
  id: string;
} & MdAttributes;

const PostCard = ({
  id,
  title,
  desc,
  image,
  tags,
  createdAt,
}: PostCardProps) => {
  return (
    <li className="bg-white dark:bg-gray-800 rounded-md shadow hover:scale-105 transition-all">
      <Link className="h-full" href={`/posts/${id}`}>
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
            <h3 className="text-lg mb-1 font-bold text-gray-800 dark:text-gray-100">
              {title}
            </h3>
            <p className="text-sm mb-2 font-normal text-gray-700 dark:text-gray-300">
              {desc}
            </p>
            <div className="flex justify-between items-end">
              {tags ? <BadgeList items={tags} /> : null}
              <time
                className="text-xs text-gray-400 dark:text-gray-500"
                dateTime={createdAt}
              >
                {createdAt}
              </time>
            </div>
          </div>
        </article>
      </Link>
    </li>
  );
};

export default PostCard;
