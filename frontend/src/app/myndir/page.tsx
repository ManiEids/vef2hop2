"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { CloudinaryService } from "@/services/api";

interface CloudinaryImage {
  public_id: string;
  secure_url: string;
  created_at: string;
  format: string;
}

export default function ImagesPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [imageError, setImageError] = useState("");
  const [copiedUrl, setCopiedUrl] = useState("");

  const defaultPreset = "verkefnalisti-uploads";
  const [uploadPreset, setUploadPreset] = useState(defaultPreset);
  const [customPreset, setCustomPreset] = useState("");
  const [showCustomPreset, setShowCustomPreset] = useState(false);

  const [page, setPage] = useState(1);
  const [imagesPerPage, setImagesPerPage] = useState(12);
  const [viewMode, setViewMode] = useState<"scroll" | "paginate">("scroll");
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchImages();
    }
  }, [user]);

  const fetchImages = async () => {
    try {
      setLoadingImages(true);
      setImageError("");
      const response = await CloudinaryService.getImages("verkefnalisti-mana");

      // Sort images by creation date (newest first)
      const sortedImages = [...response.resources].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      setImages(sortedImages);
      console.log(`Sækja myndir: ${sortedImages.length} einstakar myndir fundust`);
      
      // Reset to page 1 when getting new images
      setPage(1);
    } catch (err: any) {
      console.error("Villa við að sækja myndir:", err);
      setImageError("Villa við að sækja myndir");
    } finally {
      setLoadingImages(false);
    }
  };

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

      // After successful upload, refresh the image gallery and switch to page 1
      setTimeout(() => {
        fetchImages();
        setPage(1);
      }, 1000);
    } catch (err: any) {
      console.error("Upphleðsla mistókst:", err);
      setError(`${err.message || "Óskilgreind villa"}`);
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);

    setTimeout(() => {
      if (setCopiedUrl) setCopiedUrl("");
    }, 2000);
  };

  const totalPages = Math.ceil(images.length / imagesPerPage);
  const paginatedImages = viewMode === "paginate" 
    ? images.slice((page - 1) * imagesPerPage, page * imagesPerPage)
    : images;

  const displayImages = viewMode === "paginate" ? paginatedImages : images;

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
    <div className="max-w-6xl mx-auto">
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

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Allar myndir</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <label htmlFor="viewMode" className="text-sm mr-2">Sýna sem:</label>
              <select 
                id="viewMode"
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as "scroll" | "paginate")}
                className="text-sm bg-gray-100 border border-gray-300 rounded px-2 py-1"
              >
                <option value="scroll">Skruna</option>
                <option value="paginate">Síður</option>
              </select>
            </div>
            <button
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="px-2 py-1 text-xs bg-gray-200 rounded-md"
              title="Show/hide debug info"
            >
              🐞
            </button>
            <button
              onClick={fetchImages}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded-md flex items-center gap-1"
              disabled={loadingImages}
            >
              {loadingImages ? (
                "Uppfæri..."
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Uppfæra
                </>
              )}
            </button>
          </div>
        </div>

        {imageError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {imageError}
          </div>
        )}

        {showDebugInfo && (
          <div className="bg-gray-100 border border-gray-300 p-2 mb-4 text-xs text-gray-700 rounded">
            <p>Total images: {images.length}</p>
            <p>View mode: {viewMode}</p>
            <p>Current page: {page}</p>
            <p>Items per page: {imagesPerPage}</p>
            <p>Total pages: {totalPages}</p>
            <p>Showing images: {viewMode === "paginate" ? `${(page-1)*imagesPerPage+1}-${Math.min(page*imagesPerPage, images.length)}` : "All"}</p>
          </div>
        )}

        {loadingImages ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : images.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Engar myndir fundust.</p>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-500">
              <p>
                {viewMode === "paginate" 
                  ? `Sýni ${Math.min(paginatedImages.length, imagesPerPage)} af ${images.length} myndum (síða ${page}/${totalPages})` 
                  : `Sýni allar ${images.length} myndir, nýjustu efst`}
              </p>
            </div>
            
            <div 
              className="overflow-y-auto" 
              style={{ 
                maxHeight: viewMode === "scroll" ? "70vh" : "auto",
                scrollBehavior: "smooth"
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayImages.map((image, index) => (
                  <div key={`${image.public_id}-${index}`} className="bg-gray-100 p-3 rounded-lg">
                    <div className="relative h-40 mb-2 bg-white rounded overflow-hidden">
                      <Image
                        src={image.secure_url}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <div className="flex">
                      <input
                        type="text"
                        value={image.secure_url}
                        readOnly
                        className="flex-1 text-xs bg-white px-2 py-1 border border-r-0 border-gray-300 rounded-l truncate"
                      />
                      <button
                        onClick={() => copyToClipboard(image.secure_url)}
                        className={`px-2 py-1 text-xs text-white rounded-r ${
                          copiedUrl === image.secure_url
                            ? "bg-green-500"
                            : "bg-blue-500 hover:bg-blue-600"
                        }`}
                      >
                        {copiedUrl === image.secure_url ? "Afritað!" : "Afrita"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {(viewMode === "paginate" && totalPages > 1) && (
              <div className="mt-6 flex justify-center">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="px-2 py-1 bg-gray-200 rounded-md disabled:opacity-50 text-sm"
                  >
                    « Fyrsta
                  </button>
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
                  >
                    Fyrri
                  </button>
                  
                  <div className="flex items-center gap-1 mx-2">
                    {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={i}
                          onClick={() => setPage(pageNum)}
                          className={`w-8 h-8 rounded-md ${
                            page === pageNum 
                              ? "bg-blue-500 text-white" 
                              : "bg-gray-200"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50"
                  >
                    Næsta
                  </button>
                  <button 
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="px-2 py-1 bg-gray-200 rounded-md disabled:opacity-50 text-sm"
                  >
                    Síðasta »
                  </button>
                </div>
              </div>
            )}
            
            {viewMode === "scroll" && images.length > 12 && (
              <div className="mt-4 text-center">
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-blue-500 hover:underline text-sm"
                >
                  Fara efst á síðu
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
