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

  // Get featured projects (for homepage)
  async findFeatured(limit: number = 3): Promise<ProjectType[]> {
    await this.ensureConnection();
    
    const projects = await Project.find({ 
      status: { $in: ['active', 'completed'] } 
    })
      .sort({ displayOrder: 1, updatedAt: -1 })
      .limit(limit)
      .lean();

    return projects.map(doc => this.documentToProject(doc));
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
}

// Export a singleton instance
export const projectsRepo = new ProjectsRepository(); 