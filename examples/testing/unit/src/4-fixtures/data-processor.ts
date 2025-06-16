import { format } from 'date-fns';

export interface RawUserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string; // ISO string
  address: {
    street: string;
    city: string;
    country: string;
    zipCode: string;
  };
  preferences: {
    language: string;
    newsletter: boolean;
    notifications: boolean;
  };
  metadata: {
    createdAt: string;
    lastLoginAt?: string;
    loginCount: number;
  };
}

export interface ProcessedUser {
  id: string;
  fullName: string;
  email: string;
  age: number;
  formattedAddress: string;
  isActive: boolean;
  preferences: {
    language: string;
    newsletter: boolean;
    notifications: boolean;
  };
  accountAge: number; // days since creation
  lastLoginFormatted?: string;
}

export interface DataValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class DataProcessor {
  processUserData(rawData: RawUserData): ProcessedUser {
    const validation = this.validateUserData(rawData);
    if (!validation.isValid) {
      throw new Error(`Invalid user data: ${validation.errors.join(', ')}`);
    }

    const birthDate = new Date(rawData.birthDate);
    const createdAt = new Date(rawData.metadata.createdAt);
    const now = new Date();

    const age = this.calculateAge(birthDate, now);
    const accountAge = this.calculateDaysDifference(createdAt, now);
    const isActive = this.determineUserActivity(rawData.metadata);

    return {
      id: rawData.id,
      fullName: `${rawData.firstName} ${rawData.lastName}`.trim(),
      email: rawData.email.toLowerCase(),
      age,
      formattedAddress: this.formatAddress(rawData.address),
      isActive,
      preferences: { ...rawData.preferences },
      accountAge,
      lastLoginFormatted: rawData.metadata.lastLoginAt 
        ? format(new Date(rawData.metadata.lastLoginAt), 'dd/MM/yyyy HH:mm')
        : undefined
    };
  }

  processBatch(rawDataArray: RawUserData[]): {
    processed: ProcessedUser[];
    errors: Array<{ index: number; error: string; data: RawUserData }>;
  } {
    const processed: ProcessedUser[] = [];
    const errors: Array<{ index: number; error: string; data: RawUserData }> = [];

    rawDataArray.forEach((rawData, index) => {
      try {
        const processedUser = this.processUserData(rawData);
        processed.push(processedUser);
      } catch (error) {
        errors.push({
          index,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: rawData
        });
      }
    });

    return { processed, errors };
  }

  validateUserData(data: RawUserData): DataValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!data.id || data.id.trim() === '') {
      errors.push('User ID is required');
    }

    if (!data.firstName || data.firstName.trim() === '') {
      errors.push('First name is required');
    }

    if (!data.lastName || data.lastName.trim() === '') {
      errors.push('Last name is required');
    }

    // Email validation
    if (!data.email || data.email.trim() === '') {
      errors.push('Email is required');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }

    // Date validation
    if (!data.birthDate) {
      errors.push('Birth date is required');
    } else {
      const birthDate = new Date(data.birthDate);
      if (isNaN(birthDate.getTime())) {
        errors.push('Invalid birth date format');
      } else if (birthDate > new Date()) {
        errors.push('Birth date cannot be in the future');
      } else if (this.calculateAge(birthDate, new Date()) < 13) {
        warnings.push('User is under 13 years old');
      }
    }

    // Address validation
    if (!data.address.street || !data.address.city || !data.address.country) {
      errors.push('Address must include street, city, and country');
    }

    // Metadata validation
    if (!data.metadata.createdAt) {
      errors.push('Creation date is required');
    } else if (isNaN(new Date(data.metadata.createdAt).getTime())) {
      errors.push('Invalid creation date format');
    }

    if (data.metadata.loginCount < 0) {
      errors.push('Login count cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private calculateAge(birthDate: Date, currentDate: Date): number {
    let age = currentDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = currentDate.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  private calculateDaysDifference(startDate: Date, endDate: Date): number {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private formatAddress(address: RawUserData['address']): string {
    const parts = [address.street, address.city, address.country];
    if (address.zipCode) {
      parts.push(address.zipCode);
    }
    return parts.filter(Boolean).join(', ');
  }

  private determineUserActivity(metadata: RawUserData['metadata']): boolean {
    if (!metadata.lastLoginAt) return false;
    
    const lastLogin = new Date(metadata.lastLoginAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return lastLogin > thirtyDaysAgo;
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
} 