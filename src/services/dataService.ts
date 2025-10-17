/**
 * Data Service for Oriental College
 * Provides local data without backend dependencies
 */

import { Student, DCPStudent } from '../types';
import { studentsData, dcpStudentsData } from '../data/studentsData';

export class DataService {
  // Get all PDA students
  static async getStudents(): Promise<Student[]> {
    try {
      return studentsData;
    } catch (error) {
      console.error('Failed to fetch students:', error);
      throw new Error('Failed to fetch students');
    }
  }

  // Get all DCP students
  static async getDCPStudents(): Promise<DCPStudent[]> {
    try {
      return dcpStudentsData;
    } catch (error) {
      console.error('Failed to fetch DCP students:', error);
      throw new Error('Failed to fetch DCP students');
    }
  }

  // Get student by registration number (for public access)
  static async getStudentByRegiNo(regiNo: string): Promise<Student | null> {
    try {
      const student = studentsData.find(s => s.RegiNo === regiNo);
      return student || null;
    } catch (error) {
      console.error('Failed to fetch student by regi no:', error);
      return null;
    }
  }

  // Get DCP student by registration number (for public access)
  static async getDCPStudentByRegiNo(regiNo: string): Promise<DCPStudent | null> {
    try {
      const student = dcpStudentsData.find(s => s.RegiNo === regiNo);
      return student || null;
    } catch (error) {
      console.error('Failed to fetch DCP student by regi no:', error);
      return null;
    }
  }

  // Get statistics for dashboard
  static async getStatistics() {
    try {
      const pdaStudents = studentsData.length;
      const dcpStudents = dcpStudentsData.length;
      const totalStudents = pdaStudents + dcpStudents;
      
      const pdaPassed = studentsData.filter(s => s.Result === 'PASS').length;
      const dcpPassed = dcpStudentsData.filter(s => s.Result === 'PASS').length;
      const totalPassed = pdaPassed + dcpPassed;

      return {
        pda: {
          total_students: pdaStudents,
          published_students: pdaStudents,
        },
        dcp: {
          total_students: dcpStudents,
          published_students: dcpStudents,
        },
        total_students: totalStudents,
        total_published: totalStudents,
        active_courses: 2, // PDA and DCP
        active_batches: 1,
      };
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      throw new Error('Failed to fetch statistics');
    }
  }

  // Health check
  static async healthCheck() {
    try {
      return {
        status: 'healthy',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error('Health check failed');
    }
  }
}

export default DataService;
