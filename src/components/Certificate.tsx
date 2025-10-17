import React from 'react';
import { Student, DCPStudent } from '@/data/studentsData';
import './Certificate.css';

interface CertificateProps {
  student: Student | DCPStudent;
  className?: string;
}

export const Certificate = ({ student, className = '' }: CertificateProps) => {
  // Type guard to check if student is DCP student
  const isDCPStudent = (student: Student | DCPStudent): student is DCPStudent => {
    return 'DCP001_CE' in student;
  };

  const courseName = isDCPStudent(student) 
    ? 'Diploma in Counselling Psychology' 
    : 'Professional Diploma in Acupuncture';

  const courseDuration = isDCPStudent(student) 
    ? 'October 2024 to September 2025' 
    : 'October 2024 to September 2025';

  const displayDate = isDCPStudent(student) ? '28/06/2021' : '28/06/2021';

  return (
    <div className={`certificate-container ${className}`}>
      {/* Certificate Paper with Template Background */}
      <div className="certificate-paper">
        {/* Template Background */}
        <div className="template-background">
          <img 
            src="/Course Certificate Model WEB .jpg" 
            alt="Certificate Template" 
            className="template-image"
          />
        </div>
        
        {/* Content Overlay */}
        <div className="certificate-content">
          {/* Reference Numbers - Positioned over template */}
          <div className="reference-numbers">
            <div className="ref-line">
              <span>Register No. :</span>
              <span className="reg-value"> {student.RegiNo}</span>
            </div>
            <div className="ref-line">
              <span>Certificate No. :</span>
              <span className="cert-value"> {student.CertificateNo || '2025' + student.RegiNo.slice(-4)}</span>
            </div>
          </div>

          {/* Student Photo - Positioned over template */}
          <div className="student-photo">
            <div className="photo-container">
              <img 
                src={`/DCP STUDENTS PHOTOS/${student.RegiNo}.png`}
                alt={`${student.Name} photo`}
                className="student-photo-img"
                onError={(e) => {
                  // Fallback to placeholder if photo not found
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const placeholder = target.nextElementSibling as HTMLElement;
                  if (placeholder) placeholder.style.display = 'flex';
                }}
              />
              <div className="photo-placeholder" style={{ display: 'none' }}>
                <div className="photo-icon">👤</div>
              </div>
            </div>
          </div>

          {/* Course Conferred - Positioned over template */}
          <div className="course-conferred">
            <div className="conferral-text">The certificate of</div>
            <div className="course-name">{courseName}</div>
            <div className="conferral-text">has been conferred upon</div>
          </div>

          {/* Student Name - Centered big like the template */}
          <div className="student-name">
            {student.Name}
          </div>

          {/* Completion Statement - Positioned over template */}
          <div className="completion-statement">
            <div>who successfully completed the course at the Kug Oriental Academy of</div>
            <div>Alternative Medicines Allied Sciences Foundation from <strong>June 2021 to</strong></div>
            <div><strong>May 2022</strong>, and passed the final examination administered by the</div>
            <div>Central Board of Examinations of the Kug Oriental Academy of</div>
            <div>Alternative Medicines Allied Sciences Foundation.</div>
          </div>

          {/* Bottom Row - Date, Chairman, and Controller in one row */}
          <div className="bottom-row">
            {/* Date - Positioned on left side */}
            <div className="date-section">
              <div className="date-text">Date: {displayDate}</div>
            </div>

            {/* Chairman - Positioned in center */}
            <div className="chairman-section">
              <div className="chairman-line">
                <img src="/UMMER SIR SIGN.png" alt="Chairman Signature" className="chairman-sign" />
                <div className="chairman-title">Chairman</div>
              </div>
            </div>

            {/* Controller of Examination - Positioned on right side */}
            <div className="controller-section">
              <div className="controller-line">
                <img src="/Nargees teacher Sign.png" alt="Controller Signature" className="controller-sign" />
                <div className="controller-title">Controller <br /> of Examination</div>
              </div>
            </div>
          </div>

          {/* KUG Seal - Positioned below signatures */}
          <div className="kug-seal">
            <img src="/kug seal.png" alt="KUG Oriental Academy Seal" className="seal-image" />
          </div>
        </div>
      </div>

    </div>
  );
};
