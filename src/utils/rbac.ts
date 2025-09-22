// src/lib/rbac.ts
// Centralized RBAC configuration for middleware, server actions, and client-side navigation

export type UserRole = 'admin' | 'client';

export interface RBACRule {
  pattern: string;
  allowedRoles: UserRole[];
  description: string;
}

export interface RBACConfig {
  rules: RBACRule[];
  defaultRole: UserRole;
  publicRoutes: string[];
  staticAssetPatterns: string[];
}

// RBAC Policy Configuration
export const RBAC_CONFIG: RBACConfig = {
  // Route patterns and their allowed roles
  rules: [
    // Admin-only routes
    {
      pattern: '/admin/**',
      allowedRoles: ['admin'],
      description: 'Admin dashboard and management pages'
    },
    
    // Client-only routes
    {
      pattern: '/profile/**',
      allowedRoles: ['client'],
      description: 'Client profile and account management'
    },
    {
      pattern: '/user/profile/**',
      allowedRoles: ['client'],
      description: 'Client profile pages (alternative path)'
    },
    {
      pattern: '/settings/**',
      allowedRoles: ['client'],
      description: 'Client settings and preferences'
    },
    {
      pattern: '/dashboard/**',
      allowedRoles: ['client'],
      description: 'Client dashboard'
    },
    // Client-only routes (authenticated users only)
    {
      pattern: '/cart/**',
      allowedRoles: ['client'],
      description: 'Shopping cart'
    },
    {
      pattern: '/checkout/**',
      allowedRoles: ['client'],
      description: 'Checkout process'
    },
    {
      pattern: '/customize/**',
      allowedRoles: ['client'],
      description: 'Customization tools'
    }
  ],

  // Default role for new users
  defaultRole: 'client',

  // Routes that don't require authentication (accessible to everyone except admins)
  publicRoutes: [
    '/',
    '/home',
    '/shop',
    '/fabrics',
    '/trends',
    '/about',
    '/signin',
    '/signup',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
    '/terms',
    '/privacy',
    '/contact'
  ],

  // Static asset patterns to exclude from middleware
  staticAssetPatterns: [
    '/_next/**',
    '/api/**',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '**/*.js',
    '**/*.css',
    '**/*.png',
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.gif',
    '**/*.svg',
    '**/*.webp',
    '**/*.ico',
    '**/*.woff',
    '**/*.woff2',
    '**/*.ttf',
    '**/*.eot'
  ]
};

/**
 * Check if a route matches a pattern
 * Supports wildcards (**) for path segments
 */
export function matchRoute(pathname: string, pattern: string): boolean {
  // Convert pattern to regex
  const regexPattern = pattern
    .replace(/\*\*/g, '.*') // ** matches any path segments
    .replace(/\*/g, '[^/]*') // * matches any characters except /
    .replace(/\//g, '\\/'); // Escape forward slashes
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(pathname);
}

/**
 * Get the RBAC rule for a given pathname
 */
export function getRBACRule(pathname: string): RBACRule | null {
  return RBAC_CONFIG.rules.find(rule => matchRoute(pathname, rule.pattern)) || null;
}

/**
 * Check if a user role is allowed to access a route
 */
export function isRoleAllowed(pathname: string, userRole: UserRole): boolean {
  const rule = getRBACRule(pathname);
  if (!rule) {
    // If no specific rule, check if it's a public route
    return RBAC_CONFIG.publicRoutes.some(route => matchRoute(pathname, route));
  }
  return rule.allowedRoles.includes(userRole);
}

/**
 * Check if a route is public (no authentication required)
 */
export function isPublicRoute(pathname: string): boolean {
  return RBAC_CONFIG.publicRoutes.some(route => matchRoute(pathname, route));
}

/**
 * Check if a path should be excluded from middleware (static assets, etc.)
 */
export function isStaticAsset(pathname: string): boolean {
  return RBAC_CONFIG.staticAssetPatterns.some(pattern => matchRoute(pathname, pattern));
}

/**
 * Get the appropriate redirect URL for a user role
 */
export function getDefaultRouteForRole(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'client':
      return '/home';
    default:
      return '/home';
  }
}

/**
 * Get all routes accessible by a specific role
 */
export function getAccessibleRoutes(role: UserRole): string[] {
  const accessibleRoutes: string[] = [];
  
  // Add public routes
  accessibleRoutes.push(...RBAC_CONFIG.publicRoutes);
  
  // Add role-specific routes
  RBAC_CONFIG.rules.forEach(rule => {
    if (rule.allowedRoles.includes(role)) {
      accessibleRoutes.push(rule.pattern);
    }
  });
  
  return accessibleRoutes;
}
