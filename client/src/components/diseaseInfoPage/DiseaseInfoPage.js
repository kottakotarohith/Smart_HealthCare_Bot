// import { useParams } from 'react-router-dom';
// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import {GEMINI_API_KEY} from './config.js'; // Make sure your key is stored here securely

// const DiseaseInfoPage = () => {
//   const { diseaseName } = useParams();
//   const [definition, setDefinition] = useState('');
//   const [medications, setMedications] = useState([]);
//   const [selfCare, setSelfCare] = useState('');
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchDiseaseData = async () => {
//       setLoading(true);
//       try {
//         const prompt = `Act as a medical expert. For the disease "${decodeURIComponent(diseaseName)}", provide:
// 1. A brief definition (format: "Definition: [text]")
// 2. Common medications (format: "Medications: [comma-separated list]")
// 3. Self-care tips (format: "Self-care: [text]")`;

//         const response = await axios.post(
//           `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
//           {
//             contents: [{ parts: [{ text: prompt }] }]
//           },
//           {
//             headers: { 'Content-Type': 'application/json' }
//           }
//         );

//         const text = response.data.candidates[0]?.content?.parts[0]?.text || '';

//         const defMatch = text.match(/Definition:\s*(.+)/i);
//         const medsMatch = text.match(/Medications:\s*(.+)/i);
//         const careMatch = text.match(/Self-care:\s*(.+)/i);

//         setDefinition(defMatch ? defMatch[1].trim() : 'Not available.');
//         setMedications(medsMatch ? medsMatch[1].split(',').map(m => m.trim()) : []);
//         setSelfCare(careMatch ? careMatch[1].trim() : 'Not available.');
//       } catch (error) {
//         console.error("Error fetching disease info:", error);
//         setDefinition('Information not available.');
//         setMedications([]);
//         setSelfCare('Information not available.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDiseaseData();
//   }, [diseaseName]);

//   return (
//     <div style={{ padding: '2rem' }}>
//       <h2>{decodeURIComponent(diseaseName)}</h2>
//       {loading ? (
//         <p>Loading...</p>
//       ) : (
//         <>
//           <h3>Definition</h3>
//           <p>{definition}</p>

//           <h3>Medications</h3>
//           <ul>
//             {medications.length > 0 ? (
//               medications.map((med, index) => <li key={index}>{med}</li>)
//             ) : (
//               <li>No data available.</li>
//             )}
//           </ul>

//           <h3>Self-Care Tips</h3>
//           <p>{selfCare}</p>
//         </>
//       )}
//     </div>
//   );
// };

// export default DiseaseInfoPage;



import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const DiseaseInfoPage = () => {
  const { diseaseName } = useParams();
  const [info, setInfo] = useState('');

  useEffect(() => {
    // Replace this with your own logic or API call
    const fetchDiseaseInfo = async () => {
      try {
        // Placeholder: Replace with actual API or database
        const response = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${diseaseName}`);
        setInfo(response.data.extract);
      } catch (error) {
        console.error("Error fetching disease info", error);
        setInfo("Information not available.");
      }
    };

    fetchDiseaseInfo();
  }, [diseaseName]);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>{decodeURIComponent(diseaseName)}</h2>
      <p>{info}</p>
    </div>
  );
};

export default DiseaseInfoPage;
