import { config } from 'dotenv';
import path from 'path';

// Load environment variables
config({ path: path.join(process.cwd(), '.env') });

import dbConnect from '../lib/mongodb';
import Project from '../lib/models/Project';
import BoardMember from '../lib/models/BoardMember';
import { adminAuthRepo } from '../lib/repositories/adminAuth';
import type { ProjectInput, BoardMemberInput } from '../lib/types';

// Sample projects data
const sampleProjects: ProjectInput[] = [
  {
    title: "Quantum Computing Workshop Series",
    slug: "quantum-computing-workshop",
    description: "A comprehensive workshop series introducing students to quantum computing principles, quantum algorithms, and hands-on programming with Qiskit. Covers quantum gates, superposition, entanglement, and basic quantum algorithms like Deutsch-Jozsa and Grover's algorithm.",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop",
    tags: "quantum computing,workshops,education,programming",
    status: "active",
    links: JSON.stringify({
      website: "https://quantumworkshop.example.com",
      github: "https://github.com/gradientscience/quantum-workshop",
      materials: "https://drive.google.com/quantum-materials"
    }),
    displayOrder: 1
  },
  {
    title: "AI Ethics Research Project",
    slug: "ai-ethics-research",
    description: "Investigating the ethical implications of artificial intelligence in decision-making systems. Our team is conducting surveys, analyzing bias in ML models, and developing frameworks for responsible AI development in academic and industry settings.",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop",
    tags: "artificial intelligence,ethics,research,bias",
    status: "active",
    links: JSON.stringify({
      paper: "https://arxiv.org/abs/2023.ai-ethics",
      github: "https://github.com/gradientscience/ai-ethics",
      survey: "https://forms.gle/ai-ethics-survey"
    }),
    displayOrder: 2
  },
  {
    title: "Climate Data Visualization Platform",
    slug: "climate-data-viz",
    description: "Building an interactive web platform to visualize climate change data from various sources. The platform will help students and researchers understand climate trends, temperature changes, and environmental impacts through dynamic charts and maps.",
    imageUrl: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=600&fit=crop",
    tags: "climate change,data visualization,web development,environmental science",
    status: "planned",
    links: JSON.stringify({
      demo: "https://climate-viz.example.com",
      github: "https://github.com/gradientscience/climate-viz"
    }),
    displayOrder: 3
  },
  {
    title: "Bioinformatics Study Group",
    slug: "bioinformatics-study-group",
    description: "Weekly study sessions focused on computational biology and bioinformatics. We cover topics like sequence analysis, phylogenetics, structural biology, and genomics using tools like BLAST, Clustal, and Python BioPython library.",
    imageUrl: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&h=600&fit=crop",
    tags: "bioinformatics,computational biology,study group,genomics",
    status: "completed",
    links: JSON.stringify({
      resources: "https://bio-study.example.com",
      github: "https://github.com/gradientscience/bioinformatics"
    }),
    displayOrder: 4
  }
];

// Sample board members data with working profile images
const sampleBoardMembers: BoardMemberInput[] = [
  {
    name: "Sarah Chen",
    role: "President",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
    bio: "Third-year Computer Science major with a passion for machine learning and quantum computing. Previously interned at Google Research and published papers on neural network optimization.",
    socials: JSON.stringify({
      email: "sarah.chen@university.edu",
      linkedin: "https://linkedin.com/in/sarah-chen-cs",
      github: "https://github.com/sarahchen",
      website: "https://sarahchen.dev"
    }),
    displayOrder: 1,
    active: true
  },
  {
    name: "Marcus Rodriguez",
    role: "Vice President",
    photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face",
    bio: "Physics and Mathematics double major interested in theoretical physics and computational modeling. Leads our quantum computing initiatives and has experience with high-performance computing.",
    socials: JSON.stringify({
      email: "marcus.rodriguez@university.edu",
      linkedin: "https://linkedin.com/in/marcus-rodriguez-physics",
      github: "https://github.com/marcusrodriguez"
    }),
    displayOrder: 2,
    active: true
  },
  {
    name: "Emily Johnson",
    role: "Secretary",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
    bio: "Data Science major with expertise in statistical analysis and data visualization. Passionate about using data to solve environmental and social issues. Organizes our workshops and events.",
    socials: JSON.stringify({
      email: "emily.johnson@university.edu",
      linkedin: "https://linkedin.com/in/emily-johnson-datasci",
      twitter: "https://twitter.com/emily_dataviz"
    }),
    displayOrder: 3,
    active: true
  },
  {
    name: "David Kim",
    role: "Treasurer",
    photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
    bio: "Economics and Computer Science major with interests in algorithmic trading and financial technology. Manages club finances and coordinates funding for research projects.",
    socials: JSON.stringify({
      email: "david.kim@university.edu",
      linkedin: "https://linkedin.com/in/david-kim-fintech",
      github: "https://github.com/davidkim"
    }),
    displayOrder: 4,
    active: true
  },
  {
    name: "Aisha Patel",
    role: "Research Coordinator",
    photoUrl: "https://images.unsplash.com/photo-1594736797933-d0c29e4b0c40?w=400&h=400&fit=crop&crop=face",
    bio: "Bioengineering major focused on computational biology and medical AI. Coordinates research collaborations with faculty and organizes our bioinformatics study groups.",
    socials: JSON.stringify({
      email: "aisha.patel@university.edu",
      linkedin: "https://linkedin.com/in/aisha-patel-bioeng",
      github: "https://github.com/aishapatel",
      website: "https://aishapatel.bio"
    }),
    displayOrder: 5,
    active: true
  },
  {
    name: "James Thompson",
    role: "Workshop Coordinator",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    bio: "Computer Engineering major with expertise in embedded systems and IoT. Organizes hands-on technical workshops and maintains our lab equipment.",
    socials: JSON.stringify({
      email: "james.thompson@university.edu",
      linkedin: "https://linkedin.com/in/james-thompson-eng",
      github: "https://github.com/jamesthompson"
    }),
    displayOrder: 6,
    active: true
  }
];

export async function seedDatabase(): Promise<void> {
  console.log('🚀 Starting MongoDB database seeding...');

  try {
    // Connect to MongoDB
    await dbConnect();
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - remove this if you want to append)
    await Project.deleteMany({});
    await BoardMember.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Seed projects
    console.log('📝 Seeding projects...');
    for (const projectData of sampleProjects) {
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

      await project.save();
      console.log(`  ✅ Created project: ${project.title}`);
    }

    // Seed board members
    console.log('👥 Seeding board members...');
    for (const memberData of sampleBoardMembers) {
      const member = new BoardMember({
        name: memberData.name,
        role: memberData.role,
        photoUrl: memberData.photoUrl || '',
        bio: memberData.bio || '',
        socials: memberData.socials || '',
        displayOrder: memberData.displayOrder || 0,
        active: memberData.active !== undefined ? memberData.active : true,
      });

      await member.save();
      console.log(`  ✅ Created board member: ${member.name} (${member.role})`);
    }

    console.log('🎉 Database seeding completed successfully!');

    // Create admin user if none exists
    console.log('👤 Setting up admin user...');
    const hasAdmin = await adminAuthRepo.hasAdminUsers();
    
    if (!hasAdmin) {
      // Create default admin user (you should change this password!)
      const adminCreated = await adminAuthRepo.createAdminUser(
        'admin',
        'changeme123', // Default password - CHANGE THIS!
        'admin@gradientscience.club'
      );
      
      if (adminCreated) {
        console.log('  ✅ Default admin user created:');
        console.log('  📧 Username: admin');
        console.log('  🔐 Password: changeme123');
        console.log('  ⚠️  IMPORTANT: Change this password immediately!');
      }
    } else {
      console.log('  ✅ Admin user already exists');
    }

    // Verify the seeding
    const projectCount = await Project.countDocuments();
    const memberCount = await BoardMember.countDocuments();
    console.log(`📊 Total: ${projectCount} projects and ${memberCount} board members`);

  } catch (error) {
    console.error('❌ Error during database seeding:', error);
    throw error;
  } finally {
    // Note: We don't close the connection here as it might be used by other operations
    console.log('✨ Seeding process completed');
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding finished successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
} 