'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Image, Film, Music, Trash2, Download, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatBytes } from '@/lib/utils';

interface FileItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  resourceType: string;
  width?: number;
  height?: number;
  createdAt: Date;
}

export function FileManagement() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/uploads');
      const data = await response.json();
      if (response.ok) {
        setFiles(data.files);
      } else {
        toast.error('Failed to load files');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('File uploaded successfully');
        setSelectedFile(null);
        fetchFiles();
      } else {
        toast.error(data.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/uploads/${fileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('File deleted successfully');
        setFiles(files.filter((f) => f.id !== fileId));
      } else {
        toast.error('Failed to delete file');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-5 w-5" />;
    if (mimeType.startsWith('video/')) return <Film className="h-5 w-5" />;
    if (mimeType.startsWith('audio/')) return <Music className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Upload Files</h3>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          
          <p className="text-gray-600 mb-2">
            Drag and drop your file here, or click to browse
          </p>
          
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileSelect}
          />
          
          <label htmlFor="file-upload">
            <Button variant="outline" className="cursor-pointer" asChild>
              <span>Choose File</span>
            </Button>
          </label>
          
          {selectedFile && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getFileIcon(selectedFile.type)}
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <span className="text-sm text-gray-500">
                  ({formatBytes(selectedFile.size)})
                </span>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          {selectedFile && (
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-4"
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
          )}
        </div>
        
        <p className="text-sm text-gray-500 mt-2">
          Maximum file size: 10MB. Supported formats: Images, PDFs, Documents, Videos, Audio
        </p>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Your Files</h3>
        
        {loading ? (
          <p className="text-gray-500">Loading files...</p>
        ) : files.length === 0 ? (
          <p className="text-gray-500">No files uploaded yet</p>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.mimeType)}
                  <div>
                    <p className="font-medium text-sm">{file.originalName}</p>
                    <p className="text-xs text-gray-500">
                      {formatBytes(file.size)} • {new Date(file.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(file.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}