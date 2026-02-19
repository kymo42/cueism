'use client';

import { useState } from 'react';
import type { Metadata } from 'next';



export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        // For now, just simulate sending. In production, connect to an email service
        // or use a serverless function.
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setStatus('sent');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch {
            setStatus('error');
        }
    };

    return (
        <>
            <div className="page-header">
                <h1>Contact</h1>
                <p>Got a question, custom order request, or just want to chat about billiards? Get in touch.</p>
            </div>
            <div style={{ textAlign: 'center', fontSize: '2rem', color: 'red', padding: '20px', fontWeight: 'bold' }}>UPDATED</div>

            <div className="contact-grid">
                <div>
                    {status === 'sent' ? (
                        <div style={{ padding: 'var(--space-2xl)', textAlign: 'center' }}>
                            <h2 style={{ color: 'var(--color-success)', marginTop: 0 }}>Message Sent!</h2>
                            <p>Thanks for reaching out. We&apos;ll get back to you soon.</p>
                            <button
                                className="btn btn--outline"
                                onClick={() => setStatus('idle')}
                            >
                                Send Another Message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name">Name</label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="subject">Subject</label>
                                <input
                                    id="subject"
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">Message</label>
                                <textarea
                                    id="message"
                                    rows={6}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn--primary btn--lg"
                                disabled={status === 'sending'}
                            >
                                {status === 'sending' ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    )}
                </div>

                <div>
                    <div style={{ padding: 'var(--space-xl)', background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border-light)' }}>
                        <h3 style={{ marginBottom: 'var(--space-lg)' }}>Other Ways to Reach Us</h3>

                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                            <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-accent)', marginBottom: 'var(--space-xs)' }}>Instagram</h4>
                            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
                                @cueism
                            </a>
                        </div>

                        <div style={{ marginBottom: 'var(--space-lg)' }}>
                            <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-accent)', marginBottom: 'var(--space-xs)' }}>Location</h4>
                            <p style={{ margin: 0 }}>Melbourne, Australia</p>
                        </div>

                        <div>
                            <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--color-accent)', marginBottom: 'var(--space-xs)' }}>Response Time</h4>
                            <p style={{ margin: 0 }}>We typically respond within 24-48 hours.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
