import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock database in localStorage for standalone/mock fallback capability
const getMockDb = () => {
  const db = localStorage.getItem('praja_navigator_mock_db');
  if (!db) {
    const initialDb = { cases: {}, reports: [] };
    localStorage.setItem('praja_navigator_mock_db', JSON.stringify(initialDb));
    return initialDb;
  }
  return JSON.parse(db);
};

const saveMockDb = (db) => {
  localStorage.setItem('praja_navigator_mock_db', JSON.stringify(db));
};

// Intercept requests to mock them if the backend is down or not implemented yet
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If connection refused or 404 (not implemented) or other server error, fallback to mock
    const { config, response } = error;
    
    // Check if it's our API request
    if (config && (error.code === 'ERR_NETWORK' || !response || response.status === 404 || response.status === 500)) {
      console.warn(`API unavailable (${config.method.toUpperCase()} ${config.url}). Falling back to simulation mode.`);
      return handleMockRequest(config);
    }
    
    return Promise.reject(error);
  }
);

// High-fidelity Mock Request Handler
const handleMockRequest = async (config) => {
  // Simulate network latency (200ms - 600ms)
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 400 + 200));

  const url = config.url || '';
  const method = config.method || 'get';
  const db = getMockDb();

  // 1. POST /api/v1/cases
  if (url.includes('/api/v1/cases') && method === 'post') {
    const body = JSON.parse(config.data);
    const caseId = 'case_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    const newCase = {
      caseId,
      citizenData: body,
      status: 'clarification',
      questions: [
        {
          id: 'q1',
          text: 'Which district was your land deed / birth certificate issued in?',
          options: ['Colombo', 'Gampaha', 'Kandy', 'Galle', 'Jaffna', 'Kurunegala', 'Other'],
          type: 'select',
          answered: false,
          answer: null
        },
        {
          id: 'q2',
          text: 'Do you have the original Land Deed document signed by a licensed notary?',
          options: ['Yes', 'No'],
          type: 'radio',
          answered: false,
          answer: null
        },
        {
          id: 'q3',
          text: 'Do you have a recent verification letter from the Grama Niladhari (GN)?',
          options: ['Yes', 'No, but I can obtain one', 'No, and it is not required'],
          type: 'radio',
          answered: false,
          answer: null
        },
        {
          id: 'q4',
          text: 'Is the tree to be cut within 10 meters of a permanent building or main power lines?',
          options: ['Yes', 'No'],
          type: 'radio',
          answered: false,
          answer: null
        }
      ],
      documents: [],
      visitPlan: null
    };

    db.cases[caseId] = newCase;
    saveMockDb(db);

    return { data: { caseId, ...newCase } };
  }

  // 2. POST /api/v1/ai/analyze
  if (url.includes('/api/v1/ai/analyze') && method === 'post') {
    const body = JSON.parse(config.data);
    const caseId = body.case_id || body.caseId;
    const currentCase = db.cases[caseId];

    if (!currentCase) {
      return { status: 404, data: { message: 'Case not found' } };
    }

    // Determine the next state based on inputs
    const unanswered = currentCase.questions.filter(q => !q.answered);

    if (unanswered.length > 0) {
      currentCase.status = 'clarification';
      db.cases[caseId] = currentCase;
      saveMockDb(db);
      return { data: currentCase };
    }

    // If follow-ups are answered, determine document upload need
    const needsUpload = currentCase.documents.length === 0;
    if (needsUpload) {
      currentCase.status = 'upload';
      // Identify which documents we need depending on form selections
      const required = ['NIC Front & Back'];
      if (currentCase.citizenData.availableDocuments?.includes('Land Deed')) {
        required.push('Land Deed Copy');
      }
      if (currentCase.citizenData.availableDocuments?.includes('GN Letter')) {
        required.push('Grama Niladhari Letter');
      } else {
        required.push('GN Recommendation Request Form');
      }
      currentCase.requiredDocs = required;
      db.cases[caseId] = currentCase;
      saveMockDb(db);
      return { data: currentCase };
    }

    // Create the final visit plan
    currentCase.status = 'plan';
    
    // Calculate VisitGuard Score
    // Calculate score based on answers:
    // Land Deed Original (q2) = 'Yes' (increases score), Within 10m (q4) = 'No' (safer)
    const isDeedOriginal = currentCase.questions.find(q => q.id === 'q2')?.answer === 'Yes';
    const isGNLetterReady = currentCase.citizenData.availableDocuments?.includes('GN Letter') || 
                            currentCase.questions.find(q => q.id === 'q3')?.answer === 'Yes';
    const isCloseToBuilding = currentCase.questions.find(q => q.id === 'q4')?.answer === 'Yes';
    
    let score = 70;
    if (isDeedOriginal) score += 15;
    if (isGNLetterReady) score += 10;
    if (isCloseToBuilding) score -= 15; // higher risk
    
    // Bound score
    score = Math.max(15, Math.min(98, score));
    
    let riskLevel = 'Ready';
    if (score < 50) {
      riskLevel = 'High Risk';
    } else if (score < 80) {
      riskLevel = 'Moderate';
    }

    // Determine target officer info
    const district = currentCase.citizenData.district || 'Colombo';
    let officeName = `${district} Divisional Secretariat Office`;
    let roomCounter = 'Room 14, Counter 4';
    let officerName = 'Divisional Officer in Charge';
    let availableHours = '9:00 AM - 1:00 PM (Tuesdays and Wednesdays)';
    
    const districtLower = district.toLowerCase();
    if (districtLower.includes('matara')) {
      officeName = 'Matara Divisional Secretariat Office';
      roomCounter = 'Room 5, Main Hall';
      officerName = 'Mrs. S. Silva (Senior Executive Officer)';
      availableHours = '8:30 AM - 2:00 PM (Mondays and Thursdays)';
    } else if (districtLower.includes('kandy')) {
      officeName = 'Kandy Divisional Secretariat Office';
      roomCounter = 'Room 12, Floor 2';
      officerName = 'Mr. A. Bandara (Land Administration Officer)';
      availableHours = '9:00 AM - 3:00 PM (Wednesdays and Fridays)';
    } else if (districtLower.includes('colombo')) {
      officeName = 'Colombo Divisional Secretariat Office';
      roomCounter = 'Room 14, Environment & Land Branch (Counter 4)';
      officerName = 'Mr. K. A. Perera (Assistant Divisional Secretary)';
      availableHours = '9:00 AM - 1:00 PM (Tuesdays and Wednesdays)';
    }

    currentCase.visitPlan = {
      score,
      riskLevel,
      officeName,
      roomCounter,
      officerName,
      availableHours,
      timeline: [
        {
          step: 1,
          title: 'Reception Validation',
          description: 'Go to the Main Reception desk, present your VisitGuard Readiness QR Code to receive your token.',
          status: 'ready'
        },
        {
          step: 2,
          title: 'Document Inspection',
          description: `Submit your original National Identity Card and Land Deed at Room 14, Counter 4 to Officer ${isDeedOriginal ? 'Mr. Perera' : 'in charge'}.`,
          status: isDeedOriginal ? 'ready' : 'warning'
        },
        {
          step: 3,
          title: 'Submit GN Recommendation',
          description: isGNLetterReady 
            ? 'Hand over the verified Grama Niladhari letter signed by the Divisional GN officer.' 
            : 'Fill form 102-B for GN clearance since you do not have the certified GN letter yet.',
          status: isGNLetterReady ? 'ready' : 'warning'
        },
        {
          step: 4,
          title: 'Fee Payment & Scheduling',
          description: 'Pay the application processing fee of LKR 750.00 at Cashier Counter 2 and receive the inspection schedule slip.',
          status: 'pending'
        }
      ],
      checklist: {
        verified: [
          'National Identity Card (NIC) - OCR Verified',
          isDeedOriginal ? 'Original Land Deed - Checked' : null,
          isGNLetterReady ? 'Grama Niladhari Letter - Checked' : null
        ].filter(Boolean),
        missing: [
          !isDeedOriginal ? 'Notarized certified copy of Land Deed (required as original is missing)' : null,
          !isGNLetterReady ? 'Formal Request for GN field inspection letter' : null,
          'LKR 750.00 cash for processing fee (Cards not accepted at this counter)'
        ].filter(Boolean),
        talkingPoints: [
          'I wish to apply for a tree felling permit under the Felling of Trees Control Act for a Jak tree on my private property.',
          isDeedOriginal 
            ? 'I have brought the original Land Deed and the Grama Niladhari validation certificate.' 
            : 'I do not have the original Land Deed, but I have brought a certified notary copy and my utility bill as proof of address.',
          isCloseToBuilding 
            ? 'The tree is close to my house. I have photos showing that the roots are damaging the foundation.' 
            : 'The tree is in an open field, and it does not block public paths or power cables.'
        ]
      }
    };

    db.cases[caseId] = currentCase;
    saveMockDb(db);
    return { data: currentCase };
  }

  // 3. POST /api/v1/cases/answer (Submitting answers to follow-up questions)
  if (url.includes('/api/v1/cases/answer') || (url.includes('/answers') && method === 'post')) {
    const body = JSON.parse(config.data);
    const caseId = body.caseId || body.case_id;
    const { answers } = body;
    const currentCase = db.cases[caseId];

    if (!currentCase) {
      return { status: 404, data: { message: 'Case not found' } };
    }

    currentCase.questions = currentCase.questions.map(q => {
      if (answers[q.id] !== undefined) {
        return { ...q, answered: true, answer: answers[q.id] };
      }
      return q;
    });

    db.cases[caseId] = currentCase;
    saveMockDb(db);
    
    // Automatically trigger analysis
    return handleMockRequest({
      url: '/api/v1/ai/analyze',
      method: 'post',
      data: JSON.stringify({ case_id: caseId })
    });
  }

  // 4. POST /api/v1/documents or /api/v1/cases/{caseId}/upload
  if (url.includes('/api/v1/documents') || (url.includes('/upload') && method === 'post')) {
    // Determine case id from query or URL if possible. Fallback to last created case.
    const caseKeys = Object.keys(db.cases);
    const caseId = caseKeys[caseKeys.length - 1];
    
    if (!caseId) {
      return { status: 400, data: { message: 'No active case found' } };
    }

    const currentCase = db.cases[caseId];
    
    if (currentCase.documents && currentCase.documents.length >= 3) {
      return Promise.reject({
        response: {
          status: 400,
          data: { detail: 'Maximum of 3 documents can be uploaded for autofill' }
        }
      });
    }

    const fileName = config.data instanceof FormData ? (config.data.get('file')?.name || 'uploaded_document.pdf') : 'document.pdf';
    
    // Add uploaded files representation
    const newDoc = {
      name: fileName,
      status: 'success',
      url: '#'
    };

    // Simulate OCR Data Extraction
    const fileNameLower = fileName.toLowerCase();
    const ocrDetails = {
      fullName: currentCase.citizenData?.citizen_name || currentCase.citizenData?.fullName || "Pasindu Bandara",
      nicNumber: "199512345678",
      dob: "1995-05-12",
      gender: "Male",
      address: "No. 12, Flower Road, Colombo 03",
      district: currentCase.citizenData?.district || "Colombo",
      landDeedNo: null,
      landOwner: null
    };

    if (fileNameLower.includes("deed") || fileNameLower.includes("land")) {
      ocrDetails.landDeedNo = "LD-88421-2023";
      ocrDetails.landOwner = currentCase.citizenData?.citizen_name || currentCase.citizenData?.fullName || "Pasindu Bandara";
      ocrDetails.district = currentCase.citizenData?.district || "Colombo";
    }

    currentCase.citizenData = {
      ...currentCase.citizenData,
      fullName: currentCase.citizenData?.citizen_name || currentCase.citizenData?.fullName || "Pasindu Bandara",
      extractedDetails: {
        ...(currentCase.citizenData?.extractedDetails || {}),
        ...ocrDetails
      }
    };

    currentCase.documents.push(newDoc);
    db.cases[caseId] = currentCase;
    saveMockDb(db);

    return { data: { success: true, case: currentCase } };
  }

  // 4b. DELETE /api/v1/cases/{caseId}/document
  if (url.includes('/document') && method === 'delete') {
    let caseId = null;
    const match = url.match(/\/cases\/([^\/]+)\/document/);
    if (match) {
      caseId = match[1];
    } else {
      const caseKeys = Object.keys(db.cases);
      caseId = caseKeys[caseKeys.length - 1];
    }

    if (!caseId || !db.cases[caseId]) {
      return Promise.reject({
        response: {
          status: 404,
          data: { detail: 'Case not found' }
        }
      });
    }

    const currentCase = db.cases[caseId];
    
    // Extract filename from query parameters
    let filename = '';
    if (config.params && config.params.filename) {
      filename = config.params.filename;
    } else {
      const urlObj = new URL(url, 'http://localhost');
      filename = urlObj.searchParams.get('filename') || '';
    }

    if (!filename) {
      return Promise.reject({
        response: {
          status: 400,
          data: { detail: 'Filename parameter is required' }
        }
      });
    }

    const docs = currentCase.documents || [];
    const matchingDocs = docs.filter(d => d.name === filename);
    if (matchingDocs.length === 0) {
      return Promise.reject({
        response: {
          status: 404,
          data: { detail: `Document ${filename} not found` }
        }
      });
    }

    currentCase.documents = docs.filter(d => d.name !== filename);

    if (currentCase.documents.length === 0) {
      currentCase.status = 'upload';
    }

    db.cases[caseId] = currentCase;
    saveMockDb(db);

    return { data: { success: true, case: currentCase } };
  }

  // 5. POST /api/v1/crowd-reports
  if (url.includes('/api/v1/crowd-reports') && method === 'post') {
    return { status: 500, data: { message: 'Real backend unavailable for crowd reports.' } };
  }

  // 6. POST /api/v1/ai/chat
  if (url.includes('/api/v1/ai/chat') && method === 'post') {
    const body = JSON.parse(config.data);
    const { message } = body;
    const textLower = message.toLowerCase();
    let response = "We don't have enough information currently.";
    
    if (textLower.includes('nic') || textLower.includes('identity') || textLower.includes('renew')) {
      if (textLower.includes('fee') || textLower.includes('cost') || textLower.includes('lkr')) {
        response = "The normal fee for National Identity Card (NIC) renewal is LKR 500.";
      } else if (textLower.includes('photo') || textLower.includes('photograph')) {
        response = "For NIC renewal, you must submit 3 color photographs of size 1.3\" x 1.8\", certified on the reverse by the Grama Niladhari.";
      } else if (textLower.includes('document') || textLower.includes('bring')) {
        response = "To renew your NIC, you must bring the damaged/old NIC, standard Form M.T. 1, 3 color photographs, original birth certificate and a copy, and a marriage certificate if name has changed due to marriage.";
      } else {
        response = "NIC renewal requires a completed Application Form M.T. 1 certified by the Grama Niladhari, old NIC, original birth certificate + copy, and 3 certified color photographs. The official fee is LKR 500.";
      }
    } else if (textLower.includes('tree') || textLower.includes('felling') || textLower.includes('cut') || textLower.includes('jak')) {
      if (textLower.includes('fee') || textLower.includes('cost') || textLower.includes('lkr')) {
        response = "The official application processing fee for a tree felling permit is LKR 100.";
      } else if (textLower.includes('document') || textLower.includes('bring')) {
        response = "For a tree felling permit, you must submit the felling application form, original land deed and a certified copy, Grama Niladhari recommendation letter, and photographs showing the tree's position relative to roofs/buildings.";
      } else {
        response = "Under the Felling of Trees (Control) Act, felling Jak, Breadfruit, or Palmyra trees requires a permit. You must submit the application form, original land deed + certified copy, Grama Niladhari recommendation letter, and photographs. The official fee is LKR 100.";
      }
    } else if (textLower.includes('grama') || textLower.includes('niladhari') || textLower.includes('gn') || textLower.includes('division')) {
      response = "You can find your local Grama Niladhari Division name and number by checking the official division directory or asking the reception desk at the Divisional Secretariat.";
    } else if (textLower.includes('birth') && textLower.includes('certificate') && textLower.includes('correction')) {
      response = "Correcting a birth certificate requires Form Declaration 12, original birth certificate, and supporting documents (like parents' marriage certificate, NIC copies). Submit these at the Divisional Secretariat's Registrar branch. Fee is LKR 150 (normal) or LKR 500 (one-day).";
    } else if (textLower.includes('business') || textLower.includes('company') || textLower.includes('register')) {
      response = "For business registration of a sole proprietorship, you must submit a completed application form, NIC copy, and land deed / rent agreement for the location at the Divisional Secretariat. The registration fee is LKR 1,000.";
    } else if (textLower.includes('license') && (textLower.includes('driving') || textLower.includes('driver'))) {
      response = "For driving license renewal, bring a medical certificate (Form DL-M), old license, NIC copy, and LKR 1,500 renewal fee to the Department of Motor Traffic or district office.";
    } else if (textLower.includes('revenue') || (textLower.includes('license') && textLower.includes('vehicle'))) {
      response = "Vehicle revenue license renewal requires the green vehicle registration book (log book), valid insurance certificate, and eco-test (emission) certificate. The fee depends on the vehicle class.";
    } else if (textLower.includes('deed') && textLower.includes('transfer')) {
      response = "Land deed transfer requires a new deed drafted by a licensed notary, surveyor plan, original deed copy, and local Pradeshiya Sabha clearance. Register it at the Land Registry branch of the Divisional Secretariat. Stamp duty fees apply.";
    } else if (textLower.includes('elderly') || textLower.includes('assistance') || textLower.includes('monthly')) {
      response = "The monthly assistance program for elderly citizens requires standard Form 44-A, Grama Niladhari income verification, and NIC copy. Submit these to the Social Services branch (Counter 9).";
    } else if (textLower.includes('passport') || textLower.includes('travel')) {
      response = "Passport application requires standard Form K-35 A, original birth certificate + copy, NIC + copy, and 3 color photos. Submit at the Immigration Department or selected Divisional Secretariat. Normal service is LKR 3,500; one-day service is LKR 15,000.";
    }
    
    return { data: { response } };
  }

  // Default fallback
  return { data: { success: true } };
};

export default api;
