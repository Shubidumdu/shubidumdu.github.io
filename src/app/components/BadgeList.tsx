import React from 'react'
import Badge from './Badge'

type BadgeListProps = {
  items: string[]
}

const BadgeList = ({
  items,
}: BadgeListProps) => {
  return (
    <ul className='flex flex-wrap gap-2'>
      {items.map((item) => (
        <Badge key={item}>
          {item}
        </Badge>
      ))}
    </ul>
  )
}

export default BadgeList;
