/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Send, Loader2, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coldarkDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const App = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    const savedPdf = localStorage.getItem('savedPdf');
    if (savedPdf) {
      setPdfFile(JSON.parse(savedPdf));
    }
  }, []);

  useEffect(() => {
    if (pdfFile) {
      localStorage.setItem('savedPdf', JSON.stringify(pdfFile));
    }
  }, [pdfFile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setError('');
    } else {
      setError('Please select a valid PDF file');
    }
  };

  const simulateThinking = async () => {
    setThinking(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setThinking(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile || !question) {
      setError('Please provide both a PDF file and a question');
      return;
    }

    setLoading(true);
    setError('');
    await simulateThinking();

    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('question', question);

    try {
      const response = await axios.post('https://taskapi.devguy.live/api/v1/chat/ask-question',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );


      const formattedResponse = response.data.response;
      setResponse(formattedResponse);
    } catch (err) {
      setError(err.response?.data?.error || 'Error processing request');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >


        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="bg-gray-800 p-6 rounded-lg border-2 border-dashed border-gray-600 hover:border-blue-500 transition-colors">
            <label className="flex flex-col items-center cursor-pointer">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept="application/pdf"
              />
              <Upload className="w-12 h-12 mb-2 text-gray-400" />
              <span className="text-lg font-medium">
                {pdfFile ? pdfFile.name : 'Drop your PDF here or click to upload'}
              </span>
            </label>
          </div>

          {/* Question Input */}
          <div className="space-y-2">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask your question about the PDF..."
              className="w-full p-4 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors"
              rows="3"
            />
          </div>


          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center space-x-2 disabled:opacity-50"
            disabled={loading || !pdfFile || !question}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span>Submit Question</span>
          </motion.button>
        </form>


        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>


        <AnimatePresence>
          {thinking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 flex items-center space-x-3"
            >
              <MessageSquare className="w-6 h-6 text-blue-400 animate-pulse" />
              <span className="text-gray-400">Thinking...</span>
            </motion.div>
          )}
        </AnimatePresence>


        <AnimatePresence>
          {response && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700"
            >
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={coldarkDark}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {response}
                </ReactMarkdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default App;