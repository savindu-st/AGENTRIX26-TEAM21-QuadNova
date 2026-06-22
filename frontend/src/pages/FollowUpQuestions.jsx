import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCitizenCase } from '../hooks/useCitizenCase';
import FollowUpCard from '../components/FollowUpCard';
import { HelpCircle, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function FollowUpQuestions() {
  const { questions, submitAnswers, loading, error, caseId } = useCitizenCase();
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  // Redirect if no case active
  useEffect(() => {
    if (!caseId) {
      navigate('/request');
    }
  }, [caseId, navigate]);

  const handleAnswerChange = (qId, val) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: val,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that all questions are answered
    const unanswered = questions.filter((q) => answers[q.id] === undefined || answers[q.id] === null || answers[q.id] === '');
    if (unanswered.length > 0) {
      alert('Please answer all clarification questions before continuing.');
      return;
    }

    try {
      await submitAnswers(answers);
      
      // Post-answer, case status changes to 'upload'
      setTimeout(() => {
        const nextStatus = localStorage.getItem('praja_case_status') || 'upload';
        if (nextStatus === 'upload') {
          navigate('/upload');
        } else if (nextStatus === 'plan') {
          navigate('/plan');
        }
      }, 800);
    } catch (err) {
      console.error(err);
    }
  };

  // If questions are empty, provide a default list to ensure the user gets a working experience
  const displayQuestions = questions.length > 0 ? questions : [
    {
      id: 'q1',
      text: 'Which district was your land deed / birth certificate issued in?',
      options: ['Colombo', 'Gampaha', 'Kandy', 'Galle', 'Jaffna', 'Kurunegala', 'Other'],
      type: 'select',
    },
    {
      id: 'q2',
      text: 'Do you have the original Land Deed document signed by a licensed notary?',
      options: ['Yes', 'No'],
      type: 'radio',
    },
    {
      id: 'q3',
      text: 'Do you have a recent verification letter from the Grama Niladhari (GN)?',
      options: ['Yes', 'No, but I can obtain one', 'No, and it is not required'],
      type: 'radio',
    },
    {
      id: 'q4',
      text: 'Is the tree to be cut within 10 meters of a permanent building or main power lines?',
      options: ['Yes', 'No'],
      type: 'radio',
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="text-center md:text-left space-y-2">
          <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-700 font-bold text-sm">
            <HelpCircle className="h-4.5 w-4.5" />
            <span>Step 2 of 5: Clarification</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            AI Clarification Portal
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed font-medium">
            Our AI engine requires a few quick clarifications to refine your visit strategy and calculate the VisitGuard readiness score.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        {/* Question Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            {displayQuestions.map((q) => (
              <FollowUpCard
                key={q.id}
                question={q}
                value={answers[q.id]}
                onChange={handleAnswerChange}
              />
            ))}
          </div>

          {/* Form Actions */}
          <div className="pt-6 flex justify-between items-center bg-gray-50 p-4 border border-gray-150 rounded-xl">
            <span className="text-xs text-gray-500 font-bold uppercase">
              All questions must be answered
            </span>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl shadow-sm hover:shadow hover:scale-[1.01] transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Saving Answers...
                </>
              ) : (
                <>
                  Next: Document Verification
                  <ArrowRight className="h-4.5 w-4.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
