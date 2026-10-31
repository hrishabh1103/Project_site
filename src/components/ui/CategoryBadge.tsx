import React from 'react';
import { ProjectCategory } from '../../types';
import { Briefcase, User, Cpu, Globe, Smartphone, FlaskConical, GraduationCap } from 'lucide-react';

export const CategoryBadge: React.FC<{ category: ProjectCategory; className?: string }> = ({
  category,
  className = '',
}) => {
  const getIconAndStyle = () => {
    switch (category) {
      case 'Client Projects':
        return {
          icon: <Briefcase className="w-3.5 h-3.5 text-purple-500" />,
          style: 'bg-purple-500/10 text-purple-600 dark:text-purple-300 border-purple-500/20',
        };
      case 'Personal Projects':
        return {
          icon: <User className="w-3.5 h-3.5 text-blue-500" />,
          style: 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border-blue-500/20',
        };
      case 'AI & Machine Learning':
        return {
          icon: <Cpu className="w-3.5 h-3.5 text-emerald-500" />,
          style: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
        };
      case 'Web Applications':
        return {
          icon: <Globe className="w-3.5 h-3.5 text-cyan-500" />,
          style: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 border-cyan-500/20',
        };
      case 'Mobile Applications':
        return {
          icon: <Smartphone className="w-3.5 h-3.5 text-pink-500" />,
          style: 'bg-pink-500/10 text-pink-600 dark:text-pink-300 border-pink-500/20',
        };
      case 'Experimental Projects':
        return {
          icon: <FlaskConical className="w-3.5 h-3.5 text-amber-500" />,
          style: 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/20',
        };
      case 'Academic Projects':
        return {
          icon: <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />,
          style: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-500/20',
        };
      default:
        return {
          icon: <Globe className="w-3.5 h-3.5 text-slate-500" />,
          style: 'bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20',
        };
    }
  };

  const { icon, style } = getIconAndStyle();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${style} ${className}`}
    >
      {icon}
      {category}
    </span>
  );
};
