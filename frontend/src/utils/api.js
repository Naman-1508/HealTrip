// Placeholder for API utilities

export const fetchData = async (endpoint) => {
  try {
    const response = await fetch(endpoint);
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
