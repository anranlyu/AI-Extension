import { createRoot } from "react-dom/client";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";

interface TTSFloatingCardProps {
    container: HTMLElement;
}

const TTSFloatingCard: React.FC<TTSFloatingCardProps> = ({ container }) => {
    return (
        <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl flex items-center gap-4 justify-between font-sans">
            {/* Play Button */}
            <button className="size-10 bg-white text-black p-2 rounded-full hover:bg-indigo-800 transition">
                ▶️
            </button>

            {/* Dropdown Menu */}
            <Menu as="div" className="relative inline-block text-left">
                <div>
                    <MenuButton className="inline-flex items-center justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-gray-300 hover:bg-gray-100 transition">
                        Voice Agent
                    </MenuButton>
                </div>

                <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-indigo-100 ring-1 ring-black/5 shadow-lg z-20 focus:outline-none">
                    <div className="py-1">
                        {["Alloy (Default)", "Ballad", "Nova"].map((label) => (
                            <MenuItem key={label}>
                                {({ active }) => (
                                    <a
                                        href="#"
                                        className={`block px-4 py-2 text-sm ${active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                                            }`}
                                    >
                                        {label}
                                    </a>
                                )}
                            </MenuItem>
                        ))}
                    </div>
                </MenuItems>
            </Menu>
        </div>
    );
};

export default TTSFloatingCard;
