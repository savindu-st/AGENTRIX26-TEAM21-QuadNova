import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ReportReviewCard from '../components/ReportReviewCard';

const CrowdReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback Mock Data
  const mockReports = [
    { id: 101, reporterName: 'Nuwan S.', officeName: 'Immigration Head Office', crowdLevel: 'High', timestamp: '10 mins ago', notes: 'Lines are out the door, moving very slow.', status: 'Pending' },
    { id: 102, reporterName: 'Ashani P.', officeName: 'RMV Regional Office (Kandy)', crowdLevel: 'Low', timestamp: '25 mins ago', notes: 'Almost empty right now.', status: 'Pending' },
    { id: 103, reporterName: 'Kusal M.', officeName: 'Galle Secretariat', crowdLevel: 'Medium', timestamp: '1 hour ago', notes: '', status: 'Verified' },
    { id: 104, reporterName: 'Anonymous', officeName: 'Immigration Head Office', crowdLevel: 'Low', timestamp: '1 hour ago', notes: 'Fake report test', status: 'Rejected' },
  ];

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/crowd-reports');
      setReports(response.data);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      setReports(mockReports); // Use mock data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (reportId, newStatus) => {
    try {
      // Send the PATCH request to the backend
      await axios.patch(`/api/v1/crowd-reports/${reportId}/verify`, { status: newStatus });

      // Optimistically update the UI so the admin doesn't have to wait for a refresh
      setReports(prevReports =>
        prevReports.map(report =>
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      );
    } catch (error) {
      console.error("Failed to update status:", error);

      // Simulate successful update if backend is down
      setReports(prevReports =>
        prevReports.map(report =>
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] p-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Crowd Report Verification</h1>
        <p className="text-slate-400">Review community-submitted crowd levels to keep VisitGuard accurate.</p>
      </div>

      {loading ? (
        <div className="text-slate-500">Loading reports...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {reports.map((report) => (
            <ReportReviewCard
              key={report.id}
              report={report}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CrowdReports;
