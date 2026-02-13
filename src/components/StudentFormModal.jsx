import React, { useState, useEffect } from 'react';
import { adminAPI, schoolAPI } from '../services/api';
import './StudentFormModal.css';

const StudentFormModal = ({ student, onClose, fixedSchool = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        rollNumber: '',
        class: '',
        photo: '',
        parentName: '',
        parentPhone: '',
        emergencyContact: '',
        school: fixedSchool ? fixedSchool.id : '',
        schoolCode: fixedSchool ? fixedSchool.code : ''
    });
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
                photo: student.photo || '',
                parentName: student.parentName || '',
                parentPhone: student.parentPhone || '',
                emergencyContact: student.emergencyContact || '',
                school: student.school?._id || student.school || '',
                schoolCode: student.schoolCode || ''
            });
        }
    }, [student]);

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

        if (!formData.name || !formData.rollNumber || !formData.class ||
            !formData.parentName || !formData.parentPhone || !formData.emergencyContact) {
            setError('Please fill in all required fields');
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
        } catch (err) {
            console.error('Error saving student:', err);

            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data?.errors) {
                setError(err.response.data.errors.join(', '));
            } else {
                setError('Failed to save student. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={() => onClose(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {student ? 'Edit Student' : 'Add New Student'}
                    </h2>
                    <button onClick={() => onClose(false)} className="modal-close">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body">
                    {error && (
                        <div className="alert alert-error">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {/* School Selector */}
                    {!fixedSchool && (
                        <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                            <label htmlFor="school" className="input-label">
                                School <span className="required">*</span>
                            </label>
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
                                className="input-field"
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
                            {formData.schoolCode && (
                                <small style={{ display: 'block', marginTop: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                    📝 Student IDs will be: <strong>{formData.schoolCode}-01</strong>, <strong>{formData.schoolCode}-02</strong>, etc.
                                </small>
                            )}
                        </div>
                    )}

                    <div className="form-row">
                        <div className="input-group">
                            <label htmlFor="name" className="input-label">
                                Student Name <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Enter student name"
                                disabled={loading}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="rollNumber" className="input-label">
                                Roll Number <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="rollNumber"
                                name="rollNumber"
                                value={formData.rollNumber}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="e.g., 20240001"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label htmlFor="class" className="input-label">
                                Class <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="class"
                                name="class"
                                value={formData.class}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="e.g., 10-A"
                                disabled={loading}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="photo" className="input-label">
                                Photo URL
                            </label>
                            <input
                                type="url"
                                id="photo"
                                name="photo"
                                value={formData.photo}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="https://example.com/photo.jpg"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label htmlFor="parentName" className="input-label">
                            Parent Name <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="parentName"
                            name="parentName"
                            value={formData.parentName}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Enter parent name"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label htmlFor="parentPhone" className="input-label">
                                Parent Phone <span className="required">*</span>
                            </label>
                            <input
                                type="tel"
                                id="parentPhone"
                                name="parentPhone"
                                value={formData.parentPhone}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="+91 1234567890"
                                disabled={loading}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="emergencyContact" className="input-label">
                                Emergency Contact <span className="required">*</span>
                            </label>
                            <input
                                type="tel"
                                id="emergencyContact"
                                name="emergencyContact"
                                value={formData.emergencyContact}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="+91 9876543210"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            onClick={() => onClose(false)}
                            className="btn btn-secondary"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Saving...
                                </>
                            ) : (
                                student ? 'Update Student' : 'Add Student'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentFormModal;
