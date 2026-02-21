import React, { useState, useEffect } from 'react';
import { adminAPI, schoolAPI } from '../services/api';
import './BulkUploadModal.css';

const BulkUploadModal = ({ onClose, onSuccess, fixedSchool = null }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState(fixedSchool ? fixedSchool.id : '');
    const [selectedSchoolCode, setSelectedSchoolCode] = useState(fixedSchool ? fixedSchool.code : '');

    useEffect(() => {
        const loadSchools = async () => {
            try {
                const response = await schoolAPI.getSchools({ status: 'active' });
                setSchools(response.data.data);
                // Auto-select if only one school
                if (response.data.data.length === 1) {
                    setSelectedSchool(response.data.data[0]._id);
                    setSelectedSchoolCode(response.data.data[0].code);
                }
            } catch (error) {
                console.error('Error loading schools:', error);
            }
        };
        loadSchools();
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            validateAndSetFile(selectedFile);
        }
    };

    const validateAndSetFile = (selectedFile) => {
        const fileName = selectedFile.name.toLowerCase();

        if (!fileName.endsWith('.csv') && !fileName.endsWith('.txt')) {
            alert('Please upload a CSV or TXT file');
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        setFile(selectedFile);
        setResult(null);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert('Please select a file first');
            return;
        }

        if (!selectedSchool || !selectedSchoolCode) {
            alert('Please select a school first');
            return;
        }

        try {
            setUploading(true);
            setResult(null);

            const response = await adminAPI.uploadStudents(file, selectedSchool, selectedSchoolCode);

            if (response.data.success) {
                setResult(response.data.data);

                if (response.data.data.successful > 0) {
                    setTimeout(() => {
                        onSuccess();
                    }, 2000);
                }
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert(error.response?.data?.message || 'Failed to upload file');
        } finally {
            setUploading(false);
        }
    };

    const handleDownloadTemplate = async (format) => {
        try {
            const response = await adminAPI.downloadTemplate(format);

            const blob = new Blob([response.data], {
                type: format === 'csv' ? 'text/csv' : 'text/plain'
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `student_upload_template.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download template');
        }
    };

    return (
        <div className="modal-overlay" onClick={() => onClose()}>
            <div className="modal-content upload-modal-premium" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-premium">
                    <div className="title-section-centered">
                        <h2 className="modal-title">Bulk Student Upload</h2>
                    </div>
                </div>

                <div className="modal-body-premium">

                    {/* School Selection */}
                    {!fixedSchool && (
                        <div className="school-select-section-premium">
                            <span className="label-text">Select Destination School:</span>
                            <select
                                value={selectedSchool}
                                onChange={(e) => {
                                    const school = schools.find(s => s._id === e.target.value);
                                    setSelectedSchool(e.target.value);
                                    setSelectedSchoolCode(school?.code || '');
                                }}
                                className="premium-select"
                                required
                                disabled={uploading}
                            >
                                <option value="">Choose a school...</option>
                                {schools.map(school => (
                                    <option key={school._id} value={school._id}>
                                        {school.name} ({school.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Template Download */}
                    <div className="template-section">
                        <div className="section-label-row">
                            <span className="label-text">Select Template Format:</span>
                        </div>
                        <div className="template-grid">
                            <button onClick={() => handleDownloadTemplate('csv')} className="template-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                <span>CSV Format</span>
                            </button>
                            <button onClick={() => handleDownloadTemplate('txt')} className="template-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                <span>TXT Format</span>
                            </button>
                        </div>
                    </div>

                    {/* File Upload Area */}
                    <div className="upload-zone-wrapper">
                        <div
                            className={`premium-dropzone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {file ? (
                                <div className="file-preview-premium">
                                    <div className="file-icon-box">
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>
                                    </div>
                                    <div className="file-details">
                                        <div className="name">{file.name}</div>
                                        <div className="size">{(file.size / 1024).toFixed(2)} KB</div>
                                    </div>
                                    <button onClick={() => setFile(null)} className="remove-file-btn">✕</button>
                                </div>
                            ) : (
                                <div className="empty-zone">
                                    <div className="zone-icon-box">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                                    </div>
                                    <p className="primary-text">Drag & drop or <span>browse files</span></p>
                                    <p className="secondary-text">Maximum size 5MB (CSV, TXT)</p>
                                    <input
                                        type="file"
                                        accept=".csv,.txt"
                                        onChange={handleFileChange}
                                        className="hidden-file-input"
                                        disabled={uploading}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upload Result */}
                    {result && (
                        <div className="result-panel-premium">
                            <div className="result-grid">
                                <div className="stat-card-premium success">
                                    <span className="val">{result.successful}</span>
                                    <span className="lab">Imported</span>
                                </div>
                                <div className="stat-card-premium warning">
                                    <span className="val">{result.duplicates}</span>
                                    <span className="lab">Duplicates</span>
                                </div>
                                <div className="stat-card-premium error">
                                    <span className="val">{result.failed}</span>
                                    <span className="lab">Failed</span>
                                </div>
                            </div>

                            {(result.failed > 0 || result.duplicates > 0) && (
                                <div className="issue-log-premium">
                                    {result.details.duplicates.length > 0 && (
                                        <div className="log-section">
                                            <h5>Duplicates Detected (First 5):</h5>
                                            {result.details.duplicates.slice(0, 5).map((dup, idx) => (
                                                <div key={idx} className="log-item">
                                                    <strong>{dup.rollNumber}</strong>: {dup.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {result.details.failed.length > 0 && (
                                        <div className="log-section">
                                            <h5>Failed Entries (First 5):</h5>
                                            {result.details.failed.slice(0, 5).map((fail, idx) => (
                                                <div key={idx} className="log-item danger">
                                                    <strong>{fail.rollNumber}</strong>: {fail.reason}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="modal-actions-premium">
                        <button onClick={() => onClose()} className="modal-btn-secondary" disabled={uploading}>
                            Cancel
                        </button>
                        <button onClick={handleUpload} className="modal-btn-primary" disabled={!file || uploading}>
                            {uploading ? (
                                <div className="loading-state">
                                    <div className="spinner-mini"></div>
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                <>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"></polyline><line x1="12" y1="12" x2="12" y2="21"></line><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path><polyline points="16 16 12 12 8 16"></polyline></svg>
                                    <span>Start Import</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkUploadModal;
