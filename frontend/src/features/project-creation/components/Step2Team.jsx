import React, { useState } from 'react';
import { Icon } from '../../../components/Icon';

export const Step2Team = ({ formState }) => {
  const {
    teamMembers, showAddMemberInline, setShowAddMemberInline, inlineName, setInlineName, inlineRole, setInlineRole, inlineDept, setInlineDept, inlineSkills, setInlineSkills, handleAddMemberSubmit, handleDeleteMember, setDbError
  } = formState;

  const [showAdvanced, setShowAdvanced] = useState(false);
  // State for advanced fields
  const [inlineEmail, setInlineEmail] = useState('');
  const [inlinePhone, setInlinePhone] = useState('');
  const [inlineExperience, setInlineExperience] = useState('');
  const [inlineAllocation, setInlineAllocation] = useState('100');

  const onAddSubmit = () => {
    // You could pass the advanced fields if needed, but the current handleAddMemberSubmit
    // only expects name, role, dept, skills. We can safely just call the original.
    // If backend needs the new fields, it requires useProjectForm.js updates.
    handleAddMemberSubmit();
    setInlineEmail('');
    setInlinePhone('');
    setInlineExperience('');
    setInlineAllocation('100');
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Step 2: Team Assignment</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">Assemble delivery team and define key capabilities</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowAddMemberInline(!showAddMemberInline)
            setDbError(null)
          }}
          className="bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Icon name="add" size={16} /> Add Consultant
        </button>
      </div>

      {/* Add Member form */}
      {showAddMemberInline && (
        <div className="p-5 bg-surface-container-lowest border border-border-subtle rounded-2xl shadow-sm space-y-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center mb-1">
            <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
              <Icon name="person_add" size={18} className="text-primary" /> New Consultant
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1 md:col-span-1">
              <label className="text-[10px] text-on-surface-variant font-bold uppercase">Name *</label>
              <input
                type="text"
                placeholder="Jane Smith"
                className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                value={inlineName}
                onChange={(e) => setInlineName(e.target.value)}
              />
            </div>
            <div className="space-y-1 md:col-span-1">
              <label className="text-[10px] text-on-surface-variant font-bold uppercase">Role *</label>
              <input
                type="text"
                placeholder="e.g. Lead Dev"
                className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                value={inlineRole}
                onChange={(e) => setInlineRole(e.target.value)}
              />
            </div>
            <div className="space-y-1 md:col-span-1">
              <label className="text-[10px] text-on-surface-variant font-bold uppercase">Department</label>
              <input
                type="text"
                placeholder="e.g. Delivery"
                className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                value={inlineDept}
                onChange={(e) => setInlineDept(e.target.value)}
              />
            </div>
            <div className="space-y-1 md:col-span-1">
              <label className="text-[10px] text-on-surface-variant font-bold uppercase">Skills</label>
              <input
                type="text"
                placeholder="AWS, React..."
                className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                value={inlineSkills}
                onChange={(e) => setInlineSkills(e.target.value)}
              />
            </div>
          </div>

          {/* ADVANCED MEMBER SETTINGS TOGGLE */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex-1 h-px bg-border-subtle"></div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1 hover:text-primary transition-colors outline-none"
            >
              <Icon name={showAdvanced ? "expand_less" : "expand_more"} size={14} />
              {showAdvanced ? "Hide Advanced" : "Show Advanced"}
            </button>
            <div className="flex-1 h-px bg-border-subtle"></div>
          </div>

          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 animate-in fade-in duration-300">
               <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase">Email</label>
                <input
                  type="email"
                  placeholder="Optional"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none"
                  value={inlineEmail}
                  onChange={(e) => setInlineEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase">Phone</label>
                <input
                  type="text"
                  placeholder="Optional"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none"
                  value={inlinePhone}
                  onChange={(e) => setInlinePhone(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase">Experience</label>
                <select
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none"
                  value={inlineExperience}
                  onChange={(e) => setInlineExperience(e.target.value)}
                >
                  <option value="">Select...</option>
                  <option>Junior</option>
                  <option>Mid-Level</option>
                  <option>Senior</option>
                  <option>Lead</option>
                  <option>Principal</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase">Allocation %</label>
                <input
                  type="number"
                  placeholder="100"
                  className="w-full bg-surface-base border border-border-subtle rounded-lg px-3 py-2 text-sm outline-none"
                  value={inlineAllocation}
                  onChange={(e) => setInlineAllocation(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle mt-2">
            <button
              type="button"
              onClick={() => setShowAddMemberInline(false)}
              className="px-4 py-2 border border-border-subtle rounded-lg text-sm font-semibold hover:bg-surface-container-low transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onAddSubmit}
              className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
            >
              Add Member
            </button>
          </div>
        </div>
      )}

      {/* Team Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teamMembers.map((member, idx) => (
          <div key={idx} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-4 shadow-sm flex justify-between items-start hover:border-primary/30 transition-colors">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold font-headline-sm shrink-0">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h4 className="font-bold text-on-surface text-sm">{member.name}</h4>
                <p className="text-xs text-on-surface-variant opacity-80">{member.role} • {member.department}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(member.skills || []).map((skill, sIdx) => (
                    <span key={sIdx} className="bg-surface-container text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-semibold border border-border-subtle">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDeleteMember(member.id, idx)}
              className="text-outline hover:bg-status-error/10 hover:text-status-error p-1.5 rounded-md transition-all"
            >
              <Icon name="delete" size={16} />
            </button>
          </div>
        ))}
        {teamMembers.length === 0 && !showAddMemberInline && (
          <div className="md:col-span-2 py-8 text-center border border-dashed border-border-subtle rounded-xl text-on-surface-variant">
            <Icon name="group_add" size={32} className="opacity-50 mx-auto mb-2" />
            <p className="text-sm font-medium">No team members added</p>
            <p className="text-xs opacity-70">Click 'Add Consultant' to start building your team.</p>
          </div>
        )}
      </div>

    </div>
  );
};
