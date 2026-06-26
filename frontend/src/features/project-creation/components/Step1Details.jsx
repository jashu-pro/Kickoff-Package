import React, { useState } from 'react';
import { Icon } from '../../../components/Icon';

export const Step1Details = ({ formState }) => {
  const {
    formData, handleInputChange, handleInputBlur, saveProjectDetails, priority, setPriority
  } = formState;

  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-10">
      <div>
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Step 1: Project Details</h3>
        <p className="font-body-md text-body-md text-on-surface-variant">Initialize essential project parameters</p>
      </div>

      {/* CORE REQUIRED FIELDS */}
      <section className="space-y-6 bg-surface-container-lowest p-6 rounded-2xl border border-border-subtle shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
            <Icon name="bolt" size={18} className="text-primary" /> Primary Details
          </h4>
          <div className="flex items-center gap-4 text-xs font-mono text-on-surface-variant">
            {formData.clientId && <span>ID: <span className="font-bold text-primary">{formData.clientId}</span></span>}
            {formData.projectCode && <span>Code: <span className="font-bold text-primary">{formData.projectCode}</span></span>}
            {formData.estimatedDuration && <span>Duration: <span className="font-bold text-primary">{formData.estimatedDuration}</span></span>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="client-name">Client Name *</label>
            <input
              id="client-name"
              type="text"
              required
              placeholder="Acme Corporation"
              className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2.5 font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
              value={formData.clientName}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              onBlur={handleInputBlur}
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="project-name">Project Name *</label>
            <input
              id="project-name"
              type="text"
              required
              placeholder="Cloud Infrastructure Migration"
              className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2.5 font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
              value={formData.projectName}
              onChange={(e) => handleInputChange('projectName', e.target.value)}
              onBlur={handleInputBlur}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="industry">Industry *</label>
            <select
              id="industry"
              className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2.5 font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
              value={formData.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              onBlur={handleInputBlur}
            >
              <option>Retail / E-Commerce</option>
              <option>Banking</option>
              <option>Healthcare</option>
              <option>Manufacturing</option>
              <option>Insurance</option>
              <option>Education</option>
              <option>Government</option>
              <option>Telecommunications</option>
              <option>Logistics</option>
              <option>Energy</option>
              <option>Travel</option>
              <option>Real Estate</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="project-type">Project Type *</label>
            <select
              id="project-type"
              className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2.5 font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
              value={formData.projectType}
              onChange={(e) => handleInputChange('projectType', e.target.value)}
              onBlur={handleInputBlur}
            >
              <option>Custom Software Development</option>
              <option>Cloud Migration</option>
              <option>Cloud Transformation</option>
              <option>AI/ML Implementation</option>
              <option>Data Engineering</option>
              <option>ERP Implementation</option>
              <option>Mobile Application</option>
              <option>Web Application</option>
              <option>Digital Transformation</option>
              <option>Infrastructure Upgrade</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="start-date">Start Date *</label>
            <input
              id="start-date"
              type="date"
              className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2.5 font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              onBlur={handleInputBlur}
            />
          </div>
          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="end-date">End Date *</label>
            <input
              id="end-date"
              type="date"
              className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2.5 font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              onBlur={handleInputBlur}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="contract-value">Contract Value *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">₹</span>
              <input
                id="contract-value"
                type="number"
                placeholder="125000"
                className="w-full bg-surface-base border border-border-subtle rounded-xl pl-8 pr-3.5 py-2.5 font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                value={formData.contractValue}
                onChange={(e) => handleInputChange('contractValue', e.target.value)}
                onBlur={handleInputBlur}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="pm">Project Manager *</label>
            <select
              id="pm"
              className="w-full bg-surface-base border border-border-subtle rounded-xl px-3.5 py-2.5 font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
              value={formData.projectManager}
              onChange={(e) => handleInputChange('projectManager', e.target.value)}
              onBlur={handleInputBlur}
            >
              <option value="Sarah Jenkins">Sarah Jenkins</option>
              <option value="Mark Thompson">Mark Thompson</option>
              <option value="David Chen">David Chen</option>
              <option value="Elena Rostova">Elena Rostova</option>
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="font-label-md text-label-md text-on-surface-variant block">Priority Level *</label>
            <div className="flex flex-wrap gap-3">
              {[
                { level: 'Critical' },
                { level: 'High' },
                { level: 'Medium' },
                { level: 'Low' }
              ].map(({ level }) => {
                let activeStyles = '';
                let dotColor = '';
                
                if (level === 'Critical') {
                  activeStyles = 'border-red-500 bg-red-50 text-red-700';
                  dotColor = 'bg-red-500';
                } else if (level === 'High') {
                  activeStyles = 'border-orange-500 bg-orange-50 text-orange-700';
                  dotColor = 'bg-orange-500';
                } else if (level === 'Medium') {
                  activeStyles = 'border-yellow-500 bg-yellow-50 text-yellow-700';
                  dotColor = 'bg-yellow-500';
                } else {
                  activeStyles = 'border-green-500 bg-green-50 text-green-700';
                  dotColor = 'bg-green-500';
                }

                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      setPriority(level)
                      saveProjectDetails({ priority: level })
                    }}
                    className={`flex-1 py-2 px-4 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 min-w-[120px] outline-none ${
                      priority === level
                        ? activeStyles
                        : 'border-border-subtle bg-surface-base hover:bg-surface-container-low text-on-surface-variant'
                    }`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
                    {level}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ADVANCED SETTINGS TOGGLE */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border-subtle"></div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1 hover:text-primary transition-colors outline-none"
        >
          <Icon name={showAdvanced ? "expand_less" : "expand_more"} size={16} />
          {showAdvanced ? "Hide Advanced Settings" : "Show Advanced Settings"}
        </button>
        <div className="flex-1 h-px bg-border-subtle"></div>
      </div>

      {/* ADVANCED SETTINGS ACCORDION */}
      {showAdvanced && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
          
          <section className="space-y-5">
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-2">
              <Icon name="tune" size={16} /> Extended Configuration
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase" htmlFor="business-unit">Business Unit</label>
                <select
                  id="business-unit"
                  className="w-full bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs outline-none"
                  value={formData.businessUnit}
                  onChange={(e) => handleInputChange('businessUnit', e.target.value)}
                  onBlur={handleInputBlur}
                >
                  <option>Retail</option>
                  <option>Financial Services</option>
                  <option>Healthcare</option>
                  <option>Manufacturing</option>
                  <option>Technology</option>
                  <option>Public Sector</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase" htmlFor="billing-currency">Billing Currency</label>
                <select
                  id="billing-currency"
                  className="w-full bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs outline-none"
                  value={formData.billingCurrency}
                  onChange={(e) => handleInputChange('billingCurrency', e.target.value)}
                  onBlur={handleInputBlur}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase" htmlFor="engagement-model">Engagement Model</label>
                <select
                  id="engagement-model"
                  className="w-full bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs outline-none"
                  value={formData.engagementModel}
                  onChange={(e) => handleInputChange('engagementModel', e.target.value)}
                  onBlur={handleInputBlur}
                >
                  <option>Fixed Price</option>
                  <option>Time & Material</option>
                  <option>Dedicated Team</option>
                  <option>Retainer</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase" htmlFor="expected-budget">Expected Budget</label>
                <input
                  id="expected-budget"
                  type="number"
                  placeholder="Optional budget limit"
                  className="w-full bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs outline-none"
                  value={formData.expectedBudget}
                  onChange={(e) => handleInputChange('expectedBudget', e.target.value)}
                  onBlur={handleInputBlur}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase" htmlFor="delivery-model">Delivery Model</label>
                <select
                  id="delivery-model"
                  className="w-full bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs outline-none"
                  value={formData.deliveryModel}
                  onChange={(e) => handleInputChange('deliveryModel', e.target.value)}
                  onBlur={handleInputBlur}
                >
                  <option>Remote</option>
                  <option>Hybrid</option>
                  <option>Onsite</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase" htmlFor="project-status">Project Status</label>
                <select
                  id="project-status"
                  className="w-full bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs outline-none"
                  value={formData.projectStatus}
                  onChange={(e) => handleInputChange('projectStatus', e.target.value)}
                  onBlur={handleInputBlur}
                >
                  <option>Draft</option>
                  <option>Initiated</option>
                  <option>Kickoff</option>
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-2">
              <Icon name="domain" size={16} /> Sponsor Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase" htmlFor="sponsor-name">Sponsor Name</label>
                <input
                  id="sponsor-name"
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs outline-none"
                  value={formData.projectSponsorName}
                  onChange={(e) => handleInputChange('projectSponsorName', e.target.value)}
                  onBlur={handleInputBlur}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase" htmlFor="sponsor-desig">Designation</label>
                <input
                  id="sponsor-desig"
                  type="text"
                  placeholder="CTO"
                  className="w-full bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs outline-none"
                  value={formData.projectSponsorDesignation}
                  onChange={(e) => handleInputChange('projectSponsorDesignation', e.target.value)}
                  onBlur={handleInputBlur}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase" htmlFor="client-city">Client City</label>
                <input
                  id="client-city"
                  type="text"
                  placeholder="New York"
                  className="w-full bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs outline-none"
                  value={formData.clientCity}
                  onChange={(e) => handleInputChange('clientCity', e.target.value)}
                  onBlur={handleInputBlur}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase" htmlFor="client-country">Client Country</label>
                <input
                  id="client-country"
                  type="text"
                  placeholder="USA"
                  className="w-full bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs outline-none"
                  value={formData.clientCountry}
                  onChange={(e) => handleInputChange('clientCountry', e.target.value)}
                  onBlur={handleInputBlur}
                />
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-2">
              <Icon name="description" size={16} /> Business Context
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase" htmlFor="business-goal">Business Goal</label>
                <textarea
                  id="business-goal"
                  rows={2}
                  placeholder="Primary business objective"
                  className="w-full bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs resize-none outline-none"
                  value={formData.businessGoal}
                  onChange={(e) => handleInputChange('businessGoal', e.target.value)}
                  onBlur={handleInputBlur}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase" htmlFor="technical-scope">Technical Scope</label>
                <textarea
                  id="technical-scope"
                  rows={2}
                  placeholder="Systems and technologies in scope"
                  className="w-full bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs resize-none outline-none"
                  value={formData.technicalScope}
                  onChange={(e) => handleInputChange('technicalScope', e.target.value)}
                  onBlur={handleInputBlur}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase" htmlFor="success-criteria">Success Criteria</label>
                <textarea
                  id="success-criteria"
                  rows={2}
                  placeholder="How will success be measured?"
                  className="w-full bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs resize-none outline-none"
                  value={formData.successCriteria}
                  onChange={(e) => handleInputChange('successCriteria', e.target.value)}
                  onBlur={handleInputBlur}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase" htmlFor="dependencies">Dependencies</label>
                <textarea
                  id="dependencies"
                  rows={2}
                  placeholder="External teams, APIs, or data"
                  className="w-full bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs resize-none outline-none"
                  value={formData.dependencies}
                  onChange={(e) => handleInputChange('dependencies', e.target.value)}
                  onBlur={handleInputBlur}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase" htmlFor="known-constraints">Known Constraints</label>
                <textarea
                  id="known-constraints"
                  rows={2}
                  placeholder="Budget limits, deadlines, legacy systems"
                  className="w-full bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs resize-none outline-none"
                  value={formData.knownConstraints}
                  onChange={(e) => handleInputChange('knownConstraints', e.target.value)}
                  onBlur={handleInputBlur}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-on-surface-variant font-bold uppercase" htmlFor="special-instructions">Special Instructions</label>
                <textarea
                  id="special-instructions"
                  rows={2}
                  placeholder="Delivery team instructions"
                  className="w-full bg-surface-base border border-border-subtle rounded px-2.5 py-1.5 text-xs resize-none outline-none"
                  value={formData.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  onBlur={handleInputBlur}
                />
              </div>
            </div>
          </section>

        </div>
      )}

    </div>
  );
};
