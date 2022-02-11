type User = {
  permissions: string[];
  roles: string[];
}

type ValidateUserPermissionsParams = {
  user: User | undefined;
  permissions?: string[];
  roles?: string[];
}

export function validateUserPermissions({ 
  user,
  permissions = [],
  roles = []
}: ValidateUserPermissionsParams) {
  // verify if user exist
  if(!user) return false;

  // verify if user has all permissions
  if(permissions?.length > 0) {
    const hasAllPermissions = permissions?.every(permission => {
      return user?.permissions.includes(permission);
    })

    if(!hasAllPermissions) return false;
  }

  // verify if user has all roles
  if(roles?.length > 0) {
    const hasAllRoles = roles?.some(role => {
      return user?.roles.includes(role);
    })

    if(!hasAllRoles) return false;
  }

  return true;
}