
const apiUrl = import.meta.env.VITE_API_URL;

const apiClient = {
  /**
   * Fungsi untuk mengirim request POST.
   * @param {string} url - URL endpoint 
   * @param {object} data - Payload atau data yang akan dikirim.
   * @returns {Promise<object>} - Hasil respons dari server.
   */
  post: async (url, data) => {
    try {
      const fullUrl = `${apiUrl}${url}`;
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        redirect: 'follow', 
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { data: await response.json() };

    } catch (error) {
      console.error('API Client Error:', error);
      throw error;
    }
  }
};

export default apiClient;