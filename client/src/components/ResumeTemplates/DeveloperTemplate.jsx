import React from 'react';

const DeveloperTemplate = ({ data }) => {
  if (!data) return null;
  const { basics, work, education, skills, projects } = data;

  return (
    <div className="bg-[#1e1e1e] text-[#d4d4d4] p-8 font-mono text-sm max-w-[800px] mx-auto shadow-2xl min-h-[1056px]">
      
      {/* Header */}
      <div className="mb-8 border-b border-[#333] pb-4">
        <h1 className="text-3xl font-bold text-[#569cd6] mb-2">const developer = {"{"}</h1>
        <div className="pl-4 space-y-1">
          <div><span className="text-[#9cdcfe]">name</span>: <span className="text-[#ce9178]">"{basics?.name}"</span>,</div>
          <div><span className="text-[#9cdcfe]">title</span>: <span className="text-[#ce9178]">"{basics?.label}"</span>,</div>
          <div><span className="text-[#9cdcfe]">email</span>: <span className="text-[#ce9178]">"{basics?.email}"</span>,</div>
          <div><span className="text-[#9cdcfe]">location</span>: <span className="text-[#ce9178]">"{basics?.location?.city}"</span></div>
        </div>
        <h1 className="text-3xl font-bold text-[#569cd6] mt-2">{"};"}</h1>
      </div>

      {basics?.summary && (
        <div className="mb-6">
          <h2 className="text-xl text-[#c586c0] mb-2">/* Summary */</h2>
          <p className="text-[#6a9955] pl-4 leading-relaxed">
            {basics.summary.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}<br/>
              </React.Fragment>
            ))}
          </p>
        </div>
      )}

      {skills && skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl text-[#c586c0] mb-2">/* Skills */</h2>
          <div className="pl-4">
            {skills.map((skillGroup, i) => (
              <div key={i} className="mb-2">
                <span className="text-[#4fc1ff]">{skillGroup.name}</span> = [
                <span className="text-[#ce9178]">
                  {(skillGroup.keywords || []).map(k => `"${k}"`).join(', ')}
                </span>
                ];
              </div>
            ))}
          </div>
        </div>
      )}

      {work && work.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl text-[#c586c0] mb-2">/* Experience */</h2>
          <div className="pl-4 space-y-6">
            {work.map((job, i) => (
              <div key={i}>
                <div className="text-[#dcdcaa] font-bold text-base">&lt;{job.name}&gt;</div>
                <div className="pl-4 mt-1 border-l border-[#404040]">
                  <div><span className="text-[#9cdcfe]">role:</span> <span className="text-[#ce9178]">"{job.position}"</span></div>
                  <div><span className="text-[#9cdcfe]">duration:</span> <span className="text-[#b5cea8]">{job.startDate} - {job.endDate}</span></div>
                  <div className="mt-2 text-[#9cdcfe]">highlights:</div>
                  <ul className="list-disc pl-5 mt-1 text-[#d4d4d4]">
                    {(job.highlights || []).map((highlight, j) => (
                      <li key={j}>{highlight}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-[#dcdcaa] font-bold mt-1">&lt;/{job.name}&gt;</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl text-[#c586c0] mb-2">/* Projects */</h2>
          <div className="pl-4 space-y-4">
            {projects.map((proj, i) => (
              <div key={i}>
                <div className="text-[#4ec9b0] font-bold">{proj.name}() {"{"}</div>
                <div className="pl-4 mt-1">
                  <div className="text-[#6a9955]">// {proj.description}</div>
                  <ul className="list-disc pl-5 mt-1 text-[#d4d4d4]">
                    {(proj.highlights || []).map((highlight, j) => (
                      <li key={j}>{highlight}</li>
                    ))}
                  </ul>
                </div>
                <div className="text-[#4ec9b0]">{"}"}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {education && education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl text-[#c586c0] mb-2">/* Education */</h2>
          <div className="pl-4 space-y-3">
            {education.map((edu, i) => (
              <div key={i}>
                <div className="text-[#4fc1ff]">{edu.institution}</div>
                <div className="pl-4 text-[#ce9178]">"{edu.studyType} in {edu.area}"</div>
                <div className="pl-4 text-[#b5cea8]">{edu.startDate} - {edu.endDate}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-12 text-[#6a9955] text-center border-t border-[#333] pt-4">
        // End of File
      </div>

    </div>
  );
};

export default DeveloperTemplate;
