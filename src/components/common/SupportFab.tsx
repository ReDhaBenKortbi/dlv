import { useState } from "react";
import {
  MessageCircle,
  X,
  Facebook,
  Instagram,
  Mail,
  HelpCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const SupportFab = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  // Replace with actual client links
  const socialLinks = [
    {
      icon: <Facebook size={20} />,
      href: "https://facebook.com",
      color: "bg-[#1877F2]",
    },
    {
      icon: <Instagram size={20} />,
      href: "https://instagram.com",
      color: "bg-[#E4405F]",
    },
    {
      icon: <Mail size={20} />,
      href: "mailto:contact@example.com",
      color: "bg-gray-600",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Expanded Actions */}
      <div
        className={`flex flex-col gap-3 transition-all duration-300 ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}`}
      >
        {/* Help / Support Page Button */}
        <Link
          to="/support"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-3 bg-primary text-primary-content px-4 py-2 rounded-full shadow-lg hover:bg-primary-focus transition-colors"
        >
          <span className="font-bold text-sm">Need Help?</span>
          <HelpCircle size={20} />
        </Link>

        {/* Social Icons */}
        <div className="flex flex-col items-end gap-3">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className={`w-10 h-10 flex items-center justify-center rounded-full text-white shadow-md hover:scale-110 transition-transform ${link.color}`}
            >
              {link.icon}
            </a>
          ))}
        </div>
      </div>

      {/* Main Toggle Button */}
      <button
        onClick={toggleOpen}
        className={`btn btn-circle btn-lg shadow-xl border-none transition-all duration-300 ${isOpen ? "btn-error rotate-90" : "btn-neutral"}`}
      >
        {isOpen ? <X size={32} /> : <MessageCircle size={32} />}
      </button>
    </div>
  );
};

export default SupportFab;
