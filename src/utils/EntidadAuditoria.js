export default class EntidadAuditoria {
  static PRESUPUESTO = 'PRESUPUESTO';
  static DETALLE = 'DETALLE';
  static PRODUCTO = 'PRODUCTO';
  static getAllRoles = () => [EntidadAuditoria.PRESUPUESTO, EntidadAuditoria.DETALLE, EntidadAuditoria.PRODUCTO];
}
