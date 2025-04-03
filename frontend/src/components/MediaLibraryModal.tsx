"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CloudinaryService } from "@/services/api";

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentImageUrl?: string;
}

interface CloudinaryImage {
  public_id: string;
  secure_url: string;
  created_at: string;
  format: string;
}

export default function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  currentImageUrl,
}: MediaLibraryModalProps) {
  const [selectedTab, setSelectedTab] = useState<"library" | "upload">("library");
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(currentImageUrl || null);
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Fetch images from Cloudinary when modal opens
  useEffect(() => {
    if (isOpen && selectedTab === "library") {
      fetchImages();
    }
  }, [isOpen, selectedTab]);
  
  // Clear selected file when switching tabs or closing modal
  useEffect(() => {
    if (!isOpen) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadSuccess(false);
    }
  }, [isOpen, selectedTab]);
  
  const fetchImages = async () => {
    try {
      setLoading(true);
      setError("");
      const imageList = await CloudinaryService.getImages("verkefnalisti-mana");
      setImages(imageList.resources || []);
    } catch (err: any) {
      setError("Villa við að sækja myndir");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };
  
  const handleConfirmSelection = () => {
    if (selectedImage) {
      onSelect(selectedImage);
      onClose();
    }
  };
  
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
    setUploadSuccess(false);
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Vinsamlegast veldu mynd");
      return;
    }
    
    setUploading(true);
    setError("");
    
    try {
      const cloudinaryUrl = await CloudinaryService.uploadImage(selectedFile);
      setSelectedImage(cloudinaryUrl);
      setUploadSuccess(true);
      
      // Refresh the image library
      if (selectedTab === "upload") {
        fetchImages();
      }
    } catch (err: any) {
      setError(err.message || "Villa við upphleðslu");
      console.error("Upphleðsla mistókst:", err);
    } finally {
      setUploading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Velja mynd</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>
        
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 ${
              selectedTab === "library" 
                ? "border-b-2 border-blue-500 text-blue-500" 
                : "text-gray-500"
            }`}
            onClick={() => setSelectedTab("library")}
          >
            Myndasafn
          </button>
          <button
            className={`px-4 py-2 ${
              selectedTab === "upload" 
                ? "border-b-2 border-blue-500 text-blue-500" 
                : "text-gray-500"
            }`}
            onClick={() => setSelectedTab("upload")}
          >
            Hlaða upp
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 160px)' }}>
          {selectedTab === "library" && (
            <>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                  <button 
                    className="ml-2 underline"
                    onClick={fetchImages}
                  >
                    Reyna aftur
                  </button>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">Engar myndir fundust</p>
                  <button
                    onClick={() => setSelectedTab("upload")}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    Hlaða upp mynd
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <div 
                      key={image.public_id} 
                      className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 ${
                        selectedImage === image.secure_url 
                          ? "border-blue-500" 
                          : "border-transparent hover:border-gray-300"
                      }`}
                      onClick={() => handleImageSelect(image.secure_url)}
                    >
                      <Image
                        src={image.secure_url}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 33vw, 25vw"
                        style={{ objectFit: "cover" }}
                      />
                      {selectedImage === image.secure_url && (
                        <div className="absolute top-2 right-2 bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          
          {selectedTab === "upload" && (
            <div className="space-y-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              {uploadSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  Mynd var hlaðið upp!
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Velja mynd til að hlaða upp:
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Hámarksstærð: 5MB. JPG og PNG myndir.
                </p>
              </div>
              
              {previewUrl && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Forskoðun:</h3>
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
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md disabled:bg-blue-300"
              >
                {uploading ? "Hleður upp..." : "Hlaða upp"}
              </button>
            </div>
          )}
        </div>
        
        <div className="flex justify-end px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md mr-2"
          >
            Hætta við
          </button>
          <button
            onClick={handleConfirmSelection}
            disabled={!selectedImage}
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-blue-300"
          >
            Velja mynd
          </button>
        </div>
      </div>
    </div>
  );
}
