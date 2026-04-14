export default class Rol {
  static SUPERADMIN = 'Super Admin';
  static ADMIN = 'Admin';
  static USER = 'User';
  static getAllRoles = () => [Rol.SUPERADMIN, Rol.ADMIN, Rol.USER];
}
