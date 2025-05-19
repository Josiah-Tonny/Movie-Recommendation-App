import React from 'react';
import { AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = <AlertCircle className="w-16 h-16 mx-auto text-gray-600 mb-4" />,
  action
}) => {
  return (
    <div className="text-center py-20 bg-gray-800/50 rounded-lg">
      {icon}
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400 mb-6">
        {description}
      </p>
      {action}
    </div>
  );
};

export default EmptyState;