import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Share2, 
  FileSignature,
  CheckCircle,
  Clock,
  Eye,
  PenTool,
  X,
  Calendar,
  Users,
  Lock,
  MoreVertical
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { DocumentChamber } from '../../components/documents/DocumentChamber';
import { SignaturePad } from '../../components/documents/SignaturePad';

// Types
type DocumentStatus = 'draft' | 'review' | 'signed';
type DocumentType = 'contract' | 'proposal' | 'agreement' | 'nda' | 'general';

interface Document {
  id: string;
  name: string;
  type: DocumentType;
  status: DocumentStatus;
  uploadDate: Date;
  lastModified: Date;
  fileSize: number;
  fileUrl: string;
  shared: boolean;
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

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Pitch Deck 2024.pdf',
      type: 'general',
      status: 'draft',
      uploadDate: new Date('2024-02-15'),
      lastModified: new Date('2024-02-15'),
      fileSize: 2.4 * 1024 * 1024,
      fileUrl: '#',
      shared: true
    },
    {
      id: '2',
      name: 'Financial Projections.xlsx',
      type: 'general',
      status: 'draft',
      uploadDate: new Date('2024-02-10'),
      lastModified: new Date('2024-02-10'),
      fileSize: 1.8 * 1024 * 1024,
      fileUrl: '#',
      shared: false
    },
    {
      id: '3',
      name: 'Investment Agreement - Seed Round',
      type: 'contract',
      status: 'review',
      uploadDate: new Date('2024-03-15'),
      lastModified: new Date('2024-03-20'),
      fileSize: 2.4 * 1024 * 1024,
      fileUrl: '#',
      shared: true,
      description: 'Seed investment agreement between Nexus and investors',
      parties: ['Nexus Inc.', 'Angel Investors Group'],
      signers: [
        { id: '1', name: 'John Doe', email: 'john@nexus.com', signed: false, avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg' },
        { id: '2', name: 'Jane Smith', email: 'jane@investors.com', signed: false, avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg' }
      ]
    },
    {
      id: '4',
      name: 'Partnership Agreement - TechCorp',
      type: 'agreement',
      status: 'signed',
      uploadDate: new Date('2024-03-10'),
      lastModified: new Date('2024-03-18'),
      fileSize: 1.8 * 1024 * 1024,
      fileUrl: '#',
      shared: true,
      signedDate: new Date('2024-03-18'),
      signedBy: ['John Doe', 'Alice Johnson'],
      parties: ['Nexus Inc.', 'TechCorp Solutions'],
      signers: [
        { id: '3', name: 'Alice Johnson', email: 'alice@techcorp.com', signed: true, signedDate: new Date('2024-03-17'), avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg' },
        { id: '1', name: 'John Doe', email: 'john@nexus.com', signed: true, signedDate: new Date('2024-03-16'), avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg' }
      ]
    },
    {
      id: '5',
      name: 'NDA - Confidentiality Agreement',
      type: 'nda',
      status: 'signed',
      uploadDate: new Date('2024-03-05'),
      lastModified: new Date('2024-03-12'),
      fileSize: 980000,
      fileUrl: '#',
      shared: false,
      signedDate: new Date('2024-03-12'),
      signedBy: ['John Doe', 'Sarah Williams'],
      parties: ['Nexus Inc.', 'Innovation Labs']
    },
    {
      id: '6',
      name: 'Business Plan.docx',
      type: 'general',
      status: 'draft',
      uploadDate: new Date('2024-02-05'),
      lastModified: new Date('2024-02-05'),
      fileSize: 3.2 * 1024 * 1024,
      fileUrl: '#',
      shared: true
    }
  ]);

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedSigner, setSelectedSigner] = useState<Signer | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'contracts' | 'general'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'review':
        return <Badge variant="warning">In Review</Badge>;
      case 'signed':
        return <Badge variant="success">Signed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case 'contract':
        return <FileSignature className="text-blue-600" size={24} />;
      case 'proposal':
        return <FileText className="text-purple-600" size={24} />;
      case 'agreement':
        return <FileSignature className="text-green-600" size={24} />;
      case 'nda':
        return <Lock className="text-orange-600" size={24} />;
      default:
        return <FileText className="text-gray-600" size={24} />;
    }
  };

  const openSignaturePad = (doc: Document, signer: Signer) => {
    setSelectedDocument(doc);
    setSelectedSigner(signer);
    setShowSignatureModal(true);
  };

  const saveSignature = (signatureData: string) => {
    if (signatureData && selectedDocument && selectedSigner) {
      const updatedDocs = documents.map(doc => {
        if (doc.id === selectedDocument.id && doc.signers) {
          const updatedSigners = doc.signers.map(signer =>
            signer.id === selectedSigner.id
              ? { ...signer, signed: true, signedDate: new Date() }
              : signer
          );
          
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
      setShowSignatureModal(false);
      setSelectedSigner(null);
    }
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
    if (filterType === 'contracts' && !['contract', 'agreement', 'nda'].includes(doc.type)) return false;
    if (filterType === 'general' && doc.type !== 'general') return false;
    if (searchTerm && !doc.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: documents.length,
    contracts: documents.filter(d => ['contract', 'agreement', 'nda'].includes(d.type)).length,
    signed: documents.filter(d => d.status === 'signed').length,
    pending: documents.filter(d => d.status === 'review').length
  };

  if (viewMode === 'grid') {
    return <DocumentChamber />;
  }

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage your startup's important files and contracts</p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setViewMode('grid')}
            className="flex items-center gap-2"
          >
            <FileSignature size={18} />
            Contract View
          </Button>
          <Button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2">
            <Upload size={18} />
            Upload Document
          </Button>
        </div>
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
              <p className="text-gray-500 text-sm">Contracts & Agreements</p>
              <p className="text-2xl font-bold">{stats.contracts}</p>
            </div>
            <FileSignature size={32} className="text-purple-500 opacity-50" />
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Signed</p>
              <p className="text-2xl font-bold text-green-600">{stats.signed}</p>
            </div>
            <CheckCircle size={32} className="text-green-400 opacity-50" />
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">In Review</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock size={32} className="text-yellow-400 opacity-50" />
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="flex gap-2">
          {['all', 'contracts', 'general'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`px-4 py-2 rounded-lg capitalize transition ${
                filterType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {type === 'all' ? 'All Documents' : type === 'contracts' ? 'Contracts & Legal' : 'General Files'}
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

      {/* Document List */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            {filterType === 'all' ? 'All Documents' : filterType === 'contracts' ? 'Contracts & Agreements' : 'General Files'}
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Sort by Date
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {filteredDocuments.map(doc => (
              <div
                key={doc.id}
                className="flex items-start p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200 cursor-pointer"
                onClick={() => setSelectedDocument(doc)}
              >
                <div className="p-2 bg-primary-50 rounded-lg mr-4">
                  {getDocumentIcon(doc.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {doc.name}
                    </h3>
                    {doc.shared && (
                      <Badge variant="secondary" size="sm">Shared</Badge>
                    )}
                    {getStatusBadge(doc.status)}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 flex-wrap">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>Modified {new Date(doc.lastModified).toLocaleDateString()}</span>
                    {doc.signedDate && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle size={12} />
                        Signed {new Date(doc.signedDate).toLocaleDateString()}
                      </span>
                    )}
                    {doc.signers && doc.signers.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {doc.signers.filter(s => s.signed).length}/{doc.signers.length} signed
                      </span>
                    )}
                  </div>

                  {/* Signers preview for contracts */}
                  {doc.signers && doc.signers.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      {doc.signers.map((signer, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <Avatar src={signer.avatar ?? ''} alt={signer.name} size="xs" />
                          <span className="text-xs text-gray-600">{signer.name}</span>
                          {signer.signed && <CheckCircle size={10} className="text-green-600" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {doc.signers && doc.signers.some(s => !s.signed) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        const unsignedSigner = doc.signers?.find(s => !s.signed);
                        if (unsignedSigner) openSignaturePad(doc, unsignedSigner);
                      }}
                      className="flex items-center gap-1"
                    >
                      <PenTool size={14} />
                      Sign
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    aria-label="Download"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download size={18} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    aria-label="Share"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Share2 size={18} />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 text-red-600 hover:text-red-700"
                    aria-label="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteDocument(doc.id);
                    }}
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredDocuments.length === 0 && (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No documents found</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <div className="flex items-center gap-3">
                {getDocumentIcon(selectedDocument.type)}
                <h2 className="text-xl font-bold">{selectedDocument.name}</h2>
              </div>
              <button onClick={() => setSelectedDocument(null)} className="hover:bg-gray-100 p-1 rounded">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <select
                    value={selectedDocument.status}
                    onChange={(e) => {
                      updateDocumentStatus(selectedDocument.id, e.target.value as DocumentStatus);
                      setSelectedDocument({ ...selectedDocument, status: e.target.value as DocumentStatus });
                    }}
                    className="mt-1 px-3 py-1 border rounded-lg text-sm"
                  >
                    <option value="draft">Draft</option>
                    <option value="review">In Review</option>
                    <option value="signed">Signed</option>
                  </select>
                </div>
                <div>
                  <p className="text-sm text-gray-500">File Size</p>
                  <p className="font-medium">{formatFileSize(selectedDocument.fileSize)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Uploaded</p>
                  <p className="font-medium">{new Date(selectedDocument.uploadDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Modified</p>
                  <p className="font-medium">{new Date(selectedDocument.lastModified).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedDocument.description && (
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="mt-1">{selectedDocument.description}</p>
                </div>
              )}

              {selectedDocument.parties && selectedDocument.parties.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Parties Involved</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedDocument.parties.map((party, idx) => (
                      <Badge key={idx} variant="secondary">{party}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedDocument.signers && selectedDocument.signers.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Signatures</p>
                  <div className="space-y-2">
                    {selectedDocument.signers.map((signer) => (
                      <div key={signer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar src={signer.avatar ?? ''} alt={signer.name} size="sm" />
                          <div>
                            <p className="font-medium">{signer.name}</p>
                            <p className="text-sm text-gray-500">{signer.email}</p>
                          </div>
                        </div>
                        {signer.signed ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle size={16} />
                            <span className="text-sm">Signed {signer.signedDate?.toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <Button size="sm" onClick={() => openSignaturePad(selectedDocument, signer)}>
                            <PenTool size={14} className="mr-1" />
                            Sign
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <Button fullWidth>
                  <Download size={16} className="mr-1" />
                  Download
                </Button>
                <Button variant="outline" fullWidth>
                  <Share2 size={16} className="mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signature Pad Modal */}
      {showSignatureModal && selectedSigner && (
        <SignaturePad
          signerName={selectedSigner.name}
          documentName={selectedDocument?.name || ''}
          onSave={saveSignature}
          onClose={() => setShowSignatureModal(false)}
        />
      )}

      {/* Upload Modal (simplified) */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Upload Document</h2>
              <button onClick={() => setShowUploadModal(false)} className="hover:bg-gray-100 p-1 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload size={48} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">Click or drag file to upload</p>
              <p className="text-sm text-gray-400 mt-1">PDF, DOC, DOCX up to 10MB</p>
              <Button variant="outline" size="sm" className="mt-3">
                Select File
              </Button>
            </div>
            <div className="flex gap-3 mt-4">
              <Button fullWidth>Upload</Button>
              <Button variant="outline" fullWidth onClick={() => setShowUploadModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};