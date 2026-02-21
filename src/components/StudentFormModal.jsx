import React, { useState, useEffect, useRef } from 'react';
import { adminAPI, schoolAPI } from '../services/api';
import './StudentFormModal.css';

const StudentFormModal = ({ student, onClose, fixedSchool = null }) => {
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        name: '',
        rollNumber: '',
        class: '',
        bloodGroup: '',
        motherName: '',
        fatherName: '',
        motherPhone: '',
        fatherPhone: '',
        address: '',
        photo: '',
        school: fixedSchool ? fixedSchool.id : '',
        schoolCode: fixedSchool ? fixedSchool.code : ''
    });
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [previewImage, setPreviewImage] = useState('');

    useEffect(() => {
        // Load schools
        const loadSchools = async () => {
            try {
                const response = await schoolAPI.getSchools({ status: 'active' });
                setSchools(response.data.data);

                // If adding new student and there's only one school, select it automatically
                if (!student && response.data.data.length === 1) {
                    const defaultSchool = response.data.data[0];
                    setFormData(prev => ({
                        ...prev,
                        school: defaultSchool._id,
                        schoolCode: defaultSchool.code
                    }));
                }
            } catch (error) {
                console.error('Error loading schools:', error);
            }
        };

        loadSchools();

        if (student) {
            setFormData({
                name: student.name || '',
                rollNumber: student.rollNumber || '',
                class: student.class || '',
                bloodGroup: student.bloodGroup || '',
                motherName: student.motherName || '',
                fatherName: student.fatherName || '',
                motherPhone: student.motherPhone || '',
                fatherPhone: student.fatherPhone || '',
                address: student.address || '',
                photo: student.photo || '',
                school: student.school?._id || student.school || '',
                schoolCode: student.schoolCode || ''
            });
            if (student.photo) {
                setPreviewImage(student.photo);
            }
        }
    }, [student]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError('Image size should be less than 2MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                setFormData(prev => ({ ...prev, photo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = () => {
        setPreviewImage('');
        setFormData(prev => ({ ...prev, photo: '' }));
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.school || !formData.schoolCode) {
            setError('Please select a school');
            return;
        }

        if (!formData.name || !formData.rollNumber || !formData.class) {
            setError('Please fill in essential student details (Name, Roll, Class)');
            return;
        }

        try {
            setLoading(true);
            setError('');

            if (student) {
                await adminAPI.updateStudent(student.studentId, formData);
            } else {
                await adminAPI.addStudent(formData);
            }

            onClose(true); // Refresh dashboard
        } catch (error) {
            console.error('Error saving student:', error);
            setError(error.response?.data?.message || 'Error saving student information');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={() => onClose(false)}>
            <div className="modal-content-premium" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-premium">
                    <h2 className="modal-title">
                        {student ? 'Edit Student Profile' : 'Student Registration'}
                    </h2>
                    <button type="button" onClick={() => onClose()} className="free-close-btn" title="Close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body-premium">
                    {error && (
                        <div className="alert-premium">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="photo-upload-top-section">
                        <div className="centered-photo-group">
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden-file-input"
                            />
                            <div className="photo-upload-zone" onClick={() => fileInputRef.current.click()}>
                                {previewImage ? (
                                    <div className="photo-preview-container">
                                        <img src={previewImage} alt="Preview" className="photo-preview-box" />
                                        <div className="photo-overlay">
                                            <div className="photo-overlay-content">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                                                <span>Change</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removePhoto();
                                                }}
                                                className="remove-photo-btn"
                                                title="Remove Photo"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="photo-upload-placeholder">
                                        <div className="placeholder-icon-circle">
                                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                                        </div>
                                        <span>Add Photo</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* School Selector (only if not fixed) */}
                    {!fixedSchool && (
                        <div className="premium-input-group">
                            <span className="premium-label">Target School</span>
                            <select
                                id="school"
                                name="school"
                                value={formData.school}
                                onChange={(e) => {
                                    const selectedSchool = schools.find(s => s._id === e.target.value);
                                    setFormData({
                                        ...formData,
                                        school: e.target.value,
                                        schoolCode: selectedSchool?.code || ''
                                    });
                                    setError('');
                                }}
                                className="premium-input"
                                disabled={loading || !!student}
                                required
                            >
                                <option value="">Select School</option>
                                {schools.map(school => (
                                    <option key={school._id} value={school._id}>
                                        {school.name} ({school.code})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="premium-form-grid">
                        <div className="premium-input-group full-width">
                            <span className="premium-label">Student Full Name</span>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="premium-input"
                                placeholder="Student's complete name"
                                required
                            />
                        </div>

                        <div className="premium-input-group">
                            <span className="premium-label">Class / Grade</span>
                            <input
                                type="text"
                                name="class"
                                value={formData.class}
                                onChange={handleChange}
                                className="premium-input"
                                placeholder="e.g. 10th Class"
                                required
                            />
                        </div>

                        <div className="premium-input-group">
                            <span className="premium-label">Blood Group</span>
                            <input
                                type="text"
                                name="bloodGroup"
                                value={formData.bloodGroup}
                                onChange={handleChange}
                                className="premium-input"
                                placeholder="e.g. O+ve"
                            />
                        </div>

                        <div className="premium-input-group full-width">
                            <span className="premium-label">Roll Number</span>
                            <input
                                type="text"
                                name="rollNumber"
                                value={formData.rollNumber}
                                onChange={handleChange}
                                className="premium-input"
                                placeholder="e.g. 2024-001"
                                required
                            />
                        </div>

                        <div className="premium-input-group">
                            <span className="premium-label">Mother's Name</span>
                            <input
                                type="text"
                                name="motherName"
                                value={formData.motherName}
                                onChange={handleChange}
                                className="premium-input"
                                placeholder="Mother's name"
                            />
                        </div>

                        <div className="premium-input-group">
                            <span className="premium-label">Father's Name</span>
                            <input
                                type="text"
                                name="fatherName"
                                value={formData.fatherName}
                                onChange={handleChange}
                                className="premium-input"
                                placeholder="Father's name"
                            />
                        </div>

                        <div className="premium-input-group">
                            <span className="premium-label">Mother's Mobile</span>
                            <input
                                type="tel"
                                name="motherPhone"
                                value={formData.motherPhone}
                                onChange={handleChange}
                                className="premium-input"
                                placeholder="Mother's contact number"
                            />
                        </div>

                        <div className="premium-input-group">
                            <span className="premium-label">Father's Mobile</span>
                            <input
                                type="tel"
                                name="fatherPhone"
                                value={formData.fatherPhone}
                                onChange={handleChange}
                                className="premium-input"
                                placeholder="Father's contact number"
                            />
                        </div>

                        <div className="premium-input-group full-width">
                            <span className="premium-label">Student Address</span>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="premium-input"
                                placeholder="Residential address"
                                rows="2"
                            ></textarea>
                        </div>
                    </div>

                    {/* Default School Info Section */}
                    {fixedSchool && (
                        <div className="school-default-section">
                            <span className="section-divider-label">Institutional Details (Automated)</span>
                            <div className="school-info-compact">
                                <div className="info-pill">
                                    <span className="pill-label">School:</span>
                                    <span className="pill-value">{fixedSchool.name}</span>
                                </div>
                                <div className="info-pill">
                                    <span className="pill-label">Reg No / Code:</span>
                                    <span className="pill-value">{fixedSchool.code}</span>
                                </div>
                                <div className="info-pill">
                                    <span className="pill-label">Contact:</span>
                                    <span className="pill-value">{fixedSchool.phone}</span>
                                </div>
                                <div className="info-pill full-row">
                                    <span className="pill-label">Address:</span>
                                    <span className="pill-value">{fixedSchool.address}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="modal-actions-premium">
                        <button
                            type="button"
                            onClick={() => onClose(false)}
                            className="modal-btn-secondary"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="modal-btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="loading-state">
                                    <div className="spinner-mini"></div>
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                student ? 'Save Changes' : 'Register Student'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentFormModal;
