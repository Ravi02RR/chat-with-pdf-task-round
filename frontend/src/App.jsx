import { useState } from 'react';
import axios from 'axios';
import { Upload, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const App = () => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    address: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please upload a PDF file');
      setFile(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please upload a PDF file');
      return;
    }

    setLoading(true);
    setError('');

    const formDataToSend = new FormData();
    formDataToSend.append('pdf', file);
    formDataToSend.append('fields', JSON.stringify({
      Name: true,
      Phone: true,
      Address: true,
      Role: true
    }));

    try {
      const response = await axios.post('https://taskapi.devguy.live/api/v1/chat/fill-form', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      
      if (response.data.formData) {
        const mappedData = {
          name: response.data.formData.Name || '',
          phoneNumber: response.data.formData.Phone || '',
          address: response.data.formData.Address || ''
        };
        setFormData(mappedData);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error processing PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4"
    >
      <motion.div
        className="w-full max-w-md bg-white rounded-lg shadow-lg p-6"
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
       

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <label className="flex flex-col items-center cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Upload PDF to auto-fill</span>
              <input
                type="file"
                onChange={handleFileChange}
                accept="application/pdf"
                className="hidden"
              />
            </label>
            {file && (
              <p className="text-sm text-green-600 mt-2 text-center">
                Selected: {file.name}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Fill Form'
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default App;