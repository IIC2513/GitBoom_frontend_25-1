import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config';

const TABS = [
  { key: 'usuarios', label: 'Usuarios' },
  { key: 'productos', label: 'Productos' },
  { key: 'reservas', label: 'Reservas' },
  { key: 'valoraciones', label: 'Valoraciones' },
  { key: 'estadisticas', label: 'Estadísticas' },
  { key: 'actividad', label: 'Actividad/Logs' },
];

const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('usuarios');
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [reservas, setReservas] = useState<any[]>([]);
  const [valoraciones, setValoraciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedReserva, setSelectedReserva] = useState<any>(null);
  const [selectedValoracion, setSelectedValoracion] = useState<any>(null);
  const navigate = useNavigate();

  // Función helper para obtener el nombre del usuario por ID
  const getNombreUsuario = (idUsuario: number) => {
    let nombre = `Usuario ID: ${idUsuario}`;
    usuarios.forEach((u: any) => {
      if (u.id_usuario === idUsuario) {
        nombre = u.nombre;
      }
    });
    return nombre;
  };

  // Función helper para obtener el nombre del producto por ID
  const getNombreProducto = (idProducto: number) => {
    let nombre = `Producto ID: ${idProducto}`;
    productos.forEach((p: any) => {
      if (p.id_producto === idProducto) {
        nombre = p.nombre;
      }
    });
    return nombre;
  };

  // Fetch all data on mount
  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      let completedRequests = 0;
      const totalRequests = 4;
      
      const checkAllCompleted = () => {
        completedRequests++;
        if (completedRequests >= totalRequests) {
          setLoading(false);
        }
      };
      
      // Fetch usuarios
      fetch(`${API_BASE}/api/usuarios/admin/usuarios`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(r => r.text())
      .then(text => {
        try {
          const json = JSON.parse(text);
          console.log('Usuarios:', json);
          let usuarios: any[] = [];
          if (Array.isArray(json)) {
            usuarios = json;
          } else if (json && json.usuarios && Array.isArray(json.usuarios)) {
            usuarios = json.usuarios;
          } else if (json && Array.isArray(json.data)) {
            usuarios = json.data;
          } else {
            console.warn('Formato inesperado de usuarios:', json);
            usuarios = [];
          }
          setUsuarios(usuarios);
        } catch (e) {
          console.error('Error usuarios:', text);
          setError('Error usuarios: ' + text);
        }
        checkAllCompleted();
      })
      .catch(err => {
        console.error('Error usuarios:', err);
        setError('Error usuarios: ' + err.message);
        checkAllCompleted();
      });

      // Fetch productos
      fetch(`${API_BASE}/api/productos`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(r => r.text())
      .then(text => {
        try {
          const json = JSON.parse(text);
          console.log('Productos:', json);
          setProductos(json);
        } catch (e) {
          console.error('Error productos:', text);
          setError('Error productos: ' + text);
        }
        checkAllCompleted();
      })
      .catch(err => {
        console.error('Error productos:', err);
        setError('Error productos: ' + err.message);
        checkAllCompleted();
      });

      // Fetch reservas
      fetch(`${API_BASE}/api/reservas`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(r => r.text())
      .then(text => {
        try {
          const json = JSON.parse(text);
          console.log('Reservas:', json);
          setReservas(json);
        } catch (e) {
          console.error('Error reservas:', text);
          setError('Error reservas: ' + text);
        }
        checkAllCompleted();
      })
      .catch(err => {
        console.error('Error reservas:', err);
        setError('Error reservas: ' + err.message);
        checkAllCompleted();
      });

      // Fetch valoraciones
      fetch(`${API_BASE}/api/valoraciones`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(r => r.text())
      .then(text => {
        try {
          const json = JSON.parse(text);
          console.log('Valoraciones:', json);
          setValoraciones(json);
        } catch (e) {
          console.error('Error valoraciones:', text);
          setError('Error valoraciones: ' + text);
        }
        checkAllCompleted();
      })
      .catch(err => {
        console.error('Error valoraciones:', err);
        setError('Error valoraciones: ' + err.message);
        checkAllCompleted();
      });
    };

    fetchData();
  }, []);

  // Estadísticas para la pestaña de gráficos
  const totalUsuarios = usuarios.length;
  const totalProductos = productos.length;
  const totalReservas = reservas.length;
  const totalValoraciones = valoraciones.length;

  // Actividad reciente combinada
  const actividad = [
    ...usuarios.map(u => ({ tipo: 'Usuario', entidad: u, fecha: u.updatedAt || u.createdAt })),
    ...productos.map(p => ({ tipo: 'Producto', entidad: p, fecha: p.updatedAt || p.createdAt })),
    ...reservas.map(r => ({ tipo: 'Reserva', entidad: r, fecha: r.updatedAt || r.createdAt })),
    ...valoraciones.map(v => ({ tipo: 'Valoración', entidad: v, fecha: v.updatedAt || v.createdAt })),
  ]
    .filter(a => a.fecha)
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    .slice(0, 20);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-[#1d311e] mb-6">Dashboard Administrador</h1>
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#557e35] to-[#8bc34a] text-white font-bold rounded-lg shadow-lg hover:from-[#46662a] hover:to-[#6fa32b] transition-all text-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Volver
        </button>
        <div className="flex space-x-4 mb-8">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded font-semibold transition-colors ${activeTab === tab.key ? 'bg-[#557e35] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="text-center text-gray-500">Cargando información...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <>
            {activeTab === 'usuarios' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Listado de Usuarios</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 border-b">ID</th>
                        <th className="py-2 px-4 border-b">Nombre</th>
                        <th className="py-2 px-4 border-b">Correo</th>
                        <th className="py-2 px-4 border-b">Rol</th>
                        <th className="py-2 px-4 border-b">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.map((u) => (
                        <tr key={u.id_usuario} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">{u.id_usuario}</td>
                          <td className="py-2 px-4 border-b">{u.nombre}</td>
                          <td className="py-2 px-4 border-b">{u.correo}</td>
                          <td className="py-2 px-4 border-b">{u.rol}</td>
                          <td className="py-2 px-4 border-b space-x-2">
                            <button onClick={() => setSelectedUser(u)} className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs">Ver</button>
                            <button className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs">Editar</button>
                            <button className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs">Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {selectedUser && (
                  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
                      <button onClick={() => setSelectedUser(null)} className="absolute top-2 right-2 text-gray-500 hover:text-black">×</button>
                      <h3 className="text-xl font-bold mb-2">Detalles de Usuario</h3>
                      <div className="mb-2"><b>ID:</b> {selectedUser.id_usuario}</div>
                      <div className="mb-2"><b>Nombre:</b> {selectedUser.nombre}</div>
                      <div className="mb-2"><b>Correo:</b> {selectedUser.correo}</div>
                      <div className="mb-2"><b>Rol:</b> {selectedUser.rol}</div>
                      <div className="mb-2"><b>Teléfono:</b> {selectedUser.telefono || 'No registrado'}</div>
                      <div className="mb-2"><b>Dirección:</b> {selectedUser.direccion || 'No registrada'}</div>
                      <div className="flex space-x-2 mt-4">
                        <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Editar</button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Eliminar</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'productos' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Listado de Productos</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 border-b">ID</th>
                        <th className="py-2 px-4 border-b">Nombre</th>
                        <th className="py-2 px-4 border-b">Descripción</th>
                        <th className="py-2 px-4 border-b">Categoría</th>
                        <th className="py-2 px-4 border-b">Estado</th>
                        <th className="py-2 px-4 border-b">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productos.map((p) => (
                        <tr key={p.id_producto} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">{p.id_producto}</td>
                          <td className="py-2 px-4 border-b">{p.nombre}</td>
                          <td className="py-2 px-4 border-b">{p.descripcion}</td>
                          <td className="py-2 px-4 border-b">{p.categoria}</td>
                          <td className="py-2 px-4 border-b">{p.estado}</td>
                          <td className="py-2 px-4 border-b space-x-2">
                            <button onClick={() => setSelectedProduct(p)} className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs">Ver</button>
                            <button className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs">Editar</button>
                            <button className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs">Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {selectedProduct && (
                  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
                      <button onClick={() => setSelectedProduct(null)} className="absolute top-2 right-2 text-gray-500 hover:text-black">×</button>
                      <h3 className="text-xl font-bold mb-2">Detalles de Producto</h3>
                      <div className="mb-2"><b>ID:</b> {selectedProduct.id_producto}</div>
                      <div className="mb-2"><b>Nombre:</b> {selectedProduct.nombre}</div>
                      <div className="mb-2"><b>Descripción:</b> {selectedProduct.descripcion}</div>
                      <div className="mb-2"><b>Categoría:</b> {selectedProduct.categoria}</div>
                      <div className="mb-2"><b>Estado:</b> {selectedProduct.estado}</div>
                      <div className="mb-2"><b>Precio:</b> {selectedProduct.precio}</div>
                      <div className="mb-2"><b>Ubicación:</b> {selectedProduct.ubicacion}</div>
                      <div className="flex space-x-2 mt-4">
                        <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Editar</button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Eliminar</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'reservas' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Listado de Reservas</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 border-b">ID</th>
                        <th className="py-2 px-4 border-b">Producto</th>
                        <th className="py-2 px-4 border-b">Usuario</th>
                        <th className="py-2 px-4 border-b">Estado</th>
                        <th className="py-2 px-4 border-b">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservas.map((r) => (
                        <tr key={r.id_reserva} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">{r.id_reserva}</td>
                          <td className="py-2 px-4 border-b">{getNombreProducto(r.producto_reservado?.id_producto || r.id_producto)}</td>
                          <td className="py-2 px-4 border-b">{getNombreUsuario(r.usuario_reservante?.id_usuario || r.nombre_usuario || r.id_usuario)}</td>
                          <td className="py-2 px-4 border-b">{r.estado}</td>
                          <td className="py-2 px-4 border-b space-x-2">
                            <button onClick={() => setSelectedReserva(r)} className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs">Ver</button>
                            <button className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs">Editar</button>
                            <button className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs">Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {selectedReserva && (
                  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
                      <button onClick={() => setSelectedReserva(null)} className="absolute top-2 right-2 text-gray-500 hover:text-black">×</button>
                      <h3 className="text-xl font-bold mb-2">Detalles de Reserva</h3>
                      <div className="mb-2"><b>ID:</b> {selectedReserva.id_reserva}</div>
                      <div className="mb-2"><b>Producto:</b> {getNombreProducto(selectedReserva.producto_reservado?.id_producto || selectedReserva.id_producto)}</div>
                      <div className="mb-2"><b>Usuario:</b> {getNombreUsuario(selectedReserva.usuario_reservante?.id_usuario || selectedReserva.nombre_usuario || selectedReserva.id_usuario)}</div>
                      <div className="mb-2"><b>Estado:</b> {selectedReserva.estado}</div>
                      <div className="mb-2"><b>Fecha de retiro:</b> {selectedReserva.fecha_retiro}</div>
                      <div className="mb-2"><b>Mensaje:</b> {selectedReserva.mensaje}</div>
                      <div className="flex space-x-2 mt-4">
                        <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Editar</button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Eliminar</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'valoraciones' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Listado de Valoraciones</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 border-b">ID</th>
                        <th className="py-2 px-4 border-b">Producto</th>
                        <th className="py-2 px-4 border-b">Usuario</th>
                        <th className="py-2 px-4 border-b">Puntuación</th>
                        <th className="py-2 px-4 border-b">Comentario</th>
                        <th className="py-2 px-4 border-b">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {valoraciones.map((v) => (
                        <tr key={v.id_valoracion} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">{v.id_valoracion}</td>
                          <td className="py-2 px-4 border-b">{getNombreProducto(v.producto_valorado?.id_producto || v.id_producto)}</td>
                          <td className="py-2 px-4 border-b">{getNombreUsuario(v.autor_valoracion?.id_usuario || v.id_usuario)}</td>
                          <td className="py-2 px-4 border-b">{v.puntuacion}</td>
                          <td className="py-2 px-4 border-b">{v.comentario}</td>
                          <td className="py-2 px-4 border-b space-x-2">
                            <button onClick={() => setSelectedValoracion(v)} className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs">Ver</button>
                            <button className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs">Editar</button>
                            <button className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs">Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {selectedValoracion && (
                  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
                      <button onClick={() => setSelectedValoracion(null)} className="absolute top-2 right-2 text-gray-500 hover:text-black">×</button>
                      <h3 className="text-xl font-bold mb-2">Detalles de Valoración</h3>
                      <div className="mb-2"><b>ID:</b> {selectedValoracion.id_valoracion}</div>
                      <div className="mb-2"><b>Producto:</b> {getNombreProducto(selectedValoracion.producto_valorado?.id_producto || selectedValoracion.id_producto)}</div>
                      <div className="mb-2"><b>Usuario:</b> {getNombreUsuario(selectedValoracion.autor_valoracion?.id_usuario || selectedValoracion.id_usuario)}</div>
                      <div className="mb-2"><b>Puntuación:</b> {selectedValoracion.puntuacion}</div>
                      <div className="mb-2"><b>Comentario:</b> {selectedValoracion.comentario}</div>
                      <div className="flex space-x-2 mt-4">
                        <button className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Editar</button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Eliminar</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'estadisticas' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Estadísticas Generales</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-green-100 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-green-700">{totalUsuarios}</div>
                    <div className="text-gray-700 mt-2">Usuarios</div>
                  </div>
                  <div className="bg-blue-100 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-blue-700">{totalProductos}</div>
                    <div className="text-gray-700 mt-2">Productos</div>
                  </div>
                  <div className="bg-yellow-100 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-yellow-700">{totalReservas}</div>
                    <div className="text-gray-700 mt-2">Reservas</div>
                  </div>
                  <div className="bg-pink-100 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-pink-700">{totalValoraciones}</div>
                    <div className="text-gray-700 mt-2">Valoraciones</div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'actividad' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Actividad Reciente</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 border-b">Fecha</th>
                        <th className="py-2 px-4 border-b">Tipo</th>
                        <th className="py-2 px-4 border-b">ID</th>
                        <th className="py-2 px-4 border-b">Nombre/Descripción</th>
                        <th className="py-2 px-4 border-b">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {actividad.map((a, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">{a.fecha ? new Date(a.fecha).toLocaleString() : '-'}</td>
                          <td className="py-2 px-4 border-b">{a.tipo}</td>
                          <td className="py-2 px-4 border-b">{a.entidad.id_usuario || a.entidad.id_producto || a.entidad.id_reserva || a.entidad.id_valoracion || '-'}</td>
                          <td className="py-2 px-4 border-b">{a.entidad.nombre || a.entidad.descripcion || a.entidad.comentario || '-'}</td>
                          <td className="py-2 px-4 border-b">{a.entidad.updatedAt ? 'Actualizado' : 'Creado'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage; 