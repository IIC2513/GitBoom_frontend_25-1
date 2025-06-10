import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowLeft, AlertCircle, Search, MapPin } from 'lucide-react';
import debounce from 'lodash/debounce';
import L from 'leaflet';

// --- Solución para el icono de Leaflet que no aparece en Vite/Webpack ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;
// --- Fin de la solución del icono ---

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

// Interfaces de datos
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

// Componente de control del mapa para mantener el código más limpio
const MapController = ({ position, onMapClick }: { position: [number, number], onMapClick: (latlng: L.LatLng) => void }) => {
    const map = useMap();
  
    useEffect(() => {
        map.setView(position, map.getZoom(), {
            animate: true,
            pan: { duration: 0.5 }
        });
    }, [position, map]);
  
    useMapEvents({
      click: (e) => onMapClick(e.latlng),
    });
  
    return null;
};

// Componente principal de la página
const CreateProductPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLocationLoading, setLocationLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
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

    // Cierra el dropdown de sugerencias al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Geocodificación Inversa: Convierte coordenadas a una dirección de texto
    const reverseGeocode = async (lat: number, lng: number) => {
        setLocationLoading(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            if (data && data.display_name) {
                setFormData(prev => ({ ...prev, ubicacion: data.display_name }));
            }
        } catch (err) {
            console.error('Error en geocodificación inversa:', err);
        } finally {
            setLocationLoading(false);
        }
    };

    // Búsqueda de Sugerencias: Convierte texto a una lista de posibles ubicaciones
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

    const debouncedSearch = useCallback(debounce(searchLocationSuggestions, 500), []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'cantidad' || name === 'precio' ? Number(value) : value
        }));
        if (name === 'ubicacion') {
            debouncedSearch(value);
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
            const response = await fetch(`${API_BASE}/api/productos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear el producto');
            }

            navigate('/productos');
        } catch (err) {
            console.error('Error:', err);
            setError(err instanceof Error ? err.message : 'Error al crear el producto. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="flex items-center mb-8">
                    <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Volver
                    </button>
                    <h1 className="text-2xl font-bold text-[#1d311e] ml-4">Publicar Nuevo Producto</h1>
                </div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-4xl mx-auto"
                    onSubmit={handleSubmit}
                >
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {/* Columna Izquierda */}
                        <div className="space-y-6">
                            {['nombre', 'descripcion', 'tipo_producto'].map((field) => (
                                <div key={field}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                                        {field.replace('_', ' ')} *
                                    </label>
                                    {field === 'descripcion' ? (
                                        <textarea name={field} value={formData[field]} onChange={handleInputChange} required rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557e35] focus:border-transparent" placeholder="Describe tu producto..." />
                                    ) : (
                                        <input type="text" name={field} value={formData[field]} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557e35] focus:border-transparent" placeholder={`Ej: ${field === 'nombre' ? 'Pan Integral' : 'Panadería'}`} />
                                    )}
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
                                <input type="number" name="cantidad" value={formData.cantidad} onChange={handleInputChange} required min="1" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557e35] focus:border-transparent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                                <select name="categoria" value={formData.categoria} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557e35] focus:border-transparent">
                                    <option value="Compra Solidaria">Compra Solidaria</option>
                                    <option value="Ayuda Social">Ayuda Social</option>
                                </select>
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
                        </div>

                        {/* Columna Derecha */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Expiración</label>
                                <input type="date" name="fecha_expiracion" value={formData.fecha_expiracion} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557e35] focus:border-transparent" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Horario de Retiro</label>
                                <input type="text" name="horario_retiro" value={formData.horario_retiro} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557e35] focus:border-transparent" placeholder="Ej: 10:00 - 18:00" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Ubicación *</label>
                                <div className="relative" ref={dropdownRef}>
                                    <input type="text" name="ubicacion" value={formData.ubicacion} onChange={handleInputChange} required className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#557e35] focus:border-transparent" placeholder="Busca una dirección..." autoComplete="off" onFocus={() => formData.ubicacion && setShowSuggestions(true)} />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    {isLocationLoading && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#557e35]"></div>
                                        </div>
                                    )}
                                    <AnimatePresence>
                                        {showSuggestions && suggestions.length > 0 && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {suggestions.map((suggestion, index) => (
                                                    <button key={index} type="button" onClick={() => selectSuggestion(suggestion)} className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center gap-3 border-b last:border-b-0">
                                                        <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                                        <span className="text-sm">{suggestion.display_name}</span>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                            <div className="h-[300px] rounded-lg overflow-hidden border border-gray-300 z-10">
                                <MapContainer center={[formData.lat, formData.lng]} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                                    <MapController position={[formData.lat, formData.lng]} onMapClick={handleMapClick} />
                                    <Marker position={[formData.lat, formData.lng]} />
                                </MapContainer>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-4">
                        <button type="button" onClick={() => navigate(-1)} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-[#557e35] text-white rounded-lg font-semibold hover:bg-[#4a6d2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin" />
                                    Publicando...
                                </>
                            ) : (
                                'Publicar Producto'
                            )}
                        </button>
                    </div>
                </motion.form>
            </div>
        </div>
    );
};

export default CreateProductPage;