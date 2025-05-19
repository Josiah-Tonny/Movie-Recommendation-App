import React, { useState } from 'react';
import { X, Copy, CheckCircle, Facebook, Twitter, Mail, MailCheck } from 'lucide-react';
import { copyToClipboard, generateShareLinks } from '../utils/sharing';

interface ShareDialogProps {
  title: string;
  url: string;
  onClose: () => void;
}

/**
 * ShareDialog Component
 * 
 * A reusable dialog for sharing content on different platforms
 */
const ShareDialog: React.FC<ShareDialogProps> = ({ title, url, onClose }) => {
  const [copied, setCopied] = useState(false);
  const shareLinks = generateShareLinks(url, title);
  
  const handleCopyLink = async () => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-md p-6 bg-gray-800 rounded-lg shadow-xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold mb-4">Share</h2>
        <p className="text-gray-300 text-sm mb-6 truncate">
          {title}
        </p>
        
        {/* Copy link section */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 p-3 bg-gray-700 rounded-lg">
            <input
              type="text"
              value={url}
              readOnly
              className="flex-1 bg-transparent border-none text-gray-300 text-sm focus:outline-none focus:ring-0"
            />
            <button
              onClick={handleCopyLink}
              className={`p-1.5 rounded-md ${copied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
              aria-label="Copy link"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-white" />
              ) : (
                <Copy className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
          {copied && (
            <p className="text-green-400 text-xs mt-2 flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" />
              Link copied to clipboard!
            </p>
          )}
        </div>
        
        {/* Share buttons */}
        <div className="grid grid-cols-3 gap-3">
          <a
            href={shareLinks.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 bg-blue-900 hover:bg-blue-800 rounded-lg text-white transition-colors"
            aria-label="Share on Facebook"
          >
            <Facebook className="w-5 h-5 mb-1" />
            <span className="text-xs">Facebook</span>
          </a>
          
          <a
            href={shareLinks.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 bg-sky-900 hover:bg-sky-800 rounded-lg text-white transition-colors"
            aria-label="Share on Twitter"
          >
            <Twitter className="w-5 h-5 mb-1" />
            <span className="text-xs">Twitter</span>
          </a>
          
          <a
            href={shareLinks.email}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
            aria-label="Share via Email"
          >
            <Mail className="w-5 h-5 mb-1" />
            <span className="text-xs">Email</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ShareDialog;
