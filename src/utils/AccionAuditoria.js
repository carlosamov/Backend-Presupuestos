export default class AccionAuditoria {
  static CREAR = 'CREAR';
  static MODIFICAR = 'MODIFICAR';
  static ELIMINAR = 'ELIMINAR';
  static getAllRoles = () => [AccionAuditoria.CREAR, AccionAuditoria.MODIFICAR, AccionAuditoria.ELIMINAR];
}
