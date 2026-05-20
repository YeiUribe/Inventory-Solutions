import { Router } from 'express';
import validarUsuario from '../middlewares/validarUsuario.js';
import requireAdmin from '../middlewares/requireAdmin.js';
import {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from '../controllers/usuariosController.js';

const router = Router();

router.get('/', requireAdmin, obtenerUsuarios);
router.post('/', validarUsuario, requireAdmin, crearUsuario);
router.put('/:id', validarUsuario, requireAdmin, actualizarUsuario);
router.delete('/:id', requireAdmin, eliminarUsuario);

export default router;
