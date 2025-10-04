import dbConnect from '../mongodb';
import Project from '../models/Project';
import { Project as ProjectType, ProjectInput } from '../types';

export class ProjectsRepository {
  // Ensure database connection
  private async ensureConnection() {
    await dbConnect();
  }

  // Convert MongoDB document to our Project type
  private documentToProject(doc: any): ProjectType {
    return {
      id: doc._id?.toString() || doc.id,
      title: doc.title,
      slug: doc.slug,
      description: doc.description,
      imageUrl: doc.imageUrl || '',
      imageBase64: doc.imageBase64 || '',
      tags: doc.tags || '',
      status: doc.status,
      links: doc.links || '',
      displayOrder: doc.displayOrder,
      createdAt: doc.createdAt?.toISOString ? doc.createdAt.toISOString() : doc.createdAt,
      updatedAt: doc.updatedAt?.toISOString ? doc.updatedAt.toISOString() : doc.updatedAt,
    };
  }

  // Get all projects, optionally filtered by status
  async findAll(status?: string): Promise<ProjectType[]> {
    await this.ensureConnection();
    
    const query = status ? { status } : {};
    const projects = await Project.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();
    
    return projects.map(doc => this.documentToProject(doc));
  }

  // Get projects sorted by status groups (planned > active > completed) then by display order
  async findAllByStatusGroups(): Promise<ProjectType[]> {
    await this.ensureConnection();
    
    const projects = await Project.find({})
      .lean();
    
    const projectsTyped = projects.map(doc => this.documentToProject(doc));
    
    // Sort by status priority then by display order within each status
    return projectsTyped.sort((a, b) => {
      const statusOrder = { 'planned': 0, 'active': 1, 'completed': 2 };
      const aStatusOrder = statusOrder[a.status as keyof typeof statusOrder] ?? 3;
      const bStatusOrder = statusOrder[b.status as keyof typeof statusOrder] ?? 3;
      
      if (aStatusOrder !== bStatusOrder) {
        return aStatusOrder - bStatusOrder;
      }
      
      // Within same status, sort by display order
      return a.displayOrder - b.displayOrder;
    });
  }

  // Get active projects for public display
  async findActive(): Promise<ProjectType[]> {
    return this.findAll('active');
  }

  // Get a project by slug
  async findBySlug(slug: string): Promise<ProjectType | null> {
    await this.ensureConnection();
    
    const project = await Project.findOne({ slug }).lean();
    if (!project) return null;
    
    return this.documentToProject(project);
  }

  // Get a project by ID
  async findById(id: string): Promise<ProjectType | null> {
    await this.ensureConnection();
    
    const project = await Project.findById(id).lean();
    if (!project) return null;
    
    return this.documentToProject(project);
  }

  // Create a new project
  async create(projectData: ProjectInput): Promise<ProjectType> {
    await this.ensureConnection();
    
    // Check if slug already exists
    const existingProject = await Project.findOne({ slug: projectData.slug });
    if (existingProject) {
      throw new Error(`Project with slug "${projectData.slug}" already exists`);
    }

    const project = new Project({
      title: projectData.title,
      slug: projectData.slug,
      description: projectData.description,
      imageUrl: projectData.imageUrl || '',
      imageBase64: projectData.imageBase64 || '',
      tags: projectData.tags || '',
      status: projectData.status || 'planned',
      links: projectData.links || '',
      displayOrder: projectData.displayOrder || 0,
    });

    const savedProject = await project.save();
    return this.documentToProject(savedProject.toObject());
  }

  // Update an existing project
  async update(id: string, projectData: Partial<ProjectInput>): Promise<ProjectType> {
    await this.ensureConnection();
    
    // If slug is being updated, check for conflicts
    if (projectData.slug) {
      const existingProject = await Project.findOne({ 
        slug: projectData.slug, 
        _id: { $ne: id } 
      });
      if (existingProject) {
        throw new Error(`Project with slug "${projectData.slug}" already exists`);
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { ...projectData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      throw new Error(`Project with ID ${id} not found`);
    }

    return this.documentToProject(updatedProject.toObject());
  }

  // Delete a project
  async delete(id: string): Promise<void> {
    await this.ensureConnection();
    
    const deletedProject = await Project.findByIdAndDelete(id);
    if (!deletedProject) {
      throw new Error(`Project with ID ${id} not found`);
    }
  }

  // Get featured projects (all statuses, but sorted by status groups)
  async findFeatured(limit: number = 6): Promise<ProjectType[]> {
    const projects = await this.findAllByStatusGroups();
    return projects.slice(0, limit);
  }

  // Generate a unique slug from title
  async generateSlug(title: string): Promise<string> {
    await this.ensureConnection();
    
    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    let slug = baseSlug;
    let counter = 1;

    while (await Project.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  // Get projects with their assigned members
  async findAllWithMembers(): Promise<ProjectType[]> {
    await this.ensureConnection();
    
    // Import dynamically to avoid circular dependency
    const ProjectMember = (await import('../models/ProjectMember')).default;
    
    const projects = await Project.find({})
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();
    
    const projectsWithMembers = await Promise.all(
      projects.map(async (project) => {
        try {
          const members = await ProjectMember.find({ projectId: (project as any)._id })
            .populate({
              path: 'memberId',
              select: 'name role roleType photoUrl photoBase64 bio socials displayOrder active'
            })
            .sort({ joinedAt: 1 })
            .lean();

          const formattedMembers = members.map((pm: any) => ({
            id: pm._id.toString(),
            projectId: pm.projectId.toString(),
            memberId: pm.memberId._id.toString(),
            role: pm.role as 'member' | 'coordinator',
            joinedAt: pm.joinedAt.toISOString(),
            member: {
              id: pm.memberId._id.toString(),
              name: pm.memberId.name,
              role: pm.memberId.role,
              roleType: pm.memberId.roleType,
              photoUrl: pm.memberId.photoUrl || '',
              photoBase64: pm.memberId.photoBase64 || '',
              bio: pm.memberId.bio || '',
              socials: pm.memberId.socials || '',
              displayOrder: pm.memberId.displayOrder,
              active: pm.memberId.active,
              createdAt: pm.memberId.createdAt?.toISOString ? pm.memberId.createdAt.toISOString() : pm.memberId.createdAt,
              updatedAt: pm.memberId.updatedAt?.toISOString ? pm.memberId.updatedAt.toISOString() : pm.memberId.updatedAt,
            }
          }));

          return {
            ...this.documentToProject(project),
            members: formattedMembers
          };
        } catch (error) {
          console.error(`Error fetching members for project ${(project as any)._id}:`, error);
          return {
            ...this.documentToProject(project),
            members: []
          };
        }
      })
    );
    
    return projectsWithMembers;
  }

  // Get a single project with its members
  async findBySlugWithMembers(slug: string): Promise<ProjectType | null> {
    await this.ensureConnection();
    
    const project = await Project.findOne({ slug }).lean();
    if (!project) return null;
    
    // Import dynamically to avoid circular dependency
    const ProjectMember = (await import('../models/ProjectMember')).default;
    
    try {
      const members = await ProjectMember.find({ projectId: (project as any)._id })
        .populate({
          path: 'memberId',
          select: 'name role roleType photoUrl photoBase64 bio socials displayOrder active'
        })
        .sort({ joinedAt: 1 })
        .lean();

      const formattedMembers = members.map((pm: any) => ({
        id: pm._id.toString(),
        projectId: pm.projectId.toString(),
        memberId: pm.memberId._id.toString(),
        role: pm.role as 'member' | 'coordinator',
        joinedAt: pm.joinedAt.toISOString(),
        member: {
          id: pm.memberId._id.toString(),
          name: pm.memberId.name,
          role: pm.memberId.role,
          roleType: pm.memberId.roleType,
          photoUrl: pm.memberId.photoUrl || '',
          photoBase64: pm.memberId.photoBase64 || '',
          bio: pm.memberId.bio || '',
          socials: pm.memberId.socials || '',
          displayOrder: pm.memberId.displayOrder,
          active: pm.memberId.active,
          createdAt: pm.memberId.createdAt?.toISOString ? pm.memberId.createdAt.toISOString() : pm.memberId.createdAt,
          updatedAt: pm.memberId.updatedAt?.toISOString ? pm.memberId.updatedAt.toISOString() : pm.memberId.updatedAt,
        }
      }));

      return {
        ...this.documentToProject(project),
        members: formattedMembers
      };
    } catch (error) {
      console.error(`Error fetching members for project ${(project as any)._id}:`, error);
      return {
        ...this.documentToProject(project),
        members: []
      };
    }
  }
}

// Export a singleton instance
export const projectsRepo = new ProjectsRepository(); 