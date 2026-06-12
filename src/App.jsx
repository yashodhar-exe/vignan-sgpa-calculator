import { useState, useRef } from "react";
import { ai } from "./gemini";
import githubLogo from "./assets/github.png";
import vignanLogo from "./assets/vignan.png";

function App() {
  const [image, setImage] = useState(null);
  const [sgpa, setSgpa] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dashboardVisible, setDashboardVisible] = useState(false);
  const [data, setData] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const fileInputRef = useRef(null);

  const fileToBase64 = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result.split(",")[1]);
      };
      reader.readAsDataURL(file);
    });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setIsAnalyzing(true);
    setDashboardVisible(false);

    try {
      const base64 = await fileToBase64(file);
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64,
            },
          },
          {
            text: `
Analyze this Vignan University result screenshot.

Extract only:

{
  "subjects":[
    {
      "name":"",
      "credits":0,
      "gradePoint":0,
      "grade": ""
    }
  ],
  "studentName": "Unknown",
  "rollNumber": "Unknown",
  "branch": "Unknown"
}

Return JSON only.
`,
          },
        ],
      });

      const jsonText = response.text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedData = JSON.parse(jsonText);

      const totalCredits = parsedData.subjects.reduce((sum, subject) => sum + subject.credits, 0);
      const totalPoints = parsedData.subjects.reduce((sum, subject) => sum + subject.credits * subject.gradePoint, 0);
      const calculatedSGPA = (totalPoints / totalCredits).toFixed(2);

      setData({
        ...parsedData,
        totalCredits,
        totalPoints
      });
      setSgpa(calculatedSGPA);
      setDashboardVisible(true);
    } catch (error) {
      console.error(error);
      setToastMessage("Failed to analyze image. Please try again.");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] px-6 py-3 rounded-lg shadow-lg font-medium flex items-center gap-2" style={{ backgroundColor: '#ef2427', color: 'white' }}>
          <span className="material-symbols-outlined text-[20px]">info</span>
          {toastMessage}
        </div>
      )}
      <header className="bg-surface/80 dark:bg-on-background/80 backdrop-blur-md sticky top-0 full-width z-50 border-b border-outline-variant/30 dark:border-outline/20 shadow-sm">
        <div className="flex justify-start items-center px-4 py-3 w-full z-50">
          <div className="font-headline-lg text-headline-lg md:font-headline-lg md:text-headline-lg font-bold text-primary dark:text-primary-fixed">
            <img src={vignanLogo} alt="Vignan Logo" className="h-8 object-contain" />
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-start pt-xl pb-xl px-gutter w-full max-w-container-max mx-auto gap-xl">
        <section className="w-full max-w-2xl flex flex-col items-center gap-md">
          <div className="text-center space-y-sm mb-md">
            <h1 className="font-headline-lg text-headline-lg md:font-display-lg md:text-display-lg text-on-background" style={{ fontFamily: 'Delight, sans-serif' }}>KNOW YOUR SGPA?</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant">
              Upload your{' '}
              <span className="relative inline-block whitespace-nowrap z-0">
                <svg className="absolute w-[115%] h-[140%] left-[-7.5%] top-[-15%] -z-10 text-[#fde047]" viewBox="0 0 500 100" preserveAspectRatio="none" fill="currentColor">
                  <path d="M20,45 C40,25 100,15 250,22 C380,28 460,18 480,45 C460,65 380,75 250,68 C100,62 40,75 20,45 Z" opacity="0.8" />
                  <path d="M5,45 C50,25 200,10 300,20 C400,30 490,15 495,45" stroke="currentColor" strokeWidth="14" strokeLinecap="round" fill="none" opacity="0.5" />
                  <path d="M25,55 C100,75 250,90 350,85 C450,80 480,65 480,65" stroke="currentColor" strokeWidth="16" strokeLinecap="round" fill="none" opacity="0.5" />
                  <path d="M10,40 C100,20 200,15 350,20" stroke="currentColor" strokeWidth="10" strokeLinecap="round" fill="none" opacity="0.4" />
                  <path d="M490,55 C400,80 300,85 150,80" stroke="currentColor" strokeWidth="10" strokeLinecap="round" fill="none" opacity="0.4" />
                </svg>
                <span className="relative text-on-background font-medium">Vignan University</span>
              </span>{' '}
              results screenshot to know your SGPA.
            </p>
          </div>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 shadow-sm p-lg w-full text-center relative overflow-hidden transition-all duration-300 hover:shadow-md hover:border-primary/50 group" id="upload-zone">
            <div className="border-2 border-dashed border-outline-variant rounded-lg p-xl flex flex-col items-center justify-center gap-sm bg-surface-container-low/30 transition-colors group-hover:bg-primary/5 min-h-[240px]">
              <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center mb-sm group-hover:scale-110 transition-transform duration-300">
                <span className="material-symbols-outlined text-4xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>upload_file</span>
              </div>
              <h3 className="font-title-md text-title-md text-on-background">Drop your result screenshot here</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-md">PNG, JPG, JPEG supported</p>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
              <button onClick={handleUploadClick} className="bg-primary text-on-primary rounded-lg px-md py-sm font-label-caps text-label-caps hover:bg-primary/90 transition-all active:scale-95 shadow-sm">
                Upload Screenshot
              </button>
            </div>
          </div>
        </section>

        {isAnalyzing && (
          <section className="w-full max-w-4xl flex items-center justify-center mt-xl min-h-[240px]">
            <svg className="animate-spin h-14 w-14 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </section>
        )}

        {dashboardVisible && data && (
          <section className="w-full max-w-4xl transition-all duration-700 ease-out transform translate-y-0 opacity-100" id="results-dashboard">
            <div className="glass-card rounded-xl border border-outline-variant/60 shadow-sm p-lg flex flex-col gap-xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-lg border-b border-outline-variant/30 pb-lg">
                <div className="space-y-base">
                  <h2 className="font-label-caps text-label-caps text-primary uppercase tracking-wider">Student Profile</h2>
                  <div className="font-headline-lg text-headline-lg text-on-background">{data.studentName || 'Unknown Student'}</div>
                  <div className="flex items-center gap-md font-mono-data text-mono-data text-on-surface-variant">
                    <div className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[18px]">badge</span>
                      {data.rollNumber || 'Unknown'}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-outline"></div>
                    <div className="flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[18px]">school</span>
                      {data.branch || 'Unknown'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-lg bg-surface-container-low rounded-xl p-md border border-outline-variant/30 shadow-inner">
                  <div className="flex flex-col items-start justify-center">
                    <span className="font-label-caps text-label-caps text-on-surface-variant">Semester</span>
                    <span className="font-title-md text-title-md text-on-background">SGPA Score</span>
                  </div>
                  <div className="relative w-[100px] h-[100px]">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle className="text-surface-variant" cx="50" cy="50" fill="transparent" r="42" stroke="currentColor" strokeWidth="8"></circle>
                      <circle className="text-primary transition-all duration-1000 ease-out" cx="50" cy="50" fill="transparent" r="42" stroke="currentColor" strokeDasharray="263.89" strokeDashoffset={`${263.89 - (sgpa / 10) * 263.89}`} strokeWidth="8"></circle>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-primary tracking-tighter">
                      {sgpa}
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/50 font-label-caps text-label-caps text-on-surface-variant">
                      <th className="py-sm px-md font-semibold">Subject Name</th>
                      <th className="py-sm px-md font-semibold text-center w-24">Credits</th>
                      <th className="py-sm px-md font-semibold text-center w-24">Grade</th>
                      <th className="py-sm px-md font-semibold text-right w-24">Grade Points</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md text-on-background">
                    {data.subjects.map((sub, idx) => (
                      <tr key={idx} className="border-b border-outline-variant/20 hover:bg-surface-container-lowest/50 transition-colors">
                        <td className="py-sm px-md flex items-center gap-sm">
                          <span className="material-symbols-outlined text-outline text-[18px] cursor-grab">drag_indicator</span>
                          {sub.name}
                        </td>
                        <td className="py-sm px-md text-center font-mono-data text-mono-data">{sub.credits}</td>
                        <td className="py-sm px-md text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-surface-container-highest font-title-md text-title-md text-primary">
                            {sub.grade || (sub.gradePoint === 10 ? 'S' : sub.gradePoint === 9 ? 'A' : sub.gradePoint === 8 ? 'B' : sub.gradePoint === 7 ? 'C' : sub.gradePoint === 6 ? 'D' : sub.gradePoint === 5 ? 'E' : 'F')}
                          </span>
                        </td>
                        <td className="py-sm px-md text-right font-mono-data text-mono-data">{sub.gradePoint}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col md:flex-row justify-end items-center gap-md border-t border-outline-variant/30 pt-lg mt-sm">
                <div className="flex gap-md w-full md:w-auto">
                  <button onClick={handleUploadClick} className="flex-1 md:flex-none flex items-center justify-center gap-xs px-md py-sm rounded-lg border border-outline-variant text-on-background font-label-caps text-label-caps hover:bg-surface-container-low transition-colors active:scale-95">
                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                    Upload Another
                  </button>
                  <button className="flex-1 md:flex-none flex items-center justify-center gap-xs px-md py-sm rounded-lg border border-outline-variant text-on-background font-label-caps text-label-caps hover:bg-surface-container-low transition-colors active:scale-95" onClick={() => navigator.clipboard.writeText(sgpa)}>
                    <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    Copy SGPA
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="bg-surface dark:bg-on-background full-width py-lg mt-xl border-t border-outline-variant/20">
        <div className="flex justify-center items-center gap-3 max-w-container-max mx-auto w-full">
          <img src={githubLogo} alt="GitHub" className="w-5 h-5" />
          <a href="https://github.com/yashodhar-exe" className="text-on-surface-variant font-medium hover:text-primary transition-colors">

            yashodhar-exe
          </a>
        </div>
      </footer>
    </>
  );
}

export default App;