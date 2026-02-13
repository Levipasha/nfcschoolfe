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
            <div className="modal-content upload-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">📤 Bulk Upload Students</h2>
                    <button onClick={() => onClose()} className="modal-close">✕</button>
                </div>

                <div className="modal-body">
                    {/* Instructions */}
                    <div className="upload-instructions">
                        <h3>📋 Instructions:</h3>
                        <ol>
                            <li>Download the template file (CSV or TXT format)</li>
                            <li>Fill in student details following the template format</li>
                            <li>Upload the completed file below</li>
                        </ol>
                    </div>

                    {/* Template Download */}
                    <div className="template-section">
                        <h4>Download Template:</h4>
                        <div className="template-buttons">
                            <button
                                onClick={() => handleDownloadTemplate('csv')}
                                className="btn btn-secondary btn-sm"
                            >
                                📄 Download CSV Template
                            </button>
                            <button
                                onClick={() => handleDownloadTemplate('txt')}
                                className="btn btn-secondary btn-sm"
                            >
                                📝 Download TXT Template
                            </button>
                        </div>
                    </div>

                    {/* School Selection */}
                    {!fixedSchool && (
                        <div className="school-selection-section">
                            <h4>Select School: <span style={{ color: '#dc2626' }}>*</span></h4>
                            <select
                                value={selectedSchool}
                                onChange={(e) => {
                                    const school = schools.find(s => s._id === e.target.value);
                                    setSelectedSchool(e.target.value);
                                    setSelectedSchoolCode(school?.code || '');
                                }}
                                className="input-field"
                                required
                                disabled={uploading}
                            >
                                <option value="">Choose School</option>
                                {schools.map(school => (
                                    <option key={school._id} value={school._id}>
                                        {school.name} ({school.code})
                                    </option>
                                ))}
                            </select>
                            {selectedSchoolCode && (
                                <small style={{ display: 'block', marginTop: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                    📝 Uploaded students will get IDs like: <strong>{selectedSchoolCode}-01</strong>, <strong>{selectedSchoolCode}-02</strong>, etc.
                                </small>
                            )}
                        </div>
                    )}

                    {/* File Upload Area */}
                    <div className="upload-section">
                        <h4>Upload File:</h4>

                        <div
                            className={`upload-dropzone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {file ? (
                                <div className="file-selected">
                                    <div className="file-icon">📄</div>
                                    <div className="file-info">
                                        <div className="file-name">{file.name}</div>
                                        <div className="file-size">{(file.size / 1024).toFixed(2)} KB</div>
                                    </div>
                                    <button
                                        onClick={() => setFile(null)}
                                        className="btn-remove-file"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="upload-icon">📁</div>
                                    <p className="upload-text">
                                        Drag and drop file here, or click to browse
                                    </p>
                                    <p className="upload-hint">
                                        Accepts CSV and TXT files (max 5MB)
                                    </p>
                                    <input
                                        type="file"
                                        accept=".csv,.txt"
                                        onChange={handleFileChange}
                                        className="file-input"
                                        disabled={uploading}
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Upload Result */}
                    {result && (
                        <div className="upload-result">
                            <h4>Upload Results:</h4>

                            <div className="result-stats">
                                <div className="result-stat success">
                                    <div className="stat-icon">✅</div>
                                    <div className="stat-info">
                                        <div className="stat-value">{result.successful}</div>
                                        <div className="stat-label">Successful</div>
                                    </div>
                                </div>

                                <div className="result-stat warning">
                                    <div className="stat-icon">⚠️</div>
                                    <div className="stat-info">
                                        <div className="stat-value">{result.duplicates}</div>
                                        <div className="stat-label">Duplicates</div>
                                    </div>
                                </div>

                                <div className="result-stat error">
                                    <div className="stat-icon">❌</div>
                                    <div className="stat-info">
                                        <div className="stat-value">{result.failed}</div>
                                        <div className="stat-label">Failed</div>
                                    </div>
                                </div>
                            </div>

                            {/* Show details if there are errors */}
                            {(result.failed > 0 || result.duplicates > 0) && (
                                <div className="result-details">
                                    {result.details.duplicates.length > 0 && (
                                        <div className="detail-section">
                                            <h5>Duplicate Roll Numbers:</h5>
                                            <ul>
                                                {result.details.duplicates.slice(0, 5).map((dup, idx) => (
                                                    <li key={idx}>
                                                        {dup.name} ({dup.rollNumber})  {dup.reason}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {result.details.failed.length > 0 && (
                                        <div className="detail-section">
                                            <h5>Failed Entries:</h5>
                                            <ul>
                                                {result.details.failed.slice(0, 5).map((fail, idx) => (
                                                    <li key={idx}>
                                                        {fail.name} ({fail.rollNumber}) - {fail.reason}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="modal-footer">
                        <button
                            onClick={() => onClose()}
                            className="btn btn-secondary"
                            disabled={uploading}
                        >
                            Close
                        </button>
                        <button
                            onClick={handleUpload}
                            className="btn btn-primary"
                            disabled={!file || uploading}
                        >
                            {uploading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Uploading...
                                </>
                            ) : (
                                '📤 Upload Students'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkUploadModal;
