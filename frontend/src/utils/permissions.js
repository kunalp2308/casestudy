export function hasRole(user, roleName) {
  return (
    user?.roles?.some(
      (role) => role.name.toLowerCase() === roleName.toLowerCase(),
    ) ?? false
  );
}

export function hasAnyRole(user, roleNames) {
  return roleNames.some((roleName) => hasRole(user, roleName));
}
