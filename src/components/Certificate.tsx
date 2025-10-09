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
    ? 'July 2024 to July 2025' 
    : 'October 2024 to September 2025';

  const displayDate = isDCPStudent(student) ? '03/10/2025' : '06/10/2025';

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
            <div className="ref-line">Register No. : {student.RegiNo}</div>
            <div className="ref-line">Certificate No. : {student.CertificateNo || '2025' + student.RegiNo.slice(-4)}</div>
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

          {/* Completion Statement - Positioned over template */}
          <div className="completion-statement">
            <div>who successfully completed the course at the Kug Oriental Academy of</div>
            <div>Alternative Medicines Allied Sciences Foundation from <strong>{courseDuration}</strong>, and passed the final examination administered by the </div>
            <div>Central Board of Examinations of the Kug Oriental Academy of </div>
            <div>Alternative Medicines Allied Sciences Foundation.</div>
          </div>

          {/* Date - Positioned on left side */}
          <div className="date-section">
            <div className="date-text">Date: {displayDate}</div>
          </div>

          {/* Chairman - Positioned in center */}
          <div className="chairman-section">
            <div className="chairman-line">
              <div className=""></div>
              <div className="chairman-title">Chairman</div>
            </div>
          </div>

          {/* Controller of Examination - Positioned on right side */}
          <div className="controller-section">
            <div className="controller-line">
              <div className=""></div>
              <div className="controller-title">Controller <br /> of Examination</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
