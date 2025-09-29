// Form validation utilities for the Gradient Science Club website
import type { ProjectInput, BoardMemberInput, ProjectLinks, MemberSocials } from './types';

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  fieldErrors: ValidationError[];
}

// Validation rules
export const ValidationRules = {
  required: (value: any, fieldName: string): string | null => {
    if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required`;
    }
    return null;
  },

  minLength: (value: string, min: number, fieldName: string): string | null => {
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters long`;
    }
    return null;
  },

  maxLength: (value: string, max: number, fieldName: string): string | null => {
    if (value.length > max) {
      return `${fieldName} must be no more than ${max} characters long`;
    }
    return null;
  },

  url: (value: string, fieldName: string): string | null => {
    if (!value) return null; // Allow empty URLs
    try {
      new URL(value);
      return null;
    } catch {
      return `${fieldName} must be a valid URL`;
    }
  },

  email: (value: string, fieldName: string): string | null => {
    if (!value) return null; // Allow empty emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return `${fieldName} must be a valid email address`;
    }
    return null;
  },

  slug: (value: string, fieldName: string): string | null => {
    if (!value) return `${fieldName} is required`;
    if (!/^[a-z0-9-]+$/.test(value)) {
      return `${fieldName} can only contain lowercase letters, numbers, and hyphens`;
    }
    if (value.startsWith('-') || value.endsWith('-')) {
      return `${fieldName} cannot start or end with a hyphen`;
    }
    if (value.includes('--')) {
      return `${fieldName} cannot contain consecutive hyphens`;
    }
    return null;
  },

  json: (value: string, fieldName: string): string | null => {
    if (!value) return null; // Allow empty JSON
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
        return `${fieldName} must be a valid JSON object`;
      }
      return null;
    } catch {
      return `${fieldName} must be valid JSON`;
    }
  },

  number: (value: any, fieldName: string): string | null => {
    const num = Number(value);
    if (isNaN(num)) {
      return `${fieldName} must be a valid number`;
    }
    return null;
  },

  min: (value: number, min: number, fieldName: string): string | null => {
    if (value < min) {
      return `${fieldName} must be at least ${min}`;
    }
    return null;
  },

  max: (value: number, max: number, fieldName: string): string | null => {
    if (value > max) {
      return `${fieldName} must be no more than ${max}`;
    }
    return null;
  },
};

// Utility functions
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Project validation
export const validateProject = (data: ProjectInput): FormValidationResult => {
  const errors: Record<string, string> = {};
  const fieldErrors: ValidationError[] = [];

  // Title validation
  const titleError = ValidationRules.required(data.title, 'Title') ||
    ValidationRules.minLength(data.title?.trim() || '', 3, 'Title') ||
    ValidationRules.maxLength(data.title?.trim() || '', 100, 'Title');
  if (titleError) {
    errors.title = titleError;
    fieldErrors.push({ field: 'title', message: titleError });
  }

  // Slug validation
  const slugError = ValidationRules.slug(data.slug || '', 'URL slug') ||
    ValidationRules.maxLength(data.slug || '', 50, 'URL slug');
  if (slugError) {
    errors.slug = slugError;
    fieldErrors.push({ field: 'slug', message: slugError });
  }

  // Description validation (optional) - no length requirements

  // Image URL validation
  if (data.imageUrl) {
    const imageUrlError = ValidationRules.url(data.imageUrl, 'Image URL');
    if (imageUrlError) {
      errors.imageUrl = imageUrlError;
      fieldErrors.push({ field: 'imageUrl', message: imageUrlError });
    }
  }

  // Tags validation
  if (data.tags) {
    const tagsError = ValidationRules.maxLength(data.tags, 200, 'Tags');
    if (tagsError) {
      errors.tags = tagsError;
      fieldErrors.push({ field: 'tags', message: tagsError });
    }
  }

  // Links validation
  if (data.links) {
    const linksJsonError = ValidationRules.json(data.links, 'Links');
    if (linksJsonError) {
      errors.links = linksJsonError;
      fieldErrors.push({ field: 'links', message: linksJsonError });
    } else {
      // Validate individual URLs in links
      try {
        const links: ProjectLinks = JSON.parse(data.links);
        for (const [key, url] of Object.entries(links)) {
          if (url && !isValidUrl(url)) {
            const linkError = `Link "${key}" must be a valid URL`;
            errors.links = linkError;
            fieldErrors.push({ field: 'links', message: linkError });
            break;
          }
        }
      } catch {
        // Already handled by JSON validation above
      }
    }
  }

  // Display order validation
  if (data.displayOrder !== undefined) {
    const displayOrderError = ValidationRules.number(data.displayOrder, 'Display order') ||
      ValidationRules.min(Number(data.displayOrder), 0, 'Display order');
    if (displayOrderError) {
      errors.displayOrder = displayOrderError;
      fieldErrors.push({ field: 'displayOrder', message: displayOrderError });
    }
  }

  return {
    isValid: fieldErrors.length === 0,
    errors,
    fieldErrors,
  };
};

// Board member validation
export const validateBoardMember = (data: BoardMemberInput): FormValidationResult => {
  const errors: Record<string, string> = {};
  const fieldErrors: ValidationError[] = [];

  // Name validation
  const nameError = ValidationRules.required(data.name, 'Name') ||
    ValidationRules.minLength(data.name?.trim() || '', 2, 'Name') ||
    ValidationRules.maxLength(data.name?.trim() || '', 100, 'Name');
  if (nameError) {
    errors.name = nameError;
    fieldErrors.push({ field: 'name', message: nameError });
  }

  // Role validation - required for board_member and coordinator, optional for member
  if (data.roleType !== 'member') {
    const roleError = ValidationRules.required(data.role, 'Role') ||
      ValidationRules.minLength(data.role?.trim() || '', 2, 'Role') ||
      ValidationRules.maxLength(data.role?.trim() || '', 100, 'Role');
    if (roleError) {
      errors.role = roleError;
      fieldErrors.push({ field: 'role', message: roleError });
    }
  } else if (data.role) {
    // If role is provided for member type, validate its length
    const roleError = ValidationRules.minLength(data.role?.trim() || '', 2, 'Role') ||
      ValidationRules.maxLength(data.role?.trim() || '', 100, 'Role');
    if (roleError) {
      errors.role = roleError;
      fieldErrors.push({ field: 'role', message: roleError });
    }
  }

  // Photo URL validation
  if (data.photoUrl) {
    const photoUrlError = ValidationRules.url(data.photoUrl, 'Photo URL');
    if (photoUrlError) {
      errors.photoUrl = photoUrlError;
      fieldErrors.push({ field: 'photoUrl', message: photoUrlError });
    }
  }

  // Bio validation (optional) - no length requirements

  // Socials validation
  if (data.socials) {
    const socialsJsonError = ValidationRules.json(data.socials, 'Social links');
    if (socialsJsonError) {
      errors.socials = socialsJsonError;
      fieldErrors.push({ field: 'socials', message: socialsJsonError });
    } else {
      // Validate individual URLs/emails in socials
      try {
        const socials: MemberSocials = JSON.parse(data.socials);
        for (const [platform, value] of Object.entries(socials)) {
          if (value) {
            // Allow both URLs and emails for social links
            if (!isValidUrl(value) && !isValidEmail(value)) {
              const socialError = `Social link "${platform}" must be a valid URL or email address`;
              errors.socials = socialError;
              fieldErrors.push({ field: 'socials', message: socialError });
              break;
            }
          }
        }
      } catch {
        // Already handled by JSON validation above
      }
    }
  }

  // Display order validation
  if (data.displayOrder !== undefined) {
    const displayOrderError = ValidationRules.number(data.displayOrder, 'Display order') ||
      ValidationRules.min(Number(data.displayOrder), 0, 'Display order');
    if (displayOrderError) {
      errors.displayOrder = displayOrderError;
      fieldErrors.push({ field: 'displayOrder', message: displayOrderError });
    }
  }

  return {
    isValid: fieldErrors.length === 0,
    errors,
    fieldErrors,
  };
};

// Real-time field validation for individual fields
export const validateField = (
  fieldName: string,
  value: any,
  rules: Array<(value: any, fieldName: string) => string | null>
): string | null => {
  for (const rule of rules) {
    const error = rule(value, fieldName);
    if (error) return error;
  }
  return null;
};

// Debounced validation helper
export const createDebouncedValidator = (
  validator: (value: any) => string | null,
  delay: number = 300
) => {
  let timeoutId: NodeJS.Timeout;
  
  return (value: any, callback: (error: string | null) => void) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const error = validator(value);
      callback(error);
    }, delay);
  };
};

// Auto-save functionality helpers
export interface AutoSaveOptions {
  key: string;
  delay: number;
  onSave?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const createAutoSave = (options: AutoSaveOptions) => {
  let timeoutId: NodeJS.Timeout;
  
  return (data: any) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(`autosave_${options.key}`, JSON.stringify({
          data,
          timestamp: Date.now(),
        }));
        options.onSave?.(data);
      } catch (error) {
        options.onError?.(error as Error);
      }
    }, options.delay);
  };
};

export const getAutoSavedData = (key: string, maxAge: number = 24 * 60 * 60 * 1000): any | null => {
  try {
    const saved = localStorage.getItem(`autosave_${key}`);
    if (!saved) return null;
    
    const { data, timestamp } = JSON.parse(saved);
    if (Date.now() - timestamp > maxAge) {
      localStorage.removeItem(`autosave_${key}`);
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
};

export const clearAutoSavedData = (key: string) => {
  localStorage.removeItem(`autosave_${key}`);
}; 