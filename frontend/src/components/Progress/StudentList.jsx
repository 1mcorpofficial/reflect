import { Badge } from "../ui";

/**
 * Student list component showing who responded and who didn't
 */
export default function StudentList({ 
  students, 
  responses = [], 
  scheduleId,
  onStudentClick 
}) {
  // Map responses by student ID for quick lookup
  const responsesByStudentId = {};
  responses.forEach(r => {
    const studentId = r.studentId?.toString() || r.studentId;
    if (studentId) {
      responsesByStudentId[studentId] = r;
    }
  });

  const studentsWithStatus = students.map(student => {
    const studentId = student._id?.toString() || student.id?.toString() || student.id;
    const response = responsesByStudentId[studentId];
    return {
      ...student,
      hasResponded: !!response,
      response: response || null,
      responseStatus: response?.status || null,
    };
  });

  const responded = studentsWithStatus.filter(s => s.hasResponded);
  const notResponded = studentsWithStatus.filter(s => !s.hasResponded);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">
          Atsakė: <strong className="text-green-600">{responded.length}</strong> / {studentsWithStatus.length}
        </span>
        {notResponded.length > 0 && (
          <span className="text-amber-600">
            Laukia: <strong>{notResponded.length}</strong>
          </span>
        )}
      </div>

      {/* Responded students */}
      {responded.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Atsakė ({responded.length})
          </h4>
          <div className="space-y-2">
            {responded.map(student => (
              <div
                key={student._id || student.id}
                onClick={() => onStudentClick?.(student)}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ease-in-out ${
                  onStudentClick ? 'cursor-pointer hover:bg-slate-50 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transform-gpu' : ''
                } ${
                  student.responseStatus === 'reviewed' ? 'border-green-200 bg-green-50' :
                  student.responseStatus === 'commented' ? 'border-blue-200 bg-blue-50' :
                  'border-green-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-semibold text-sm transition-transform duration-200 hover:scale-110">
                    {student.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{student.name}</div>
                    {student.response?.submittedAt && (
                      <div className="text-xs text-slate-500">
                        {new Date(student.response.submittedAt).toLocaleDateString('lt-LT')} {new Date(student.response.submittedAt).toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {student.responseStatus === 'reviewed' && (
                    <Badge color="green" size="sm">Peržiūrėta</Badge>
                  )}
                  {student.responseStatus === 'commented' && (
                    <Badge color="blue" size="sm">Pakomentuota</Badge>
                  )}
                  {student.responseStatus === 'submitted' && (
                    <Badge color="amber" size="sm">Laukia</Badge>
                  )}
                  {onStudentClick && (
                    <span className="text-slate-400">→</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Not responded students */}
      {notResponded.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
            Neatsakė ({notResponded.length})
          </h4>
          <div className="space-y-2">
            {notResponded.map(student => (
              <div
                key={student._id || student.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50"
              >
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-semibold text-sm transition-transform duration-200 hover:scale-110">
                  {student.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="font-medium text-slate-700">{student.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

