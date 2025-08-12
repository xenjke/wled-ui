import { useState } from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";

type AddBoardModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddBoard: (ip: string) => void;
};

export const AddBoardModal = ({
  isOpen,
  onClose,
  onAddBoard,
}: AddBoardModalProps) => {
  const [ip, setIp] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ip.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
      onAddBoard(ip);
      setIp("");
    } else {
      alert("Please enter a valid IP address.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Add WLED Device by IP</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            className="w-full p-2 rounded-md bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 192.168.1.123"
          />
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button type="submit">Add Device</Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
