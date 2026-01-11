import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { toast } from 'sonner';
import './ContactUs.css';

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success("Message sent successfully! We'll get back to you soon.");
        setFormData({ name: '', email: '', subject: '', message: '' });
        setIsSubmitting(false);
    };

    return (
        <div className="contact-container">
            <div className="contact-header">
                <h1>Get in Touch</h1>
                <p>Have questions or feedback? We'd love to hear from you.</p>
            </div>

            <div className="contact-grid">
                <div className="contact-info">
                    <div className="info-item">
                        <div className="info-icon">
                            <Mail size={20} />
                        </div>
                        <div className="info-content">
                            <h3>Email</h3>
                            {/* <p>support@wishlistapp.com</p> */}
                        </div>
                    </div>

                    <div className="info-item">
                        <div className="info-icon">
                            <Phone size={20} />
                        </div>
                        <div className="info-content">
                            <h3>Phone</h3>
                            {/* <p>+1 (555) 123-4567</p> */}
                        </div>
                    </div>

                    <div className="info-item">
                        <div className="info-icon">
                            <MapPin size={20} />
                        </div>
                        <div className="info-content">
                            <h3>Office</h3>
                            {/* <p>123 Innovation Drive<br />San Francisco, CA 94103</p> */}
                        </div>
                    </div>
                </div>

                <form className="contact-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="subject">Subject</label>
                        <input
                            type="text"
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="How can we help?"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="message">Message</label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Your message here..."
                            required
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary submit-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Sending...' : (
                            <>
                                <Send size={18} />
                                Send Message
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ContactUs;
