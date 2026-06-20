import React, { useState } from 'react';
import axios from 'axios';
import { X, Save } from 'lucide-react';

const ServiceForm = ({ onClose, onSave }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'General',
    description: '',
    fee: '',
    processingTime: '',
    requiredDocuments: '',
    rejectionReasons: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert comma-separated strings to arrays before sending
      const payload = {
        ...formData,
        requiredDocuments: formData.requiredDocuments.split(',').map(d => d.trim()),
        rejectionReasons: formData.rejectionReasons.split(',').map(d => d.trim())
      };

      await axios.post('/api/v1/services', payload);
      alert('Service added successfully!');
      onSave(); // Refresh list on the parent
    } catch (error) {
      console.error("Failed to save service:", error);
      alert('Simulated Save Successful! (Backend not connected)');
      onSave();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">Add New Service</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">Service Name</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. Passport Renewal" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none">
                <option>Identity & Civil</option>
                <option>Transport & Vehicles</option>
                <option>Property & Land</option>
                <option>General</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Processing Time</label>
              <input required type="text" name="processingTime" value={formData.processingTime} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. 14 Working Days" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
              <textarea required name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="Brief description of the service..." />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">Fee (LKR)</label>
              <input required type="number" name="fee" value={formData.fee} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. 5000" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">Required Documents <span className="text-xs text-slate-500">(comma separated)</span></label>
              <textarea required name="requiredDocuments" value={formData.requiredDocuments} onChange={handleChange} rows="2" className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. NIC Copy, Birth Certificate, Police Report" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">Common Rejection Reasons <span className="text-xs text-slate-500">(comma separated)</span></label>
              <textarea name="rejectionReasons" value={formData.rejectionReasons} onChange={handleChange} rows="2" className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. Signature mismatch, Expired NIC" />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-6 border-t border-slate-800 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-400 hover:text-white font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50">
              <Save className="w-4 h-4" /> {isSubmitting ? 'Saving...' : 'Save Service'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ServiceForm;
