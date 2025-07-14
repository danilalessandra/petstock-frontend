import React, { useEffect, useState, useContext } from 'react';
import Sidebar from '../../components/Sidebar';
import { getUsuarios, eliminarUsuario } from '../../api/usuariosService';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { FaPencilAlt, FaTrashAlt } from 'react-icons/fa'; // Importa los iconos aquí

function ListarUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsuarios();
      setUsuarios(Array.isArray(data) ? data : []); // Asegurarse de que 'data' sea un array
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError('Error al cargar la lista de usuarios. ' + (err.response?.data?.error || ''));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleEdit = (id) => {
    navigate(`/usuarios/editar/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await eliminarUsuario(id);
        alert('Usuario eliminado exitosamente.');
        fetchUsuarios();
      } catch (err) {
        console.error('Error al eliminar usuario:', err);
        setError('Error al eliminar el usuario. ' + (err.response?.data?.error || ''));
      }
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}> {/* Añadido minHeight para consistencia */}
      <Sidebar />
      <main className="main-content-area" style={{ flexGrow: 1, padding: '1rem' }}> {/* Añadida clase y padding */}
        <h2>Gestión de Usuarios</h2>
        {user?.rol === 'administrador' && (
          <button
            onClick={() => navigate('/usuarios/registrar')}
            className="btn btn-primary"
            style={{ marginBottom: '1rem' }}
          >
            Registrar Nuevo Usuario
          </button>
        )}

        {loading && <p>Cargando usuarios...</p>}
        {error && <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>}

        {!loading && !error && (
          <>
            {usuarios.length > 0 ? (
              <div style={{ marginTop: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderRadius: '1rem', overflow: 'hidden' }}>
                {/* Añadida la clase 'responsive-table' */}
                <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th style={{ textAlign: 'center' }}>Acciones</th> {/* Centrar el encabezado de acciones */}
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map(usuario => (
                      <tr key={usuario.id}>
                        {/* Añadidos data-label a cada td */}
                        <td data-label="ID">{usuario.id}</td>
                        <td data-label="Nombre">{usuario.nombre}</td>
                        <td data-label="Email">{usuario.email}</td>
                        <td data-label="Rol">{usuario.rol}</td>
                        <td data-label="Acciones" style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                          {user?.rol === 'administrador' && (
                            <>
                              <button
                                onClick={() => handleEdit(usuario.id)}
                                className="btn btn-secondary btn-icon" // Cambiado a btn-secondary para el color amarillo/naranja
                                aria-label="Editar usuario"
                              >
                                <FaPencilAlt /> {/* Icono de lápiz */}
                              </button>
                              <button
                                onClick={() => handleDelete(usuario.id)}
                                className="btn btn-danger btn-icon" // Clase btn-icon para el icono
                                aria-label="Eliminar usuario"
                              >
                                <FaTrashAlt /> {/* Icono de basura */}
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ textAlign: "center", marginTop: "1rem", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "5px", border: "1px solid #e2e3e5" }}>No hay usuarios registrados.</p>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default ListarUsuarios;