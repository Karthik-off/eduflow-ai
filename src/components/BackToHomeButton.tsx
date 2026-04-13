import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Home } from 'lucide-react';

interface BackToHomeButtonProps {
  className?: string;
  variant?: 'navbar' | 'floating' | 'breadcrumb';
}

const BackToHomeButton: React.FC<BackToHomeButtonProps> = ({ 
  className = '', 
  variant = 'navbar' 
}) => {
  const navigate = useNavigate();
  const { role } = useAuthStore();

  const handleClick = () => {
    // Navigate to appropriate home based on user role
    switch (role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'staff':
        navigate('/staff/dashboard');
        break;
      case 'student':
      default:
        navigate('/dashboard');
        break;
    }
  };

  // Add keyboard shortcut for 'H' key
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only trigger 'H' key shortcut if not in an input field
      if (
        event.key.toLowerCase() === 'h' && 
        !event.ctrlKey && 
        !event.metaKey && 
        !event.altKey &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement) &&
        !(event.target instanceof HTMLSelectElement)
      ) {
        event.preventDefault();
        // Navigate to appropriate home based on user role
        switch (role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'staff':
            navigate('/staff/dashboard');
            break;
          case 'student':
          default:
            navigate('/dashboard');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [navigate, role]);

  const baseClasses = "flex items-center space-x-2 transition-all duration-200 hover:scale-105";

  const variantClasses = {
    navbar: "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer md:flex hidden",
    floating: "fixed bottom-6 left-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg z-40 md:hidden flex",
    breadcrumb: "text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
  };

  const iconSizes = {
    navbar: "w-5 h-5",
    floating: "w-5 h-5", 
    breadcrumb: "w-4 h-4"
  };

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      title="Go to Dashboard (Press H key)"
      aria-label="Go to Dashboard"
    >
      <Home className={`${iconSizes[variant]} ${variant === 'floating' ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
      {variant === 'breadcrumb' && (
        <span>Home</span>
      )}
      {variant === 'floating' && (
        <span className="text-white font-medium text-sm">Home</span>
      )}
    </button>
  );
};

export default BackToHomeButton;
