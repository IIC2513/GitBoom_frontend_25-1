// src/components/ProfilePhotoForm.tsx
import React, { useState } from 'react';
import axios from 'axios';

interface ProfilePhotoFormProps {
  /** Callback que recibe la URL de la foto subida */
  onUploaded: (url: string) => void;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

const ProfilePhotoForm: React.FC<ProfilePhotoFormProps> = ({ onUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected) {
      setPreview(URL.createObjectURL(selected));
      setMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage('Selecciona una imagen primero');
      return;
    }
    const formData = new FormData();
    formData.append('foto', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE}/api/usuarios/perfil/foto`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      const { fotoPerfil } = response.data;
      onUploaded(fotoPerfil);
      setMessage('Foto subida con éxito');
      setFile(null);
      setPreview(null);
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.message || 'Error subiendo la foto');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-xs mx-auto">
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-24 h-24 rounded-full object-cover mx-auto"
        />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="block w-full text-sm text-gray-700
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-md file:border-0
                   file:text-sm file:font-semibold
                   file:bg-[#e8e8e8] file:text-[#1d311e]
                   hover:file:bg-[#d4d4d4]"
      />
      <button
        type="submit"
        className="w-full bg-[#557e35] text-white py-2 rounded-md
                   hover:bg-[#4a6e2e] transition-colors duration-200 font-medium"
      >
        Subir foto de perfil
      </button>
      {message && (
        <p className="text-center text-sm text-red-500">
          {message}
        </p>
      )}
    </form>
  );
};

export default ProfilePhotoForm;
