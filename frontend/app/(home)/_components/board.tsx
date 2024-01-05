import React from "react";

import { cn } from "@/lib/utils";
import boardInfo from "@/public/data/board.json";
import Image from "next/image";

interface BoardProps extends React.HTMLProps<HTMLDivElement> {}

const Board: React.FC<BoardProps> = ({ ...props }) => {
  let icons_path = "/images/icons/";
  return (
    <div
      className={cn("container flex flex-col justify-center", props.className)}
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold">Our Board</h1>
      </div>
      <div className="mt-12 grid grid-cols-1 gap-4 px-4 md:grid-cols-3">
        {boardInfo.members.map((member, index) => {
          return (
            <div
              className="flex flex-row items-center gap-5 rounded-md bg-neutral-100 p-4 py-5"
              key={index}
            >
              <div className="rounded-lg bg-primary p-4">
                <Image
                  alt="icons"
                  width={16}
                  height={16}
                  src={icons_path + member.icon + ".svg"}
                />
              </div>
              <div className="flex flex-col rounded-md">
                <h1 className="text-xl font-bold text-neutral-900">
                  {member.name} {member.surname}
                </h1>
                <h2 className="font-semibold text-primary">
                  {member.position}
                </h2>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Board;
