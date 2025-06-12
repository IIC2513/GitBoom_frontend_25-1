import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, AlertCircle, Search, UploadCloud, X, CheckCircle2 } from 'lucide-react';
import debounce from 'lodash/debounce';
import L from 'leaflet';

// --- Solución para el icono de Leaflet que no aparece en Vite/Webpack ---
// Esto previene un error común donde el marcador del mapa no se muestra.
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41], // Punto del icono que corresponde a la ubicación del marcador
});

L.Marker.prototype.options.icon = DefaultIcon;
// --- Fin de la solución del icono ---

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

// --- Interfaces de Datos ---
interface ProductFormData {
    nombre: string;
    descripcion: string;
    tipo_producto: string;
    cantidad: number;
    fecha_expiracion: string;
    precio: number;
    horario_retiro: string;
    categoria: 'Compra Solidaria' | 'Ayuda Social';
    ubicacion: string;
    lat: number;
    lng: number;
}
  
interface LocationSuggestion {
    display_name: string;
    lat: string;
    lon: string;
}

// --- Componente de Control del Mapa ---
// Un componente interno para manejar eventos y centrar el mapa de forma limpia.
const MapController = ({ position, onMapClick }: { position: [number, number], onMapClick: (latlng: L.LatLng) => void }) => {
    const map = useMap();
  
    // Efecto para centrar el mapa cuando la posición cambia (ya sea por búsqueda o clic)
    useEffect(() => {
        map.setView(position, map.getZoom(), {
            animate: true,
            pan: { duration: 0.5 }
        });
    }, [position, map]);
  
    // Hook para capturar los clics en el mapa
    useMapEvents({
      click: (e) => onMapClick(e.latlng),
    });
  
    return null;
};

// --- Componente Principal de la Página ---
const CreateProductPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLocationLoading, setLocationLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    
    const [formData, setFormData] = useState<ProductFormData>({
        nombre: '',
        descripcion: '',
        tipo_producto: '',
        cantidad: 1,
        fecha_expiracion: '',
        precio: 0,
        horario_retiro: '',
        categoria: 'Compra Solidaria',
        ubicacion: '',
        lat: -33.45694, // Posición inicial: Santiago, Chile
        lng: -70.64827,
    });

    // Cierra el dropdown de sugerencias al hacer clic fuera de él
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // ** LÓGICA CLAVE 1: Geocodificación Inversa (Coordenadas -> Dirección) **
    const reverseGeocode = async (lat: number, lng: number) => {
        setLocationLoading(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            if (data && data.display_name) {
                // Actualiza el campo de texto con la dirección encontrada
                setFormData(prev => ({ ...prev, ubicacion: data.display_name }));
            }
        } catch (err) {
            console.error('Error en geocodificación inversa:', err);
        } finally {
            setLocationLoading(false);
        }
    };

    // ** LÓGICA CLAVE 2: Búsqueda de Sugerencias (Texto -> Ubicaciones) **
    const searchLocationSuggestions = async (query: string) => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }
        setLocationLoading(true);
        setShowSuggestions(false);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=cl`);
            const data = await response.json();
            setSuggestions(data || []);
            if (data?.length > 0) setShowSuggestions(true);
        } catch (err) {
            console.error('Error al buscar sugerencias:', err);
        } finally {
            setLocationLoading(false);
        }
    };

    // Debounce para evitar llamadas a la API en cada tecleo
    const debouncedSearch = useCallback(debounce(searchLocationSuggestions, 500), []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'ubicacion') {
            debouncedSearch(value);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const selectSuggestion = (suggestion: LocationSuggestion) => {
        setShowSuggestions(false);
        setFormData(prev => ({
            ...prev,
            ubicacion: suggestion.display_name,
            lat: parseFloat(suggestion.lat),
            lng: parseFloat(suggestion.lon)
        }));
    };

    const handleMapClick = (latlng: L.LatLng) => {
        const { lat, lng } = latlng;
        setShowSuggestions(false);
        setFormData(prev => ({ ...prev, lat, lng }));
        reverseGeocode(lat, lng);
    };
    
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
      
        try {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('Token no encontrado');
      
          // Armar FormData
          const data = new FormData();
          data.append('nombre', formData.nombre);
          data.append('descripcion', formData.descripcion);
          data.append('tipo_producto', formData.tipo_producto);
          data.append('cantidad', String(formData.cantidad));
          data.append('fecha_expiracion', formData.fecha_expiracion);
          data.append('precio', String(formData.categoria === 'Compra Solidaria' ? formData.precio : 0));
          data.append('categoria', formData.categoria);
          data.append('ubicacion', formData.ubicacion);
          data.append('lat', String(formData.lat));
          data.append('lng', String(formData.lng));
          data.append('horario_retiro', formData.horario_retiro || 'Sin especificar');
          if (imageFile) {
            data.append('imagen', imageFile);
          }
      
          const response = await fetch(`${API_BASE}/api/productos`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`
            },
            body: data
          });
      
          if (!response.ok) {
            const err = await response.json().catch(() => null);
            throw new Error(err?.error || 'Error al crear producto');
          }
      
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            navigate('/');
          }, 2000);
        } catch (err: any) {
          setError(err.message || 'Error desconocido');
        } finally {
          setLoading(false);
        }
      };
      

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <AnimatePresence>
                {showSuccess && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed inset-0 flex items-center justify-center z-50"
                    >
                        <div className="absolute inset-0 bg-black bg-opacity-50" />
                        <div className="bg-white rounded-lg p-8 shadow-xl max-w-md w-full mx-4 relative">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900">
                                    ¡Felicitaciones!
                                </h3>
                                <p className="text-gray-600">
                                    Has publicado tu producto exitosamente
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="container mx-auto px-4">
                <div className="flex items-center mb-8">
                    <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Volver
                    </button>
                    <h1 className="text-2xl font-bold text-[#1d311e] ml-4">Publicar Nuevo Producto</h1>
                </div>

                <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-4xl mx-auto" onSubmit={handleSubmit}>
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2" /> {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Columna Izquierda */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto *</label>
                                <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557e35] focus:border-transparent" placeholder="Ej: Pan Integral Artesanal" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                                <textarea name="descripcion" value={formData.descripcion} onChange={handleInputChange} required rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557e35] focus:border-transparent" placeholder="Describe tu producto..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Producto *</label>
                                <input type="text" name="tipo_producto" value={formData.tipo_producto} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557e35] focus:border-transparent" placeholder="Ej: Panadería" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
                                <input type="number" name="cantidad" value={formData.cantidad} onChange={handleInputChange} required min="1" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557e35] focus:border-transparent" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Categoría *</label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="categoria"
                                            value="Compra Solidaria"
                                            checked={formData.categoria === 'Compra Solidaria'}
                                            onChange={handleInputChange}
                                            className="mr-2"
                                        />
                                        Compra Solidaria
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="categoria"
                                            value="Ayuda Social"
                                            checked={formData.categoria === 'Ayuda Social'}
                                            onChange={handleInputChange}
                                            className="mr-2"
                                        />
                                        Ayuda Social
                                    </label>
                                </div>
                            </div>
                            {formData.categoria === 'Compra Solidaria' && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                        <input type="number" name="precio" value={formData.precio} onChange={handleInputChange} required min="0" className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557e35] focus:border-transparent" />
                                    </div>
                                </motion.div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Expiración</label>
                                <input type="date" name="fecha_expiracion" value={formData.fecha_expiracion} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557e35] focus:border-transparent" />
                            </div>
                        </div>

                        {/* Columna Derecha */}
                        <div className="space-y-6">
                            {/* Campo de imagen */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del Producto</label>

                                <div
                                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg relative group cursor-pointer transition hover:border-[#557e35]"
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                    e.preventDefault();
                                    const file = e.dataTransfer.files?.[0];
                                    if (file) {
                                        setImageFile(file);
                                        setImagePreview(URL.createObjectURL(file));
                                    }
                                    }}
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                >
                                    <div className="space-y-1 text-center">
                                    {imagePreview ? (
                                        <div className="relative group mx-auto">
                                        <img src={imagePreview} alt="Vista previa" className="h-40 w-auto rounded-md shadow-md" />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                            e.stopPropagation();
                                            setImageFile(null);
                                            setImagePreview(null);
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 leading-none hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                                            aria-label="Eliminar imagen"
                                        >
                                            <X size={16} />
                                        </button>
                                        </div>
                                    ) : (
                                        <>
                                        <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <span className="text-[#557e35] font-medium">Sube un archivo</span>
                                            <span className="pl-1">o arrástralo aquí</span>
                                        </div>
                                        </>
                                    )}
                                    </div>
                            </div>

                            {/* Input oculto real */}
                            <input
                                id="file-upload"
                                name="imagen"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="sr-only"
                            />
                        </div>
                            {/* Campo de ubicación con autocompletado */}
                            <div className="space-y-2 relative">
                                <label className="block text-sm font-medium text-gray-700">Ubicación *</label>
                                <div className="relative" ref={dropdownRef}>
                                    <input type="text" name="ubicacion" value={formData.ubicacion} onChange={handleInputChange} required className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557e35] focus:border-transparent" placeholder="Busca una dirección o haz clic en el mapa" autoComplete="off" onFocus={() => formData.ubicacion && setShowSuggestions(true)} />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    {isLocationLoading && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="w-5 h-5 border-t-2 border-b-2 border-[#557e35] rounded-full animate-spin" />
                                        </div>
                                    )}
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute z-[9999] w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto">
                                            {suggestions.map((suggestion, index) => (
                                                <div
                                                    key={index}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                    onClick={() => selectSuggestion(suggestion)}
                                                >
                                                    {suggestion.display_name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {/* Mapa interactivo */}
                            <div className="h-[250px] rounded-lg overflow-hidden border border-gray-300 relative z-0">
                                <MapContainer center={[formData.lat, formData.lng]} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                                    <Marker position={[formData.lat, formData.lng]} />
                                    <MapController position={[formData.lat, formData.lng]} onMapClick={handleMapClick} />
                                </MapContainer>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors">Cancelar</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-[#557e35] text-white rounded-lg font-semibold hover:bg-[#4a6d2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                            {loading ? (<><div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin" /> Publicando...</>) : 'Publicar Producto'}
                        </button>
                    </div>
                </motion.form>
            </div>
        </div>
    );
};

export default CreateProductPage;