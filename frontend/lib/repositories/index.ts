// Repository exports for MongoDB-based data access
export { projectsRepo, ProjectsRepository } from './projects';
export { boardMembersRepo, BoardMembersRepository } from './boardMembers';

// Note: Old JSON-based storage has been replaced with MongoDB
// All repositories now use MongoDB with Mongoose ODM 