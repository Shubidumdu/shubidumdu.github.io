import React from 'react'
import PostCard, { PostCardProps } from './PostCard'

type PostCardListProps = {
  posts: PostCardProps[],
}

const PostCardList = ({ posts }: PostCardListProps) => {
  if (posts.length === 0) {
    return (
      <div>
        No Posts
      </div>
    )
  }
  
  return (
    <ul className='grid grid-cols-2 max-lg:p-2 max-sm:grid-cols-1 gap-4 max-w-4xl m-auto'>
      {posts.map((post) => (
        <PostCard key={post.id} {...post} />
      ))}
    </ul>
  )
}

export default PostCardList