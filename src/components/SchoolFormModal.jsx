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
            <div className="modal-content-premium school-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header-premium">
                    <h2 className="modal-title">{school ? 'School Settings' : 'Add New Institution'}</h2>
                    <button type="button" onClick={handleClose} className="free-close-btn" title="Close">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body-premium">
                    <div className="premium-input-group">
                        <span className="premium-label">School Name</span>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`premium-input ${errors.name ? 'error' : ''}`}
                            placeholder="e.g. SV Model High School"
                        />
                        {errors.name && <span className="alert-premium-mini">{errors.name}</span>}
                    </div>

                    <div className="premium-input-group">
                        <span className="premium-label">Address / Location</span>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows="2"
                            className="premium-input"
                            placeholder="Full physical address"
                        ></textarea>
                    </div>

                    <div className="premium-form-grid">
                        <div className="premium-input-group">
                            <span className="premium-label">Contact Phone</span>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="premium-input"
                                placeholder="+91 XXXXXXXXXX"
                            />
                        </div>

                        <div className="premium-input-group">
                            <span className="premium-label">Email Address</span>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="premium-input"
                                placeholder="school@example.com"
                            />
                        </div>
                    </div>

                    <div className="premium-input-group">
                        <span className="premium-label">Principal / Headmaster</span>
                        <input
                            type="text"
                            name="principalName"
                            value={formData.principalName}
                            onChange={handleChange}
                            className="premium-input"
                            placeholder="Principal's full name"
                        />
                    </div>

                    <div className="modal-actions-premium">
                        <button type="button" onClick={handleClose} className="modal-btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="modal-btn-primary">
                            <span>{school ? 'Save Changes' : 'Register School'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SchoolFormModal;
