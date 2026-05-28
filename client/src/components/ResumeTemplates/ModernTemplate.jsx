import React from 'react';

const ModernTemplate = ({ data }) => {
  if (!data) return null;
  const { basics, work, education, skills, projects } = data;

  return (
    <div className="bg-white text-gray-800 font-sans text-sm max-w-[800px] mx-auto shadow-2xl flex min-h-[1056px]">
      
      {/* Left Column (Sidebar) */}
      <div className="w-1/3 bg-gray-900 text-white p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight leading-none mb-2 text-yellow-400">{basics?.name || 'Your Name'}</h1>
          <h2 className="text-lg text-gray-400 uppercase tracking-widest">{basics?.label || 'Professional'}</h2>
        </div>

        <div className="mb-8 space-y-3 text-gray-300 text-xs">
          {basics?.email && <div className="flex items-center"><span className="w-5 text-yellow-400">@</span>{basics.email}</div>}
          {basics?.phone && <div className="flex items-center"><span className="w-5 text-yellow-400">#</span>{basics.phone}</div>}
          {basics?.location?.city && <div className="flex items-center"><span className="w-5 text-yellow-400">P</span>{basics.location.city}</div>}
          {basics?.url && <div className="flex items-center"><span className="w-5 text-yellow-400">L</span>{basics.url}</div>}
        </div>

        {skills && skills.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-gray-700 pb-2 text-yellow-400">Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skillGroup, i) => 
                (skillGroup.keywords || []).map((kw, j) => (
                  <span key={`${i}-${j}`} className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs border border-gray-700">
                    {kw}
                  </span>
                ))
              )}
            </div>
          </div>
        )}

        {education && education.length > 0 && (
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 border-b border-gray-700 pb-2 text-yellow-400">Education</h3>
            <div className="space-y-4">
              {education.map((edu, i) => (
                <div key={i}>
                  <div className="font-bold text-gray-200">{edu.studyType} in {edu.area}</div>
                  <div className="text-gray-400 text-xs mt-1">{edu.institution}</div>
                  <div className="text-yellow-500/70 text-xs mt-1">{edu.startDate} – {edu.endDate}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column (Main Content) */}
      <div className="w-2/3 bg-gray-50 p-8">
        {basics?.summary && (
          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-3">Profile</h3>
            <p className="text-gray-600 leading-relaxed">{basics.summary}</p>
          </div>
        )}

        {work && work.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Experience</h3>
            <div className="space-y-6">
              {work.map((job, i) => (
                <div key={i} className="relative pl-4 border-l-2 border-yellow-400">
                  <div className="absolute w-3 h-3 bg-yellow-400 rounded-full -left-[7px] top-1 border-2 border-white"></div>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-gray-900 text-base">{job.position}</h4>
                    <span className="text-xs font-semibold text-gray-400 bg-gray-200 px-2 py-1 rounded">{job.startDate} – {job.endDate}</span>
                  </div>
                  <div className="text-yellow-600 font-medium text-sm mb-3">{job.name}</div>
                  <ul className="list-disc pl-4 space-y-1 text-gray-600 text-sm">
                    {(job.highlights || []).map((highlight, j) => (
                      <li key={j}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {projects && projects.length > 0 && (
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Projects</h3>
            <div className="grid grid-cols-1 gap-4">
              {projects.map((proj, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="font-bold text-gray-900 mb-1">{proj.name}</div>
                  <p className="text-gray-500 text-xs mb-2">{proj.description}</p>
                  <ul className="list-disc pl-4 space-y-1 text-gray-600 text-xs">
                    {(proj.highlights || []).map((highlight, j) => (
                      <li key={j}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ModernTemplate;
