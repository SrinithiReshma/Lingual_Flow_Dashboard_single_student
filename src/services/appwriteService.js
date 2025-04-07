import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const StudentTable = ({ studentId }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      const data = await getStudentData(studentId);
      setStudent(data);
      setLoading(false);
    };

    fetchStudent();
  }, [studentId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto mt-12">
        <Skeleton className="h-16 w-full mb-4" />
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-10 w-full mb-2" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!student) {
    return <div className="text-center mt-10 text-gray-500">No student found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto mt-12 px-4">
      <Card className="shadow-xl">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">📄 Student Information</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-md">
              <thead>
                <tr className="bg-gray-100 text-left text-sm uppercase text-gray-600">
                  <th className="px-4 py-3">Field</th>
                  <th className="px-4 py-3">Value</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700 divide-y divide-gray-100">
                {Object.entries(student).map(([key, value]) => (
                  <tr key={key} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium capitalize">
                      {key.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3">{String(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default appwriteService;
