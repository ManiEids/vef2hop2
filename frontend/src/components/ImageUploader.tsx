"use client";

import { useState } from "react";
import Image from "next/image";

interface ImageUploaderProps {
  initialImageUrl?: string;
  onImageSelected: (url: string) => void;
}

export default function ImageUploader({ initialImageUrl = "", onImageSelected }: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // Sjálfgefið preset fyrir Cloudinary
  const DEFAULT_PRESET = "verkefnalisti-mana";  // Changed from "verkefnalisti-uploads"

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Size limit - 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError("Mynd má ekki vera stærri en 5MB");
      return;
    }

    // Check if file is an image
    if (!file.type.match("image/(jpeg|jpg|png)")) {
      setError("Aðeins eru leyfðar JPG og PNG myndir");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Vinsamlegast veldu mynd");
      return;
    }

    // Notum fast cloudName
    const cloudName = "dojqamm7u";

    // Notum sjálfgefið preset eða það sem er í localStorage
    const uploadPreset = localStorage.getItem("cloudinary_upload_preset") || DEFAULT_PRESET;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "verkefnalisti-mana");

    setUploading(true);
    setError("");

    try {
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      console.log(`Hleð upp mynd með preset: ${uploadPreset}`);

      const response = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Cloudinary API villa:", errorText);

        let errorMessage = `Villa við upphleðslu: ${response.status}`;

        try {
          const errorData = JSON.parse(errorText);
          if (errorData?.error?.message === "Upload preset not found") {
            errorMessage = `Upload preset '${uploadPreset}' fannst ekki. Athugaðu stillingar á myndasíðu.`;
          } else if (errorData?.error?.message) {
            errorMessage = `Cloudinary villa: ${errorData.error.message}`;
          }
        } catch (e) {
          errorMessage = `Villa: ${errorText}`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Mynd hlaðið upp:", data.secure_url);
      onImageSelected(data.secure_url);
    } catch (err: any) {
      console.error("Upphleðsla mistókst:", err);
      setError(err.message || "Óskilgreind villa við upphleðslu");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/jpeg,image/png"
          className="flex-1 text-sm"
        />
        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm disabled:bg-blue-300"
        >
          {uploading ? "Hleður..." : "Hlaða upp"}
        </button>
      </div>

      {previewUrl && (
        <div>
          <div className="relative h-32 bg-gray-100 rounded-md overflow-hidden">
            <Image
              src={previewUrl}
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              alt="Forskoðun"
              style={{ objectFit: "contain" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
