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
    <li className="bg-white rounded-md shadow hover:scale-105 transition-all">
      <Link href={`/posts/${id}`}>
        <article className="flex-col gap-2">
          <div className="relative w-full h-36" role="img">
            <Image
              loading="lazy"
              className="rounded rounded-b-none"
              fill
              src={image}
              alt={title}
              objectFit="cover"
            />
          </div>
          <div className="p-4">
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

export default PostCard;
