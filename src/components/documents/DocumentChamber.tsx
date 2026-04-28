import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Download,
  Eye,
  PenTool,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Trash2,
  FileCheck,
  FileSignature,
  FileWarning,
  User,
  Calendar,
  Lock,
  Share2,
  MoreVertical
} from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';

// Types
type DocumentStatus = 'draft' | 'review' | 'signed';
type DocumentType = 'contract' | 'proposal' | 'agreement' | 'nda';

interface Document {
  id: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  uploadDate: Date;
  lastModified: Date;
  fileSize: number;
  fileUrl: string;
  signers?: Signer[];
  signedBy?: string[];
  signedDate?: Date;
  description?: string;
  parties?: string[];
}

interface Signer {
  id: string;
  name: string;
  email: string;
  signed: boolean;
  signedDate?: Date;
  avatar?: string;
}

interface SignatureData {
  signerId: string;
  signature: string;
  date: Date;
}

export const DocumentChamber: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Investment Agreement - Seed Round',
      type: 'contract',
      status: 'draft',
      uploadDate: new Date('2024-03-15'),
      lastModified: new Date('2024-03-20'),
      fileSize: 245000,
      fileUrl: '#',
      description: 'Seed investment agreement between Nexus and investors',
      parties: ['Nexus Inc.', 'Angel Investors Group'],
      signers: [
        { id: '1', name: 'John Doe', email: 'john@nexus.com', signed: false, avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg' },
        { id: '2', name: 'Jane Smith', email: 'jane@investors.com', signed: false, avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg' }
      ]
    },
    {
      id: '2',
      name: 'Partnership Agreement - TechCorp',
      type: 'agreement',
      status: 'review',
      uploadDate: new Date('2024-03-10'),
      lastModified: new Date('2024-03-18'),
      fileSize: 189000,
      fileUrl: '#',
      description: 'Strategic partnership agreement',
      parties: ['Nexus Inc.', 'TechCorp Solutions'],
      signers: [
        { id: '3', name: 'Alice Johnson', email: 'alice@techcorp.com', signed: true, signedDate: new Date('2024-03-17'), avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg' },
        { id: '1', name: 'John Doe', email: 'john@nexus.com', signed: false, avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg' }
      ]
    },
    {
      id: '3',
      name: 'NDA - Confidentiality Agreement',
      type: 'nda',
      status: 'signed',
      uploadDate: new Date('2024-03-05'),
      lastModified: new Date('2024-03-12'),
      fileSize: 98000,
      fileUrl: '#',
      signedBy: ['John Doe', 'Sarah Williams'],
      signedDate: new Date('2024-03-12'),
      description: 'Non-disclosure agreement for project collaboration',
      parties: ['Nexus Inc.', 'Innovation Labs'],
      signers: [
        { id: '4', name: 'Sarah Williams', email: 'sarah@innovation.com', signed: true, signedDate: new Date('2024-03-12'), avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg' },
        { id: '1', name: 'John Doe', email: 'john@nexus.com', signed: true, signedDate: new Date('2024-03-11'), avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg' }
      ]
    }
  ]);

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [signatureData, setSignatureData] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDocument, setNewDocument] = useState({
    name: '',
    type: 'contract' as DocumentType,
    description: '',
    parties: ''
  });
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [selectedSigner, setSelectedSigner] = useState<Signer | null>(null);
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get status badge variant
  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'draft':
        return { variant: 'secondary', icon: FileText, label: 'Draft', color: 'text-gray-600' };
      case 'review':
        return { variant: 'warning', icon: Clock, label: 'In Review', color: 'text-yellow-600' };
      case 'signed':
        return { variant: 'success', icon: CheckCircle, label: 'Signed', color: 'text-green-600' };
      default:
        return { variant: 'secondary', icon: FileText, label: 'Unknown', color: 'text-gray-600' };
    }
  };

  // Get document type icon
  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case 'contract':
        return <FileSignature className="text-blue-600" size={24} />;
      case 'proposal':
        return <FileText className="text-purple-600" size={24} />;
      case 'agreement':
        return <FileCheck className="text-green-600" size={24} />;
      case 'nda':
        return <Lock className="text-orange-600" size={24} />;
      default:
        return <FileText className="text-gray-600" size={24} />;
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewFile(file);
      setNewDocument({
        ...newDocument,
        name: file.name.replace(/\.[^/.]+$/, '') // Remove extension
      });
    }
  };

  // Upload document
  const uploadDocument = () => {
    if (!previewFile || !newDocument.name) return;

    const newDoc: Document = {
      id: Date.now().toString(),
      name: newDocument.name,
      type: newDocument.type,
      status: 'draft',
      uploadDate: new Date(),
      lastModified: new Date(),
      fileSize: previewFile.size,
      fileUrl: URL.createObjectURL(previewFile),
      description: newDocument.description,
      parties: newDocument.parties.split(',').map(p => p.trim()),
      signers: []
    };

    setDocuments([newDoc, ...documents]);
    setShowUploadModal(false);
    setPreviewFile(null);
    setNewDocument({ name: '', type: 'contract', description: '', parties: '' });
  };

  // Signature pad drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setLastX(x);
    setLastY(y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    setLastX(x);
    setLastY(y);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureData('');
    }
  };

  const saveSignature = () => {
    if (signatureData && selectedDocument && selectedSigner) {
      // Update document signer
      const updatedDocs = documents.map(doc => {
        if (doc.id === selectedDocument.id && doc.signers) {
          const updatedSigners = doc.signers.map(signer =>
            signer.id === selectedSigner.id
              ? { ...signer, signed: true, signedDate: new Date() }
              : signer
          );
          
          // Check if all signers have signed
          const allSigned = updatedSigners.every(s => s.signed);
          
          return {
            ...doc,
            signers: updatedSigners,
            status: allSigned ? 'signed' : doc.status,
            signedDate: allSigned ? new Date() : doc.signedDate,
            signedBy: allSigned ? updatedSigners.map(s => s.name) : doc.signedBy
          };
        }
        return doc;
      });
      
      setDocuments(updatedDocs);
      setShowSignaturePad(false);
      setSignatureData('');
      setSelectedSigner(null);
      
      // Refresh selected document
      const updatedDoc = updatedDocs.find(d => d.id === selectedDocument.id);
      if (updatedDoc) setSelectedDocument(updatedDoc);
    }
  };

  const openSignaturePad = (doc: Document, signer: Signer) => {
    setSelectedDocument(doc);
    setSelectedSigner(signer);
    setShowSignaturePad(true);
    // Reset canvas after modal opens
    setTimeout(() => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }, 100);
  };

  const deleteDocument = (docId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      setDocuments(documents.filter(d => d.id !== docId));
      if (selectedDocument?.id === docId) setSelectedDocument(null);
    }
  };

  const updateDocumentStatus = (docId: string, newStatus: DocumentStatus) => {
    setDocuments(documents.map(doc =>
      doc.id === docId ? { ...doc, status: newStatus, lastModified: new Date() } : doc
    ));
  };

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    if (filterStatus !== 'all' && doc.status !== filterStatus) return false;
    if (searchTerm && !doc.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Statistics
  const stats = {
    total: documents.length,
    draft: documents.filter(d => d.status === 'draft').length,
    review: documents.filter(d => d.status === 'review').length,
    signed: documents.filter(d => d.status === 'signed').length
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-600" size={28} />
            Document Processing Chamber
          </h1>
          <p className="text-gray-600 mt-1">
            Manage contracts, agreements, and legal documents
          </p>
        </div>
        <Button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          <Upload size={18} />
          Upload Document
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Total Documents</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <FileText size={32} className="text-blue-500 opacity-50" />
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Draft</p>
              <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
            </div>
            <FileText size={32} className="text-gray-400 opacity-50" />
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">In Review</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.review}</p>
            </div>
            <Clock size={32} className="text-yellow-400 opacity-50" />
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Signed</p>
              <p className="text-2xl font-bold text-green-600">{stats.signed}</p>
            </div>
            <FileSignature size={32} className="text-green-400 opacity-50" />
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex gap-2">
          {(['all', 'draft', 'review', 'signed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg capitalize transition ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>
        <div className="flex-1 max-w-md ml-auto">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document List */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="font-semibold text-gray-900 mb-3">All Documents</h2>
          {filteredDocuments.map((doc) => {
            const status = getStatusBadge(doc.status);
            const StatusIcon = status.icon;
            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDocument(doc)}
                className={`p-4 bg-white rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  selectedDocument?.id === doc.id
                    ? 'border-blue-500 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getDocumentIcon(doc.type)}
                    <div>
                      <h3 className="font-medium text-gray-900">{doc.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={status.variant as any}>
                          <StatusIcon size={12} className="mr-1" />
                          {status.label}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {formatFileSize(doc.fileSize)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDocument(doc.id);
                    }}
                    className="text-gray-400 hover:text-red-600 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
          {filteredDocuments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No documents found
            </div>
          )}
        </div>

        {/* Document Preview & Actions */}
        <div className="lg:col-span-2">
          {selectedDocument ? (
            <Card>
              <CardBody className="space-y-6">
                {/* Document Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    {getDocumentIcon(selectedDocument.type)}
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {selectedDocument.name}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Uploaded: {new Date(selectedDocument.uploadDate).toLocaleDateString()} •
                        Modified: {new Date(selectedDocument.lastModified).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedDocument.status}
                      onChange={(e) => updateDocumentStatus(selectedDocument.id, e.target.value as DocumentStatus)}
                      className="px-3 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="review">In Review</option>
                      <option value="signed">Signed</option>
                    </select>
                    <Button variant="outline" size="sm">
                      <Download size={16} className="mr-1" />
                      Download
                    </Button>
                  </div>
                </div>

                {/* Document Description */}
                {selectedDocument.description && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-600">{selectedDocument.description}</p>
                  </div>
                )}

                {/* Parties Involved */}
                {selectedDocument.parties && selectedDocument.parties.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Parties Involved</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedDocument.parties.map((party, idx) => (
                        <Badge key={idx} variant="secondary">{party}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Signatures Section */}
                {selectedDocument.signers && selectedDocument.signers.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileSignature size={18} />
                      Signatures Required
                    </h3>
                    <div className="space-y-3">
                      {selectedDocument.signers.map((signer) => (
                        <div key={signer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar src={signer.avatar ?? ''} alt={signer.name} size="sm" />
                            <div>
                              <p className="font-medium text-gray-900">{signer.name}</p>
                              <p className="text-sm text-gray-500">{signer.email}</p>
                            </div>
                          </div>
                          {signer.signed ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle size={18} />
                              <span className="text-sm">Signed {signer.signedDate?.toLocaleDateString()}</span>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => openSignaturePad(selectedDocument, signer)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <PenTool size={16} className="mr-1" />
                              Sign Document
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PDF Preview */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Document Preview</h3>
                  <div className="bg-gray-100 rounded-lg p-8 text-center">
                    <FileText size={48} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">PDF Preview Mockup</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedDocument.name}.pdf • {formatFileSize(selectedDocument.fileSize)}
                    </p>
                    <Button variant="outline" size="sm" className="mt-3">
                      <Eye size={16} className="mr-1" />
                      Open Full Preview
                    </Button>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Status Timeline</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex-1 text-center">
                      <div className={`text-2xl ${selectedDocument.status === 'draft' ? 'text-blue-600' : 'text-gray-400'}`}>
                        <FileText size={24} className="mx-auto" />
                      </div>
                      <p className="text-sm mt-1">Draft</p>
                    </div>
                    <div className="flex-1 text-center">
                      <div className={`text-2xl ${selectedDocument.status === 'review' ? 'text-yellow-600' : 'text-gray-400'}`}>
                        <Clock size={24} className="mx-auto" />
                      </div>
                      <p className="text-sm mt-1">In Review</p>
                    </div>
                    <div className="flex-1 text-center">
                      <div className={`text-2xl ${selectedDocument.status === 'signed' ? 'text-green-600' : 'text-gray-400'}`}>
                        <FileSignature size={24} className="mx-auto" />
                      </div>
                      <p className="text-sm mt-1">Signed</p>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody className="text-center py-12">
                <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">No Document Selected</h3>
                <p className="text-gray-500 mt-1">Select a document from the list to view details</p>
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Upload Document</h2>
              <button onClick={() => setShowUploadModal(false)} className="hover:bg-gray-100 p-1 rounded">
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                {previewFile ? (
                  <div>
                    <FileCheck size={48} className="mx-auto text-green-500 mb-2" />
                    <p className="font-medium">{previewFile.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(previewFile.size)}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Change File
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload size={48} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">Click or drag file to upload</p>
                    <p className="text-sm text-gray-400 mt-1">PDF, DOC, DOCX up to 10MB</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Select File
                    </Button>
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="Document Name"
                value={newDocument.name}
                onChange={(e) => setNewDocument({ ...newDocument, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={newDocument.type}
                onChange={(e) => setNewDocument({ ...newDocument, type: e.target.value as DocumentType })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="contract">Contract</option>
                <option value="proposal">Proposal</option>
                <option value="agreement">Agreement</option>
                <option value="nda">NDA</option>
              </select>

              <textarea
                placeholder="Description (optional)"
                value={newDocument.description}
                onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="text"
                placeholder="Parties involved (comma separated)"
                value={newDocument.parties}
                onChange={(e) => setNewDocument({ ...newDocument, parties: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex gap-3">
                <Button onClick={uploadDocument} disabled={!previewFile || !newDocument.name} fullWidth>
                  Upload Document
                </Button>
                <Button variant="outline" onClick={() => setShowUploadModal(false)} fullWidth>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signature Pad Modal */}
      {showSignaturePad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Sign Document</h2>
              <button onClick={() => setShowSignaturePad(false)} className="hover:bg-gray-100 p-1 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600">Signing as: <strong>{selectedSigner?.name}</strong></p>
                <p className="text-sm text-gray-500">{selectedDocument?.name}</p>
              </div>

              <div className="border-2 border-gray-300 rounded-lg">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={200}
                  className="w-full h-48 cursor-crosshair bg-white rounded-lg"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={endDrawing}
                  onMouseLeave={endDrawing}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={clearSignature} fullWidth>
                  Clear
                </Button>
                <Button onClick={saveSignature} disabled={!signatureData} fullWidth>
                  Sign Document
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Draw your signature above using your mouse or touch
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};