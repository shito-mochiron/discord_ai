import Image from "next/image"

type IconbuttonProps = {
  title: string;
}

export function Iconbutton({ title }: IconbuttonProps) {
    return (
        <button
          className="flex space-y-4 p-2 hover:bg-gray-700 justify-center">
          <span className="text-xs text-balck">{title}</span>
        </button>
    );
};