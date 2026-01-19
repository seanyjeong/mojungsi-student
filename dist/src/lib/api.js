"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateScore = calculateScore;
exports.calculateBatch = calculateBatch;
exports.calculateAll = calculateAll;
exports.getUniversities = getUniversities;
exports.getUniversityDetail = getUniversityDetail;
exports.getKakaoLoginUrl = getKakaoLoginUrl;
exports.kakaoCallback = kakaoCallback;
exports.getMe = getMe;
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.getScores = getScores;
exports.getScoreByExamType = getScoreByExamType;
exports.saveScore = saveScore;
exports.getSavedUniversities = getSavedUniversities;
exports.toggleSaveUniversity = toggleSaveUniversity;
exports.updateSavedUniversity = updateSavedUniversity;
exports.getPracticalScoreTable = getPracticalScoreTable;
exports.checkIsSaved = checkIsSaved;
exports.getPracticalRecords = getPracticalRecords;
exports.createPracticalRecord = createPracticalRecord;
exports.updatePracticalRecord = updatePracticalRecord;
exports.deletePracticalRecord = deletePracticalRecord;
exports.withdrawUser = withdrawUser;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8900";
async function calculateScore(U_ID, scores, year = 2026) {
    const response = await fetch(`${API_BASE_URL}/calculate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            U_ID,
            year,
            scores,
        }),
    });
    if (!response.ok) {
        throw new Error("Failed to calculate score");
    }
    return response.json();
}
async function calculateBatch(scores, yearId = 2026) {
    const response = await fetch(`${API_BASE_URL}/calculate/batch`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            scores,
            yearId,
        }),
    });
    if (!response.ok) {
        throw new Error("Failed to calculate batch scores");
    }
    return response.json();
}
async function calculateAll(scores, year = 2026) {
    const response = await fetch(`${API_BASE_URL}/calculate/all`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            year,
            scores,
        }),
    });
    if (!response.ok) {
        throw new Error("Failed to calculate all scores");
    }
    return response.json();
}
async function getUniversities(yearId = 2026) {
    const response = await fetch(`${API_BASE_URL}/universities?yearId=${yearId}`);
    if (!response.ok) {
        throw new Error("Failed to fetch universities");
    }
    return response.json();
}
async function getUniversityDetail(id) {
    const response = await fetch(`${API_BASE_URL}/universities/${id}`);
    if (!response.ok) {
        throw new Error("Failed to fetch university detail");
    }
    return response.json();
}
async function getKakaoLoginUrl() {
    const response = await fetch(`${API_BASE_URL}/saas/auth/kakao/login-url`);
    if (!response.ok) {
        throw new Error("Failed to get Kakao login URL");
    }
    return response.json();
}
async function kakaoCallback(code) {
    const response = await fetch(`${API_BASE_URL}/saas/auth/kakao/callback?code=${encodeURIComponent(code)}`);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
    }
    return response.json();
}
async function getMe(token) {
    const response = await fetch(`${API_BASE_URL}/saas/auth/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error("Failed to get user info");
    }
    return response.json();
}
async function getProfile(token) {
    const response = await fetch(`${API_BASE_URL}/saas/profile`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok)
        throw new Error("Failed to get profile");
    return response.json();
}
async function updateProfile(token, data) {
    const response = await fetch(`${API_BASE_URL}/saas/profile`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!response.ok)
        throw new Error("Failed to update profile");
    return response.json();
}
async function getScores(token, year = 2026) {
    const response = await fetch(`${API_BASE_URL}/saas/scores?year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok)
        throw new Error("Failed to get scores");
    return response.json();
}
async function getScoreByExamType(token, examType, year = 2026) {
    const response = await fetch(`${API_BASE_URL}/saas/scores/${encodeURIComponent(examType)}?year=${year}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok)
        return null;
    return response.json();
}
async function saveScore(token, examType, scores, year = 2026) {
    const response = await fetch(`${API_BASE_URL}/saas/scores`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ examType, scores, year }),
    });
    if (!response.ok)
        throw new Error("Failed to save score");
    return response.json();
}
async function getSavedUniversities(token) {
    const response = await fetch(`${API_BASE_URL}/saas/universities/saved`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok)
        throw new Error("Failed to get saved universities");
    return response.json();
}
async function toggleSaveUniversity(token, uId, sunungScore) {
    const response = await fetch(`${API_BASE_URL}/saas/universities/${uId}/toggle`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sunung_score: sunungScore }),
    });
    if (!response.ok)
        throw new Error("Failed to toggle save");
    return response.json();
}
async function updateSavedUniversity(token, uId, data) {
    const response = await fetch(`${API_BASE_URL}/saas/universities/${uId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!response.ok)
        throw new Error("Failed to update");
    return response.json();
}
async function getPracticalScoreTable(token, uId, year = 2026, gender) {
    const params = new URLSearchParams({ year: String(year) });
    if (gender)
        params.append("gender", gender);
    const response = await fetch(`${API_BASE_URL}/saas/universities/${uId}/practical-scores?${params}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok)
        throw new Error("Failed to get practical scores");
    return response.json();
}
async function checkIsSaved(token, uId) {
    const response = await fetch(`${API_BASE_URL}/saas/universities/${uId}/is-saved`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok)
        return { saved: false };
    return response.json();
}
async function getPracticalRecords(token, event) {
    const url = event
        ? `${API_BASE_URL}/saas/practical?event=${encodeURIComponent(event)}`
        : `${API_BASE_URL}/saas/practical`;
    const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok)
        throw new Error("Failed to get records");
    return response.json();
}
async function createPracticalRecord(token, data) {
    const response = await fetch(`${API_BASE_URL}/saas/practical`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!response.ok)
        throw new Error("Failed to create record");
    return response.json();
}
async function updatePracticalRecord(token, id, data) {
    const response = await fetch(`${API_BASE_URL}/saas/practical/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    if (!response.ok)
        throw new Error("Failed to update record");
    return response.json();
}
async function deletePracticalRecord(token, id) {
    const response = await fetch(`${API_BASE_URL}/saas/practical/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok)
        throw new Error("Failed to delete record");
    return response.json();
}
async function withdrawUser(token) {
    const response = await fetch(`${API_BASE_URL}/saas/auth/withdraw`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok)
        throw new Error("Failed to withdraw");
    return response.json();
}
//# sourceMappingURL=api.js.map