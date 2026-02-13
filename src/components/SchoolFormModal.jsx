import React, { useState } from 'react';
import './SchoolFormModal.css';

const SchoolFormModal = ({ show, onClose, onSubmit, school = null }) => {
    const [formData, setFormData] = useState({
        name: school?.name || '',
        address: school?.address || '',
        phone: school?.phone || '',
        email: school?.email || '',
        principalName: school?.principalName || ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'School name is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        onSubmit(formData);
    };

    const handleClose = () => {
        setFormData({
            name: '',
            address: '',
            phone: '',
            email: '',
            principalName: ''
        });
        setErrors({});
        onClose();
    };

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content school-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{school ? 'Edit School' : 'Create New School'}</h2>
                    <button onClick={handleClose} className="modal-close">&times;</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="input-group">
                            <label className="input-label" htmlFor="name">
                                🏫 School Name <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`input-field ${errors.name ? 'error' : ''}`}
                                placeholder="e.g., SV Model High School"
                            />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                            <small className="form-help">
                                ✨ School code will be auto-generated (e.g., "SL1")
                            </small>
                        </div>

                        <div className="input-group">
                            <label className="input-label" htmlFor="address">
                                📍 Address
                            </label>
                            <textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="2"
                                className="input-field"
                                placeholder="Full address of the school"
                            ></textarea>
                        </div>

                        <div className="form-row">
                            <div className="input-group">
                                <label className="input-label" htmlFor="phone">
                                    📞 Phone
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="+91 XXXXXXXXXX"
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label" htmlFor="email">
                                    📧 Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="school@example.com"
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label" htmlFor="principalName">
                                👤 Principal Name
                            </label>
                            <input
                                type="text"
                                id="principalName"
                                name="principalName"
                                value={formData.principalName}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Principal's full name"
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={handleClose} className="btn btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {school ? 'Update School' : '✨ Create School'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SchoolFormModal;
