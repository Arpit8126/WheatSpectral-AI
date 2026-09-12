const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = `${API_BASE}/api`;

export const analyzeImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Analysis failed');
    }

    return response.json();
};
