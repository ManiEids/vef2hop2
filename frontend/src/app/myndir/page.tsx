"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function ImagesPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

  const defaultPreset = "verkefnalisti-uploads";
  const [uploadPreset, setUploadPreset] = useState(defaultPreset);
  const [customPreset, setCustomPreset] = useState("");
  const [showCustomPreset, setShowCustomPreset] = useState(false);

  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Mynd má ekki vera stærri en 5MB");
      return;
    }

    if (!file.type.match("image/(jpeg|jpg|png)")) {
      setError("Aðeins eru leyfðar JPG og PNG myndir");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  };

  const saveUploadPreset = () => {
    if (showCustomPreset && customPreset) {
      localStorage.setItem("cloudinary_upload_preset", customPreset);
      setSuccess(`Sérsniðið preset '${customPreset}' vistað!`);
    } else {
      localStorage.setItem("cloudinary_upload_preset", uploadPreset);
      setSuccess("Preset vistað!");
    }
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Vinsamlegast veldu mynd");
      return;
    }

    const cloudName = "dojqamm7u";
    const finalPreset = showCustomPreset ? customPreset : uploadPreset;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("upload_preset", finalPreset);
    formData.append("folder", "verkefnalisti-mana");

    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
      console.log(`Hleð beint upp á Cloudinary með preset: ${finalPreset}`);

      const response = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Cloudinary API villa:", errorText);

        if (errorText.includes("Upload preset not found")) {
          throw new Error(
            `Upload preset '${finalPreset}' fannst ekki. Vinsamlegast athugaðu að heiti preset sé rétt.`
          );
        }

        throw new Error(
          `Villa við upphleðslu: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      setUploadedImageUrl(data.secure_url);
      setSuccess("Mynd var hlaðið upp í Cloudinary!");

      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } catch (err: any) {
      console.error("Upphleðsla mistókst:", err);
      setError(`${err.message || "Óskilgreind villa"}`);
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-gray-700">
          Þú þarft að skrá þig inn til að nota þessa síðu
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Myndir</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Cloudinary Stillingar</h2>

        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Upload Preset
          </label>
          <div className="flex flex-col gap-2">
            <div className="flex">
              <select
                value={showCustomPreset ? "custom" : uploadPreset}
                onChange={(e) => {
                  if (e.target.value === "custom") {
                    setShowCustomPreset(true);
                  } else {
                    setShowCustomPreset(false);
                    setUploadPreset(e.target.value);
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="verkefnalisti-uploads">
                  verkefnalisti-uploads (sjálfgefið)
                </option>
                <option value="custom">Bæta við eigin preset...</option>
              </select>
              <button
                onClick={saveUploadPreset}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-r-md"
              >
                Vista
              </button>
            </div>

            {showCustomPreset && (
              <input
                type="text"
                value={customPreset}
                onChange={(e) => setCustomPreset(e.target.value)}
                placeholder="Settu inn sérsniðið upload preset"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>

          <div className="mt-2 text-sm text-gray-500">
            <p>
              Notað er <strong>verkefnalisti-uploads</strong> sem er
              sjálfgefið preset fyrir verkefnið.
            </p>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Hlaða upp mynd</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleUpload}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Mynd</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/jpeg,image/png"
              className="w-full text-gray-700 border border-gray-300 rounded py-2 px-3"
            />
            <p className="mt-1 text-sm text-gray-500">
              Hámarksstærð: 5MB. JPG og PNG myndir.
            </p>
          </div>

          {previewUrl && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Forskoðun:
              </h3>
              <div className="relative h-60 bg-gray-100 rounded-md overflow-hidden">
                <Image
                  src={previewUrl}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  alt="Forskoðun"
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {uploading ? "Hleður upp..." : "Hlaða upp"}
          </button>
        </form>
      </div>

      {uploadedImageUrl && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Síðasta upphlaðna mynd</h2>
          <div className="relative h-60 bg-gray-100 rounded-md overflow-hidden mb-4">
            <Image
              src={uploadedImageUrl}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              alt="Upphlaðin mynd"
              style={{ objectFit: "contain" }}
            />
          </div>
          <div className="bg-gray-100 p-3 rounded-md">
            <p className="text-sm font-medium mb-1">Slóð á mynd:</p>
            <div className="flex">
              <input
                type="text"
                value={uploadedImageUrl}
                readOnly
                className="flex-1 bg-white py-1 px-2 border border-gray-300 rounded-l"
              />
              <button
                onClick={() => navigator.clipboard.writeText(uploadedImageUrl)}
                className="bg-blue-500 text-white py-1 px-3 rounded-r"
              >
                Afrita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
