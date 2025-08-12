import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { WLEDBoard } from '../types/wled';

interface AddBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (board: WLEDBoard) => void;
}

export const AddBoardModal: React.FC<AddBoardModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [formData, setFormData] = useState({
    name: '',
    ip: '',
    port: '80'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.ip.trim()) {
      newErrors.ip = 'IP address is required';
    } else {
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipRegex.test(formData.ip)) {
        newErrors.ip = 'Invalid IP address format';
      }
    }

    if (formData.port) {
      const port = parseInt(formData.port);
      if (isNaN(port) || port < 1 || port > 65535) {
        newErrors.port = 'Port must be between 1 and 65535';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const board: WLEDBoard = {
        id: `manual-${Date.now()}`,
        name: formData.name.trim(),
        ip: formData.ip.trim(),
        port: formData.port ? parseInt(formData.port) : 80,
        lastSeen: new Date(),
        isOnline: false,
        syncEmit: false,
        syncReceive: false
      };

      onAdd(board);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({ name: '', ip: '', port: '80' });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Add WLED Board</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="boardName" className="block text-sm font-medium text-gray-700 mb-2">
              Board Name *
            </label>
            <input
              type="text"
              id="boardName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., Living Room LEDs"
            />
            {errors.name && (
              <div className="flex items-center mt-1 text-sm text-red-600">
                <AlertCircle size={14} className="mr-1" />
                {errors.name}
              </div>
            )}
          </div>

          {/* IP Address Field */}
          <div>
            <label htmlFor="boardIp" className="block text-sm font-medium text-gray-700 mb-2">
              IP Address *
            </label>
            <input
              type="text"
              id="boardIp"
              value={formData.ip}
              onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.ip ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="192.168.1.100"
            />
            {errors.ip && (
              <div className="flex items-center mt-1 text-sm text-red-600">
                <AlertCircle size={14} className="mr-1" />
                {errors.ip}
              </div>
            )}
          </div>

          {/* Port Field */}
          <div>
            <label htmlFor="boardPort" className="block text-sm font-medium text-gray-700 mb-2">
              Port (optional)
            </label>
            <input
              type="text"
              id="boardPort"
              value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: e.target.value })}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.port ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="80"
            />
            {errors.port && (
              <div className="flex items-center mt-1 text-sm text-red-600">
                <AlertCircle size={14} className="mr-1" />
                {errors.port}
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">Leave empty for default port 80</p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Board</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
