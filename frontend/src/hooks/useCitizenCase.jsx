import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const CitizenCaseContext = createContext(null);

export function CitizenCaseProvider({ children }) {
  const [caseId, setCaseId] = useState(() => localStorage.getItem('praja_case_id') || null);
  const [citizenData, setCitizenData] = useState(() => {
    const saved = localStorage.getItem('praja_citizen_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [status, setStatus] = useState(() => localStorage.getItem('praja_case_status') || 'idle');
  const [questions, setQuestions] = useState(() => {
    const saved = localStorage.getItem('praja_questions');
    return saved ? JSON.parse(saved) : [];
  });
  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem('praja_documents');
    return saved ? JSON.parse(saved) : [];
  });
  const [visitPlan, setVisitPlan] = useState(() => {
    const saved = localStorage.getItem('praja_visit_plan');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    if (caseId) localStorage.setItem('praja_case_id', caseId);
    else localStorage.removeItem('praja_case_id');
  }, [caseId]);

  useEffect(() => {
    if (citizenData) localStorage.setItem('praja_citizen_data', JSON.stringify(citizenData));
    else localStorage.removeItem('praja_citizen_data');
  }, [citizenData]);

  useEffect(() => {
    localStorage.setItem('praja_case_status', status);
  }, [status]);

  useEffect(() => {
    localStorage.setItem('praja_questions', JSON.stringify(questions));
  }, [questions]);

  useEffect(() => {
    localStorage.setItem('praja_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    if (visitPlan) localStorage.setItem('praja_visit_plan', JSON.stringify(visitPlan));
    else localStorage.removeItem('praja_visit_plan');
  }, [visitPlan]);

  // Actions
  const createCase = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/v1/cases', formData);
      const data = response.data;
      setCaseId(data.caseId);
      setCitizenData(data.citizenData);
      setStatus(data.status);
      setQuestions(data.questions || []);
      setDocuments(data.documents || []);
      setVisitPlan(data.visitPlan || null);
      
      // Auto-trigger analyze to determine next step
      await analyzeCase(data.caseId);
    } catch (err) {
      console.error('Error creating case:', err);
      setError('Failed to submit citizen request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const analyzeCase = async (id = caseId) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/v1/ai/analyze', { case_id: id });
      const data = response.data;
      setStatus(data.status);
      setQuestions(data.questions || []);
      setDocuments(data.documents || []);
      setVisitPlan(data.visitPlan || null);
    } catch (err) {
      console.error('Error analyzing case:', err);
      setError('AI Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitAnswers = async (answersObj) => {
    if (!caseId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/v1/cases/answer', {
        caseId,
        answers: answersObj,
      });
      const data = response.data;
      setStatus(data.status);
      setQuestions(data.questions || []);
      setDocuments(data.documents || []);
      setVisitPlan(data.visitPlan || null);
    } catch (err) {
      console.error('Error submitting answers:', err);
      setError('Failed to submit answers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file) => {
    if (!caseId) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Use cases/upload mock URL
      await api.post(`/api/v1/cases/${caseId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // After successful upload, refresh the case state (which triggers AI analysis)
      await analyzeCase(caseId);
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitCrowdReport = async (reportData) => {
    setError(null);
    try {
      await api.post('/api/v1/crowd-reports', reportData);
      return true;
    } catch (err) {
      console.error('Error submitting crowd report:', err);
      setError('Failed to submit feedback report. Please try again.');
      return false;
    }
  };

  const resetCase = () => {
    setCaseId(null);
    setCitizenData(null);
    setStatus('idle');
    setQuestions([]);
    setDocuments([]);
    setVisitPlan(null);
    setError(null);
    localStorage.removeItem('praja_case_id');
    localStorage.removeItem('praja_citizen_data');
    localStorage.removeItem('praja_case_status');
    localStorage.removeItem('praja_questions');
    localStorage.removeItem('praja_documents');
    localStorage.removeItem('praja_visit_plan');
  };

  return (
    <CitizenCaseContext.Provider
      value={{
        caseId,
        citizenData,
        status,
        questions,
        documents,
        visitPlan,
        loading,
        error,
        createCase,
        analyzeCase,
        submitAnswers,
        uploadFile,
        submitCrowdReport,
        resetCase,
      }}
    >
      {children}
    </CitizenCaseContext.Provider>
  );
}

export function useCitizenCase() {
  const context = useContext(CitizenCaseContext);
  if (!context) {
    throw new Error('useCitizenCase must be used within a CitizenCaseProvider');
  }
  return context;
}
