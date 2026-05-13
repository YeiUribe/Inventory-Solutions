import { Router } from 'express';
import validarUsuario from '../middlewares/validarUsuario.js';
import {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from '../controllers/usuariosController.js';

const router = Router();

router.get('/', obtenerUsuarios);
router.post('/', validarUsuario, crearUsuario);
router.put('/:id', validarUsuario, actualizarUsuario);
router.delete('/:id', eliminarUsuario);

export default router;
