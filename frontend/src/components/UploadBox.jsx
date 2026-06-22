import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function UploadBox({ onUpload, disabled = false, currentCount = 0 }) {
  const [dragActive, setDragActive] = useState(false);
  const [fileList, setFileList] = useState([]);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    if (disabled) return;
    // Check file type (allow pdf, jpg, jpeg, png)
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      const errorItem = {
        id: Math.random().toString(),
        name: file.name,
        status: 'error',
        message: 'Invalid file type. Please upload PDF, PNG or JPG.'
      };
      setFileList((prev) => [errorItem, ...prev]);
      return;
    }

    const newItem = {
      id: Math.random().toString(),
      name: file.name,
      status: 'uploading',
      progress: 0
    };

    setFileList((prev) => [newItem, ...prev]);

    // Simulate upload progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 20;
      setFileList((prev) =>
        prev.map((item) =>
          item.id === newItem.id
            ? { ...item, progress: currentProgress }
            : item
        )
      );

      if (currentProgress >= 100) {
        clearInterval(interval);
        setFileList((prev) =>
          prev.map((item) =>
            item.id === newItem.id
              ? { ...item, status: 'success' }
              : item
          )
        );
        // Call parent upload trigger
        if (onUpload) {
          onUpload(file);
        }
      }
    }, 150);
  };

  const handleDrop = (e) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      files.forEach(processFile);
    }
  };

  const handleInputChange = (e) => {
    if (disabled) return;
    if (e.target.files && e.target.files[0]) {
      const files = Array.from(e.target.files);
      files.forEach(processFile);
    }
  };

  const onButtonClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Container */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 flex flex-col items-center justify-center min-h-[220px] ${
          disabled
            ? 'border-gray-200 bg-gray-50/50 cursor-not-allowed opacity-75'
            : dragActive
            ? 'border-emerald-600 bg-emerald-50/50 scale-[0.99] shadow-inner cursor-pointer'
            : 'border-gray-250 bg-white hover:bg-gray-50/50 hover:border-emerald-500 cursor-pointer'
        }`}
        onClick={onButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={!disabled}
          disabled={disabled}
          className="hidden"
          onChange={handleInputChange}
          accept=".pdf,.png,.jpg,.jpeg"
        />

        <div className={`p-4 rounded-full mb-4 transition-transform ${
          disabled ? 'bg-gray-100 text-gray-400' : 'bg-emerald-50 text-emerald-700 hover:scale-110'
        }`}>
          <Upload className="h-7 w-7" />
        </div>

        <h3 className="font-semibold text-gray-900 text-base leading-snug">
          {disabled ? "Upload limit reached (3/3)" : "Drag and drop your files here"}
        </h3>
        <p className="text-xs text-gray-500 mt-1 mb-4">
          {disabled
            ? "You have uploaded the maximum limit of 3 files. Remove one to upload a new document."
            : "Supports NIC Copy, Land Deeds, and GN Certifications (PDF, PNG, JPG up to 10MB)"}
        </p>
        
        {!disabled && (
          <button
            type="button"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm hover:shadow transition-all cursor-pointer"
          >
            Select Files from computer
          </button>
        )}
      </div>

      {/* File List / Queue */}
      {fileList.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Uploaded / OCR Validation Status
          </h4>
          <div className="divide-y divide-gray-100 bg-white border border-gray-150 rounded-xl overflow-hidden shadow-sm">
            {fileList.map((file) => (
              <div key={file.id} className="p-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-gray-800 truncate block">
                      {file.name}
                    </span>
                    {file.status === 'uploading' && (
                      <div className="w-48 bg-gray-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-1.5 rounded-full transition-all duration-150"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}
                    {file.status === 'error' && (
                      <span className="text-xs text-red-600 font-medium block mt-0.5">
                        {file.message}
                      </span>
                    )}
                    {file.status === 'success' && (
                      <span className="text-xs text-emerald-600 font-medium block mt-0.5">
                        OCR Analysis Complete
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Status Indicator */}
                <div className="shrink-0">
                  {file.status === 'uploading' && (
                    <Loader2 className="h-5 w-5 text-emerald-600 animate-spin" />
                  )}
                  {file.status === 'success' && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 fill-emerald-50" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
