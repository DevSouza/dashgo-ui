import { useAuth } from "../context/AuthContext";
import { validateUserPermissions } from "../utils/validateUserPermissions";

type UsecanParams = {
  permissions?: string[];
  roles?: string[];
}

export function useCan({ permissions = [], roles = [] } : UsecanParams) {
  const { user, isAuthenticated } = useAuth();
  // verify if user is authenticated
  if(!isAuthenticated) return false;

  const userHasValidPermissions = validateUserPermissions({ 
    user,
    permissions,
    roles
  });

  return userHasValidPermissions;
}