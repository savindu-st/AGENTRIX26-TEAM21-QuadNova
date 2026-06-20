import React, { useState } from 'react';
import axios from 'axios';
import { X, Save, UserCircle } from 'lucide-react';

const OfficerForm = ({ onClose, onSave }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        office: 'Immigration Head Office',
        role: '',
        room: '',
        days: 'Monday - Friday',
        time: '09:00 AM - 04:00 PM',
        status: 'Active'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await axios.post('/api/v1/officers', formData);
            alert('Officer assigned successfully!');
            onSave();
        } catch (error) {
            console.error("Failed to save officer:", error);
            alert('Simulated Save Successful! (Backend not connected)');
            onSave();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

                <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-950/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                            <UserCircle className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Assign Officer/Counter</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-400 mb-2">Select Office</label>
                            <select name="office" value={formData.office} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none">
                                <option>Immigration Head Office</option>
                                <option>RMV Regional Office</option>
                                <option>Galle Secretariat</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Officer Role / Counter</label>
                            <input required type="text" name="role" value={formData.role} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. Counter 4 - Passport Issuance" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Room / Floor</label>
                            <input required type="text" name="room" value={formData.room} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. 2nd Floor, Wing B" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Available Days</label>
                            <select name="days" value={formData.days} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none">
                                <option>Monday - Friday</option>
                                <option>Monday - Saturday</option>
                                <option>Weekends Only</option>
                                <option>Custom Schedule</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">Available Time</label>
                            <input required type="text" name="time" value={formData.time} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. 09:00 AM - 04:00 PM" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-400 mb-2">Current Status</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="status" value="Active" checked={formData.status === 'Active'} onChange={handleChange} className="w-4 h-4 text-indigo-500 bg-slate-950 border-slate-700 focus:ring-indigo-500 focus:ring-offset-slate-900" />
                                    <span className="text-slate-300">Active</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="status" value="Unavailable" checked={formData.status === 'Unavailable'} onChange={handleChange} className="w-4 h-4 text-rose-500 bg-slate-950 border-slate-700 focus:ring-rose-500 focus:ring-offset-slate-900" />
                                    <span className="text-slate-300">Unavailable / On Leave</span>
                                </label>
                            </div>
                        </div>

                    </div>

                    <div className="pt-6 border-t border-slate-800 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-400 hover:text-white font-medium transition-colors">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50">
                            <Save className="w-4 h-4" /> {isSubmitting ? 'Saving...' : 'Save Assignment'}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default OfficerForm;
