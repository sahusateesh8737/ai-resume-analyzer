import React from 'react';

const HarvardTemplate = ({ data }) => {
  if (!data) return null;
  const { basics, work, education, skills, projects } = data;

  return (
    <div className="bg-white text-black p-8 font-serif text-sm max-w-[800px] mx-auto shadow-2xl">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold uppercase mb-2">{basics?.name || 'Your Name'}</h1>
        <p className="text-gray-700">
          {basics?.email} | {basics?.phone} | {basics?.location?.city}
          {basics?.url ? ` | ${basics?.url}` : ''}
        </p>
      </div>

      {basics?.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b-2 border-black mb-2 pb-1">Summary</h2>
          <p className="text-gray-800 leading-relaxed">{basics.summary}</p>
        </div>
      )}

      {work && work.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b-2 border-black mb-2 pb-1">Experience</h2>
          <div className="space-y-4">
            {work.map((job, i) => (
              <div key={i}>
                <div className="flex justify-between font-bold">
                  <span>{job.position}</span>
                  <span>{job.startDate} – {job.endDate}</span>
                </div>
                <div className="italic text-gray-800 mb-1">{job.name}</div>
                <ul className="list-disc pl-5 space-y-1">
                  {(job.highlights || []).map((highlight, j) => (
                    <li key={j} className="text-gray-800">{highlight}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {education && education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b-2 border-black mb-2 pb-1">Education</h2>
          <div className="space-y-3">
            {education.map((edu, i) => (
              <div key={i} className="flex justify-between">
                <div>
                  <span className="font-bold">{edu.institution}</span>
                  <div className="italic">{edu.studyType} in {edu.area}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{edu.startDate} – {edu.endDate}</div>
                  {edu.score && <div className="text-gray-700">GPA: {edu.score}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase border-b-2 border-black mb-2 pb-1">Projects</h2>
          <div className="space-y-4">
            {projects.map((proj, i) => (
              <div key={i}>
                <div className="flex justify-between font-bold">
                  <span>{proj.name}</span>
                  {proj.url && <a href={proj.url} className="text-blue-600 underline text-xs font-normal">{proj.url}</a>}
                </div>
                <p className="text-gray-800 mb-1 italic">{proj.description}</p>
                <ul className="list-disc pl-5 space-y-1">
                  {(proj.highlights || []).map((highlight, j) => (
                    <li key={j} className="text-gray-800">{highlight}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {skills && skills.length > 0 && (
        <div>
          <h2 className="text-lg font-bold uppercase border-b-2 border-black mb-2 pb-1">Skills</h2>
          <div className="space-y-1">
            {skills.map((skillGroup, i) => (
              <div key={i}>
                <span className="font-bold">{skillGroup.name}: </span>
                <span className="text-gray-800">{(skillGroup.keywords || []).join(', ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HarvardTemplate;
