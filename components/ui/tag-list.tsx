import React from 'react'
import { Badge } from "@/components/ui/badge"

interface TagListProps {
  tags: string[]
}

export const TagList: React.FC<TagListProps> = ({
  tags,
}) => (
  <div className="flex flex-wrap gap-2 p-2  rounded-md">
    {tags.map(tag => (
      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
        {tag}
      </Badge>
    ))}
  </div>
)
