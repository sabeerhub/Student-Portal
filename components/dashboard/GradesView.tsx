import React, { useState } from 'react';
import { MOCK_GRADES } from '../../constants';

const GradesView: React.FC = () => {
  const semesters = Object.keys(MOCK_GRADES);
  const [selectedSemester, setSelectedSemester] = useState(semesters[semesters.length - 1]);

  const grades = MOCK_GRADES[selectedSemester];

  const getGradeColor = (grade: string) => {
    switch(grade) {
      case 'A': return 'bg-accent/20 text-accent';
      case 'B': return 'bg-accent-cyan/20 text-accent-cyan';
      case 'C': return 'bg-accent-yellow/20 text-accent-yellow';
      case 'D': return 'bg-orange-500/20 text-orange-400';
      case 'F': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-text-primary">Semester Grades</h3>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="bg-card-light border border-gray-600 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {semesters.map((semester) => (
            <option key={semester} value={semester}>
              {semester}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-card-light">
              <th className="py-3 px-4 text-text-secondary font-semibold text-sm uppercase tracking-wider">Course</th>
              <th className="py-3 px-4 text-text-secondary font-semibold text-sm uppercase tracking-wider text-center">Grade</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((g) => (
              <tr key={g.courseCode} className="border-b border-card-light last:border-b-0 hover:bg-card-light/50">
                <td className="py-4 px-4">
                    <p className="font-bold text-text-primary">{g.courseTitle}</p>
                    <p className="font-mono text-sm text-text-muted">{g.courseCode}</p>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`px-4 py-1 text-lg font-bold rounded-full ${getGradeColor(g.grade)}`}>
                    {g.grade}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GradesView;