import {Iconbutton} from "@/app/components/iconbutton"
import Image from "next/image"
import newchat from "image/newchat.png"
import seach from "image/seach.png"
import bookmark from "image/bookmark.png"

export function Sidebar() {
  return (
    <div className="h-screen w-16 bg-[#e9e9e9] text-black flex-col justify-normal">
        <Iconbutton title="newcaht" ></Iconbutton>
        <Iconbutton title="search" ></Iconbutton>
        <Iconbutton title="bookmark" ></Iconbutton>
    </div> 
  );
};