import React from 'react';
import ProjectCard, { ProjectCardProps } from './ProjectCard';

type ProjectCardListProps = {
  projects: ProjectCardProps[];
};

const ProjectCardList = ({ projects }: ProjectCardListProps) => {
  if (projects.length === 0) {
    return <div>No Posts</div>;
  }

  return (
    <ul className="grid grid-cols-1 max-lg:p-2 max-sm:grid-cols-1 gap-4 max-w-3xl m-auto">
      {projects.map((post) => (
        <ProjectCard key={post.title} {...post} />
      ))}
    </ul>
  );
};

export default ProjectCardList;
