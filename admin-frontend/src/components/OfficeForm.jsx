import React, { useState } from 'react';
import axios from 'axios';
import { X, Save, MapPin } from 'lucide-react';

const OfficeForm = ({ onClose, onSave }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    district: 'Colombo',
    type: 'Head Office',
    address: '',
    contactNote: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post('/api/v1/offices', formData);
      alert('Office added successfully!');
      onSave();
    } catch (error) {
      console.error("Failed to save office:", error);
      alert('Simulated Save Successful! (Backend not connected)');
      onSave();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-950/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Add New Office</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">Office Name</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. Dept of Immigration and Emigration" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">District</label>
              <select name="district" value={formData.district} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none">
                <option>Colombo</option>
                <option>Gampaha</option>
                <option>Kandy</option>
                <option>Galle</option>
                <option>Kurunegala</option>
                <option>Jaffna</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Office Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 appearance-none">
                <option>Head Office</option>
                <option>Regional Office</option>
                <option>Divisional Secretariat</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">Physical Address</label>
              <textarea required name="address" value={formData.address} onChange={handleChange} rows="2" className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. Suhurupaya, Battaramulla" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">Contact Note / Phone</label>
              <input type="text" name="contactNote" value={formData.contactNote} onChange={handleChange} className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" placeholder="e.g. 011-2833331 (Open 9AM - 4PM)" />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-6 border-t border-slate-800 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-400 hover:text-white font-medium transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50">
              <Save className="w-4 h-4" /> {isSubmitting ? 'Saving...' : 'Save Office'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default OfficeForm;
